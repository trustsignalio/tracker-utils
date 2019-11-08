const {PubSub} = require('@google-cloud/pubsub');
let Promise = require('bluebird');

class PubSubLib {
	constructor(config) {
		this.project = config.project;
		this.topic = config.topic;
		this._client = new PubSub({
			projectId: this.project
		})
		if (config.subscription) {
			this._subscription = this._client.subscription(config.subscription);
			this._handler = config.handler;
		}
	}

	/**
	 * Call this function to sleep for a given milliseconds
	 * @param  {Number} ms time in milliseconds
	 * @return {Promise}
	 */
	async sleep(ms) {
		return new Promise(resolve => {
			setTimeout(() => resolve(true), ms);
		})
	}

	/**
	 * Send message to the pub sub channel
	 * @param  {String} message The string message to be transferred over the channel
	 * @return {String}         Message ID on success
	 * @throws {Error} If failed to send message to pub sub
	 */
	async send(message) {
		const dataBuffer = Buffer.from(message);
		for (let i = 1; i <= 5; i++) {
			try {
				let messageId = await this._client.topic(this.topic).publisher().publish(dataBuffer);
				return messageId;
			} catch (e) {	// retry once again with exponential fallback
				await this.sleep(i * 100);
			}
		}
		let sendError = new Error('Failed to send message to pub/sub');
		sendError.data = message;
		throw sendError;
	}

	/**
	 * Receive method gets the data from pub sub and calls the callback when each message
	 * is received by the client so that client can acknowledge the message
	 * @throws {Error} If Subscription or handler is invalid
	 */
	async receive() {
		if (! this._subscription) {
			throw new Error("Subscription not found in config!!");
		}
		if (typeof this._handler !== "function") {
			throw new Error("Invalid message handler supplied")
		}
		this._subscription.on('message', async (message) => {
			await this._handler(message);
		})
	}

	async closeSub() {
		this._subscription.removeListener('message', this._handler);
	}
}

module.exports = PubSubLib;
