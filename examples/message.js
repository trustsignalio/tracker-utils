let {Messaging} = require('../index');

let pubsub = Messaging.Factory.make("pubsub", {
	project: "tranquil-apogee-150510",
	topic: "vn_postback",
	subscription: "vn_postback_sub",
	handler: function (message) {
		console.log(String(message.data));
		message.ack();
	}
})

pubsub.send('Testing message').then(d => true).catch(e => console.log(e))
pubsub.receive().then(d => true).catch(e => console.log(e));