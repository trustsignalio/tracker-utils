let PubSub = require('./pubsub');

class Factory {
	make(messagingType, config) {
		switch (messagingType) {
			case "pubsub":
				let obj = new PubSub(config);
				return obj;
		}
		throw new Error("Invalid Messaging Type");
	}
}

module.exports = new Factory;