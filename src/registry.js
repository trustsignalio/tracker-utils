/**
 * This class is used to cache objects for the lifetime of application so that they
 * can be passed an used in multiple scopes instead of relying on the underlying
 * framework to do that for us
 *
 * @package Cloudstuff Tracker Utils
 * @module Registry
 * @version 1.0
 * @author Hemant Mann <hemant.mann@vnative.com>
 */
class Registry {
  constructor() {
    this.prefix = "Reg:";
    this._map = {};
  }

  /**
   * Get the modified with added prefix
   * @param  {String} name Name of the key
   * @return {String}
   */
  getKey(name) {
    return this.prefix + name;
  }

  /**
   * Get the Key from class map
   * @param  {String} name Key name
   * @param  {Mixed} def  Value to be returned in case value is not set in map
   * @return {Mixed}      Value for the corresponding key
   */
  get(name, def) {
    let key = this.getKey(name);
    return this._map[key] || def;
  }

  /**
   * Set the key in class map
   * @param {String} name  Name of key
   * @param {Mixed} value Value to be set for key
   */
  set(name, value) {
    let key = this.getKey(name);
    this._map[key] = value;
  }
}

module.exports = new Registry;
