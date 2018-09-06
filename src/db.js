let Cache = require('./cache');
let Security = require('./security');

/**
 * @package Cloudstuff Tracker Utils
 * @module Db
 * @version 1.0
 * @author Hemant Mann <hemant.mann@vnative.com>
 */
class Db {
	constructor(conn) {
		this.conn = conn || null;
		// Each DB object will be long lived so we are generating a new cache object each
		// time with a random prefix to reduce the work of the User
		this.cache = new Cache({prefix: Security.id()});
		this.models = {};
	}

	/**
	 * Registers a model on the connection if not already registered
	 * @param {String}			name Name of the model
	 * @param {Mongoose.Schema} schema Model Schema
	 */
	setModel(name, schema) {
		if (typeof this.models[name] === "undefined") {
			this.models[name] = this.conn.model(name, schema);
		}
	}

	/**
	 * Get the model from the model MAP
	 * @param {String} name Name of the model
	 */
	getModel(name) {
		return this.models[name];
	}

	/**
	 * Store the connection object which will be used to make query to the database
	 * @param {Mongoose.Connection} obj
	 */
	setConn(obj) {
		this.conn = obj
	}

	/**
	 * Get the Cache Key for based on the model, query and fields supplied to the
	 * function by generating a signature with combination of all three
	 * @param  {String} model  Name of the Model
	 * @param  {Object} query  Query object which will be passed to mongodb
	 * @param  {String} fields List of fields separated by "space"
	 * @return {String}        Unique Cache Key
	 */
	getCacheKey(model, query, fields) {
		let qstr = JSON.stringify(query);	// IT Does NOT ENCODE REGEX
		let key = `${model}:${qstr}`;
		if (fields) {
			key += ":" + fields;
		}
		return "CC:" + Security.md5(key);
	}

	/**
	 * Query the database model with the provided query
	 * @param  {String} m     Model Name
	 * @param  {Object} query Query obj
	 * @return {Object|null}       Result returned by the driver
	 */
	async first(m, query) {
		return this.conn.model(m).findOne(query).lean().exec();
	}

	/**
	 * Check the cache for the object by making the unique cache if not found then
	 * Query the database model with the provided query and also set the obj in cache
	 * @param  {Number} t     Time in seconds for the which the object is to be cached if found
	 */
	async _cacheFirst(m, q, t) {
		let cacheKey = this.getCacheKey(m, q);
		let cacheObj = await this.cache.get(cacheKey);
		if (cacheObj === undefined) {
			cacheObj = await this.first(m, q);
			await this.cache.set(cacheKey, cacheObj, t)
		}
		return cacheObj;
	}

	/**
	 * Public wrapper for the private method
	 */
	async cacheFirst(model, query) {
		return this._cacheFirst(model, query);
	}

	/**
	 * Public wrapper for the private method
	 * It should get the element from cache and if not set in cache then query the database
	 * and set the obj in cache for specified "timeout" seconds
	 */
	async cacheFirstWithTime(model, query, timeout) {
		return this._cacheFirst(model, query, timeout);
	}

	/**
	 * Query the database model with the provided query
	 * @param  {String} fields     Fields string separated by " "
	 * @return {Array}       Result returned by the driver
	 */
	async findAll(m, q, fields) {
		return this.conn.model(m).find(q, fields).lean().exec();
	}

	/**
	 * Check the cache for the object by making the unique cache if not found then
	 * Query the database model with the provided query and also set the obj in cache
	 * @param  {String} f     Fields string separated by " "
	 * @param  {Number} t     Time in seconds for the which the object is to be cached if found
	 */
	async _cacheAll(m, q, f, t) {
		let cacheKey = this.getCacheKey(m, q, f) + "_all";	// add suffix so as to distinguise between cache first and cacheall key if rest of parameters are the same
		let cacheObj = await this.cache.get(cacheKey);
		if (cacheObj === undefined) {
			cacheObj = await this.findAll(m, q, f);
			await this.cache.set(cacheKey, cacheObj, t);
		}
		return cacheObj;
	}

	/**
	 * Public wrapper for the private method
	 */
	async cacheAll(model, query, fields) {
		return this._cacheAll(model, query, fields);
	}

	/**
	 * Public wrapper for the private method
	 * It should get the elements from cache and if not set in cache then query the database
	 * and set the obj in cache for specified "timeout" seconds
	 */
	async cacheAllWithTime(model, query, fields, timeout) {
		return this._cacheAll(model, query, fields, timeout);
	}
}

module.exports = Db;
