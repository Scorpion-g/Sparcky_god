const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Retourne votre ping"),

  async execute(interaction, client) {
    const sent = await interaction.reply({
      content: "Calcul du ping...",
      fetchReply: true,
    });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);
    interaction.editReply(
      `🏓 Pong! Latence: ${latency}ms. Latence API: ${apiLatency}ms.`,
    );
  },
};
