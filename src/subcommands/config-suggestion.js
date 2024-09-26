const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('config-suggest')
    .setDescription('Pong!'),


	run: ({ interaction, client, handler }) => {
		interaction.reply(`Pong! ${client.ws.ping}ms`);
	},
};
