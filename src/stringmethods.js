const _ = require("lodash");

class StringMethods {
	constructor() {}

	static makePrimaryKey(obj, groupBy = []) {
		let pieces = [];
		_.each(groupBy, (g) => {
			pieces.push(obj[g] || ' ');
		});
		return _.join(pieces, "_XX_");
	}

}

module.exports = StringMethods;