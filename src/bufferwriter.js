/**
 * @package Cloudstuff Tracker Utils
 * @module BufferWriter
 * @version 1.0
 * @author Hemant Mann <hemant.mann@vnative.com>
 */
class BufferWriter {
	/**
	 * Constructor will accept a mongoose model and initialize a docs array which
	 * will hold the objects in memory and flush them to the database once the count
	 * exceeds the maxDocs count or at a regular interval 
	 * @param  {Mongoose.Model} model Model object
	 * @param  {Object} opts  Options object
	 */
	constructor(model, opts = {}) {
		this._model = model;
		this._docs = [];
		this.maxDocs = opts.maxDocs || 500;

		this.addTimer(opts.timer || 4);
		this.shutdownHook();
	}

	insert(doc) {
		this._docs.push(doc);
		this.flush(false);
	}

	/**
	 * Flush method does the ultimate work of writing the memory data into the database
	 * @param  {Boolean} override
	 */
	flush(override) {
		if (override || this._docs.length >= this.maxDocs) {
			this._model.insertMany(this._docs, {ordered: false}).then(d => true).catch(e => true)
			this._docs = [];
		}
	}

	/**
	 * Timer is useful to periodically flush the data to db
	 * @param {Number} secs No of seconds after which to flush the data
	 */
	addTimer(secs) {
		let buffer = this;
		setTimeout(() => buffer.flush(true), secs * 1000);
	}

	/**
	 * Shutdown hook will add event handler on the node process to flush the in-memory buffer
	 * in case the application quits and there is some data in memory
	 */
	shutdownHook() {
		let buffer = this;
		process.on('SIGINT', function () {
			buffer.flush(true);
		})

		process.on('exit', function () {
			buffer.flush(true);
		})
	}
}

module.exports = BufferWriter;
