const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Retourne votre ping"),

  async execute(interaction,client) {
    await interaction.deferReply();

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    await interaction.reply(
      `Pong! Client ${ping}ms | Websocket: ${client.ws.ping}ms`,
    );
  },
};
