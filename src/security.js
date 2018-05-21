let crypto = require('crypto');
let shortid = require('shortid');
const isIp = require('is-ip');

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

  /**
   * Remove the last octet from the IP Address for privacy reasons
   * @param  {String} ipaddr IPV4 or IPV6 compliant IP Address
   * @return {String}        Modified IP
   */
  maskIp(ipaddr) {
    if (isIp(ipaddr)) {
      if (isIp.v4(ipaddr)) {
        let parts = ipaddr.split(".");
        parts[parts.length - 1] = "0";

        ipaddr = parts.join('.');
      } else if (isIp.v6(ipaddr)) {
        let parts = ipaddr.split(":");
        parts[parts.length - 1] = "0000";

        ipaddr = parts.join(':');
      }
    }
    return ipaddr;
  }
}

module.exports = new Security;