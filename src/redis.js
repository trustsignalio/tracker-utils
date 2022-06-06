let _ = require('lodash');
let redis = require('redis');
let Promise = require('bluebird');

/**
 * Objects of this class are used to connect to redis and execute redis commands
 * @package Cloudstuff Tracker Utils
 * @module Redis
 * @since 1.0.1
 * @author Hemant Mann <hemant.mann@vnative.com>
 */
class Redis {
	/**
	 * Initialize a redis client based on the configuration provided
	 * @param  {Object} conf {user: string, password: string, host: string, port: string, db: string}
	 */
	constructor(conf) {
		let db = conf.db || 0;
		let clientOpts = { host: conf.host, no_ready_check: true, db: db };
		if (conf.password) {
			clientOpts.auth_pass = conf.password;
		}
		this.client = redis.createClient(clientOpts);

		this.client.on('error', (err) => {
			console.log('Error: Redis.CLIENT - ' + err, conf.host);
		})
	}

	getMulti() {
		return this.client.multi();
	}

	async zrangebyscore(...args) {
		return this._execute('zrangebyscore', ...args);
	}
	/**
	 * Execute Raw Command 
	 */
	async executeCommand(commandName, ...args) {
		return this._execute(commandName, ...args)
	}

	async hgetall(key) {
		return this._execute('hgetall', key);
	}

	async get(key) {
		return this._execute('get', key);
	}

	async set(key, value) {
		return this._execute('set', key, value);
	}

	async del(key) {
		return this._execute('del', key);
	}

	async pfadd(...args) {
		return this._execute('pfadd', ...args);
	}

	async hincrby(key, field, value, isFloat) {
		if (isFloat) {
			return this._execute('hincrbyfloat', key, field, value);
		} else {
			return this._execute('hincrby', key, field, value);
		}
	}

	async hget(key, field) {
		return this._execute('hget', key, field)
	}

	async hset(key, field, value) {
		return this._execute('hset', key, field, value)
	}

	async multiExecute(operations) {
		let multi = this.getMulti();
		_.each(operations, (args) => {
			let op = args[0];
			args.splice(0, 1);
			multi[op](...args)
		})
		return new Promise((resolve, reject) => {
			multi.exec((err, replies) => {
				if (err) {
					return reject(err)
				}
				resolve(replies)
			})
			setTimeout(() => {
				reject(new Error('Redis timed out after 1000 ms'));
			}, 1000)
		})
	}

	/**
	 * @since 1.0.4
	 * @param {...String} args String array
	 */
	async PFADD(...args) {
		this.client.pfadd(...args)
	}

	/**
	 * Increment a hash map field in redis and dont wait for server reply
	 * @param {String} key   Key name in redis
	 * @param {String} field Hash map field in redis
	 * @param {Number} value Value to be incremented by
	 *
	 * @since 1.0.4
	 */
	async HINCRBY(key, field, value) {
		this.client.hincrby(key, field, value);
	}

	/**
	 * Increment a hash map floating point field in redis and dont wait for server reply
	 * @param {String} key   Key name in redis
	 * @param {String} field Hash map field in redis
	 * @param {Number} value Value to be incremented by
	 *
	 * @since 1.0.4
	 */
	async HINCRBYFLOAT(key, field, value) {
		this.client.hincrbyfloat(key, field, value);
	}

	/**
	 * ZADD method will add the member with the given score to the sorted set
	 * @param {String} key    Sorted set key name
	 * @param {Number} score  Score for the member
	 * @param {String} member Member ID
	 */
	async ZADD(key, score, member) {
		this.client.zadd(key, score, member);
	}

	/**
	 * Set Expiration time on a key
	 * @param {String} key Name of the key
	 * @param {Number} t   Time in seconds
	 */
	async EXPIRE(key, t) {
		this.client.expire(key, t)
	}

	/**
	 * Get the TTL of a key
	 * @param  {String} key Name of the key
	 * @return {Number}
	 */
	async ttl(key) {
		return this._execute('ttl', key);
	}

	/**
	 * All the public function call this function to execute the redis commands
	 * @param  {...String} args List of arguments to the function
	 * @return {Promise}         Client should await the result of promise and use try catch for error handling
	 */
	async _execute(...args) {
		let client = this.client,
			method = args[0];

		args.splice(0, 1);

		return new Promise((resolve, reject) => {
			client[method](...args, (err, response) => {
				if (err) {
					return reject(err);
				}
				resolve(response);
			})

			setTimeout(() => {
				reject(new Error('Redis timed out after 1000 ms'));
			}, 1000)
		})
	}
}

module.exports = Redis;
