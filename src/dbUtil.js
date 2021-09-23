let util = require('util');
let mongoose = require('mongoose');
let _ = require('lodash');

class DbUtil {
	/**
	 * Connection String method makes a mongodb connection string based on the config object
	 * @param  {Object} config {host: String, user: String, password: String, options: string, database: String}
	 * @return {String}
	 */
	connectionStr(config) {
		if (_.size(config.user) == 0) {
			return util.format('mongodb://%s/%s?%s', config.host, config.database, config.options);
		}
		return util.format('mongodb://%s:%s@%s/%s?%s', config.user, config.password, config.host, config.database, config.options);
	}

	createConnection(connectionStr, certFileBuf) {
		return mongoose.createConnection(connectionStr, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true, poolSize: config.poolSize || 5, replset: { sslCA: certFileBuf } });
	}

	generateMongoId() {
		return mongoose.Types.ObjectId();
	}

	convertToMongoId(id) {
		return new mongoose.Types.ObjectId(id);
	}
}

module.exports = new DbUtil;
