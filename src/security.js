let crypto = require('crypto');
let shortid = require('shortid');

/**
 * @package Cloudstuff Tracker Utils
 * @module Security
 * @version 1.0
 * @author Hemant Mann <hemant.mann@vnative.com>
 */
class Security {
  constructor() {}

  /**
   * Generate a unique random id of length 7-14 characters
   * @return {String} URL friendly ID
   */
  id() {
    return shortid.generate();
  }

  /**
   * Generate an MD5 Hash of the given string
   * @param  {String} str String to be hashed
   * @return {String}
   */
  md5(str) {
    return crypto.createHash('md5').update(str).digest("hex");
  }
}

module.exports = new Security;