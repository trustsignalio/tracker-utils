const _ = require("lodash");

class StringMethods {
	constructor() {}

	static makePrimaryKey(obj, groupBy = []) {
		pieces = [];
		_.each(groupBy, (g) => {
			var v = '';
			if (obj[g] && _.isString(obj[g]) && _.size(obj[g]) == 0) {
				v = ' ';
			} else {
				v = obj[g] || ' ';
			}
			pieces.push(v);
		});
		return _.join(pieces, "_XX_");
	}

}

module.exports = StringMethods;