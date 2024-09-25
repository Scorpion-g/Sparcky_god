const { Schema, model } = require('mongoose');

const warnSchema = new Schema({
	userId: {
		type: String,
		required: true,
	},
	guildId: {
		type: String,
		required: true,
	},
	warn: {
		type: Number,
		default: 0,
	},
	raison: {
		type: String,
		required: false,
	},
});

module.exports = model('warn', warnSchema);
