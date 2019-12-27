let util = require('util');
let mongoose = require('mongoose');

class DbUtil {
	/**
	 * Connection String method makes a mongodb connection string based on the config object
	 * @param  {Object} config {host: String, user: String, password: String, options: string, database: String}
	 * @return {String}
	 */
	connectionStr(config) {
		return util.format('mongodb://%s:%s@%s/%s?%s', config.user, config.password, config.host, config.database, config.options);
	}

	createConnection(config) {
		let str = this.connectionStr(config);
		return mongoose.createConnection(str, { useNewUrlParser: true });
	}
}

module.exports = new DbUtil;