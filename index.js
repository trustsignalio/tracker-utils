let Cache = require('./src/cache');
let Db = require('./src/db'),
	Messaging = require('./src/messaging'),
	Redis = require('./src/redis'),
	Registry = require('./src/registry'),
	Security = require('./src/security'),
	TrafficDistribution = require('./src/trafficdistribution');

module.exports = {
	Cache: Cache,
	Db: Db,
	Messaging: Messaging,
	Redis: Redis,
	Registry: Registry,
	Security: Security,
	TrafficDistribution: TrafficDistribution
}