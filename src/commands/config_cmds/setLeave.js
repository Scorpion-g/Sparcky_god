const { SlashCommandBuilder } = require("discord.js");
const GuildConfiguration = require("../../models/GuildConfiguration");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setleave")
    .setDescription("Définir le canal d'aurevoir")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Canal pour les messages d'aurevoir")
        .setRequired(true),
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    await GuildConfiguration.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { leaveChannel: channel.id },
      { upsert: true },
    );
    await interaction.reply(`Le canal d'aurevoir est maintenant : ${channel}`);
  },
};
