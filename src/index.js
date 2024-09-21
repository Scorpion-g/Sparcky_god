require('dotenv').config();
const { Client, IntentsBitField, ActivityType } = require('discord.js');
const { CommandHandler } = require('djs-commander');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');
const path = require('path');
const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildPresences,
		IntentsBitField.Flags.MessageContent,
	],
});
new CommandHandler({
	client,
	commandsPath: path.join(__dirname, 'commands/subcommands'),
});

(async () => {
	try {
		mongoose.set('strictQuery', false);
		await mongoose.connect(process.env.MONGODB_URI);
		console.log('Connected to DB.');

		eventHandler(client);

		client.login(process.env.TOKEN);
	} catch (error) {
		console.log(`Error: ${error}`);
	}
})();
