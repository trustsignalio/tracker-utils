let _ = require('lodash');

/**
 * This class calculates the distribution of traffic based by using redis to calculate
 * the traffic percentage to be sent to different objects
 * @package Cloudstuff Tracker Utils
 * @module Traffic Distribution
 * @since 1.0.3
 * @author Hemant Mann <hemant.mann@vnative.com>
 */
class TrafficDistribution {
	/**
	 * Constructor
	 * @param  {Redis} redis       Redis object to execute commands
	 * @param  {Object} fractionMap { id: "1/2", id2: "1/4", id3: "1/4" }
	 */
	constructor(redis, fractionMap) {
		this.redis = redis;
		this.fractionMap = fractionMap;
		this.lcm = 1;

		this.calculateLcm();
	}

	/**
	 * Calculate LCM of two numbers
	 * @param  {Number} a Num 1
	 * @param  {Number} b Num 2
	 * @return {Number}   LCM of both
	 */
	calLcm(a, b) {
		let lcm = 1;
		let greater = (a > b) ? a : b;
		while (true) {
			if (greater % a == 0 && greater % b == 0) {
				lcm = greater
				break
			}
			greater += 1
		}
		return lcm;
	}

	/**
	 * Loop over the elements of the array and calculate the LCM of all
	 * the elements in array
	 * @param  {Array} arr [num1, num2, num3]
	 * @return {Number}     Final LCM
	 */
	lcmArr(arr) {
		let lcm = 1, self = this;
		_.each(arr, (v) => {
			lcm = self.calLcm(lcm, v);
		})
		return lcm;
	}

	/**
	 * Loop over the traffic map to calculate the LCM
	 */
	calculateLcm() {
		let numArr = [];
		_.each(this.fractionMap, (fraction) => {
			let parts = fraction.split("/");
			let denom = Number(parts[1]);
			numArr.push(denom); // we need denominator for LCM
		})
		this.lcm = this.lcmArr(numArr);
	}

	/**
	 * After getting the LCM modify all the numerators so that they have the
	 * same base, so that we can calculate what is the maximum number of hits
	 * can be sent to that particular object
	 * @return {Array} [{id: "someid", count: number}]
	 */
	_calTrafficAllocation() {
		let result = [], lcm = this.lcm;
		_.each(this.fractionMap, (fraction, id) => {
			let parts = fraction.split("/");
			let numerator = Number(parts[0]), denom = Number(parts[1]);
			let factor = lcm / denom;
			// Each object in results array contain the campaign and the max number of
			// hits it can accept from the group of campaigns
			result.push({ id: id, count: numerator * factor });
		})
		result = _.orderBy(result, ['count'], ['desc']);
		return result;
	}

	/**
	 * Loop over the results given this._calTrafficAllocation and increment counter
	 * for each object in redis then we have to check whether the object can accept
	 * traffic by comparing the counter for that object returned by redis to the
	 * counter alloted to this object based on results data if it is lesser then
	 * select that object ID else decrement the counter in redis because this
	 * object is not selected. If the overall counter in redis becomes more than
	 * the LCM then we have to send a reset command in redis to reset the counter
	 *
	 * @param  {String} redisKey Redis Key for the hash map (should be unique for each class object)
	 * @return {String|null}          Id of the object which is selected
	 */
	async allocateTraffic(redisKey) {
		let result = this._calTrafficAllocation();
		let operations = [];
		_.each(result, (obj) => {
			let redisField = `obj:${obj.id}:t`;
			operations.push(['hincrby', redisKey, redisField, 1]);
		})
		// Execute all the operation atomically and loop over the redis command
		// responses to check the current traffic count for each campaign
		let replies = await this.redis.multiExecute(operations),
			totalCount = _.sum(replies),
			// Meaning the total traffic count as crossed the threshold value
			// so the redis count should be set to zero for all the objects
			shouldResetCounter = (totalCount - result.length + 1) >= this.lcm
		;

		// Reinitialize operations to empty object
		operations = [];
		let selectedId = null;
		_.each(result, (obj, index) => {
			let redisCount = replies[index], redisField = `obj:${obj.id}:t`;
			// check whether the object can still accept the traffic if not then
			// sequentially take the next highest object according to traffic percentage
			if (redisCount <= obj.count && ! selectedId) {
				selectedId = obj.id;
				if (shouldResetCounter) {
					operations.push(['hmset', redisKey, redisField, 0]);
				}
				return;   // empty return sort of like break in callback foreach
			}

			if (shouldResetCounter) {
				operations.push(['hmset', redisKey, redisField, 0]);
			} else {
				operations.push(['hincrby', redisKey, redisField, -1]);
			}
		})
		await this.redis.multiExecute(operations)
		return selectedId;
	}

}

module.exports = TrafficDistribution;