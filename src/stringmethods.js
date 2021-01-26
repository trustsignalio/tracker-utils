const _ = require("lodash");
let util = require('util');

class StringMethods {
	constructor() {}

	static makePrimaryKey(obj, groupBy = []) {
		let pieces = [];
		_.each(groupBy, (g) => {
			pieces.push(obj[g] || ' ');
		});
		return _.join(pieces, "_XX_");
	}

	static sprintf(format, ...args) {
		return util.format(format, ...args)
	}

	static addslashes(val) {
		val = _.replace(val, "'", "\\'");
		val = _.replace(val, '"', '\\"');
		val = _.replace(val, '\\', "\\\\");
		return val;
	}

	static escapeSqlStr(val) {
		return this.sprintf("'%s'", this.addslashes(val));
	}

}

module.exports = StringMethods;