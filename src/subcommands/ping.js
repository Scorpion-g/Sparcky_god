const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    deleted: false,
    data: new SlashCommandBuilder().setName("ping").setDescription("Pong!"),

    run: ({ interaction, client, handler }) => {
        interaction.reply(`Pong! ${client.ws.ping}ms`);
    },
};
