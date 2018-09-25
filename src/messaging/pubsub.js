const PubsubClient = require('@google-cloud/pubsub');

class PubSub {
	constructor(config) {
		this.project = config.project;
		this.topic = config.topic;
		this._client = new PubsubClient({
			projectId: this.project
		})
	}

	async send(message) {
		const dataBuffer = Buffer.from(data);
		// TODO: retry if failed?
		let messageId = await this._client.topic(this.topic).publisher().publish(dataBuffer)
		return messageId;
	}
}

module.exports = PubSub;