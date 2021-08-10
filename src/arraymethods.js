const _ = require("lodash");

class ArrayMethods {
	constructor() {}

	static removeKeys(data, keysToRemove = []) {
		_.each(keysToRemove, (key) => {
			delete data[key];
		});
		return data;
	}

	static add(from, to) {
		_.each(from, (value, key) => {
			if (to[key]) {
				to[key] += parseFloat(value);
			} else {
				to[key] = parseFloat(value);
			}
		});
		return to;
	}
	
	static remove(key, arr) {
		let index = arr.indexOf(key);
		if (index > -1) {
			arr.splice(index, 1);
		}
		return arr;
	}
}

module.exports = ArrayMethods;