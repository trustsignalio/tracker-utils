let Memcached = require('memcached');
let Promise = require('bluebird');

let DEFAULT_PREFIX = "Cache_JS_";
let DEFAULT_TIMEOUT = 10 * 60; // 10 minutes
let DEFAULT_SERVER = '127.0.0.1:11211';

/**
 * @package Cloudstuff Tracker Utils
 * @module Cache
 * @version 1.0
 * @author Hemant Mann <hemant.mann@vnative.com>
 */
class Cache {
  /**
   * Constructor for cache class
   * 
   * This class provides a basic wrapper for setting objects into cache and
   * retrieving objects from the cache. If options are not provided then class
   * is initialized with default settings
   * @param  {Object} opts Options object valid properties: {prefix: String, timeout: Number (seconds), server: String (Host:port)}
   * @return {this}      Object of this class
   */
  constructor(opts) {    
    if (typeof opts === "object") {
      this.prefix = opts.prefix || DEFAULT_PREFIX;
      this.timeout = opts.timeout || DEFAULT_TIMEOUT;
      this._memcached = new Memcached(opts.server || DEFAULT_SERVER);
    } else {    // initialize with defaults
      this.prefix = DEFAULT_PREFIX;
      this.timeout = DEFAULT_TIMEOUT;
      this._memcached = new Memcached(DEFAULT_SERVER);
    }
  }

  /**
   * Modify the cache key by adding a prefix so that chances of collisions are less
   * in cases different instances of the class are used
   * @param  {String} name Name of the key
   * @return {String}      Modified cache key
   */
  getKey(name) {
    return this.prefix + ":" + name;
  }

  /**
   * Alias of this.set
   */
  async put(name, value, timeout) {
    return this.set(name, value, timeout);
  }

  /**
   * Set the provided value in cache with the corresponding key
   * @param {String} name    Name of the key
   * @param {Mixed} value   Any javascript object
   * @param {Number} timeout Cache time for the object (optional if not provided then default one will be used)
   */
  async set(name, value, timeout) {
    let self = this;
    return new Promise(resolve => {
      self._memcached.set(self.getKey(name), value, timeout || self.timeout, function (err) {
        if (err) {
          return resolve(false);
        }
        resolve(true);
      })
    })
  }

  /**
   * Get the value from Cache
   * @param  {String} name Name of the key
   * @return {Mixed}      Undefined on not found
   */
  async get(name) {
    let self = this;
    return new Promise(resolve => {
      self._memcached.get(self.getKey(name), function (err, data) {
        resolve(data);
      })
    })
  }

  async delete(name) {
    let self = this;
    return new Promise(resolve => {
      self._memcached.del(self.getKey(name), function (err) {
        if (err) {
          return reject(err);
        }
        resolve(true);
      })
    })
  }
}

module.exports = Cache;
