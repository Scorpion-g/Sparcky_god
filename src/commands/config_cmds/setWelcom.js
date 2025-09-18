const { SlashCommandBuilder } = require('discord.js');
const GuildConfiguration = require('../../models/GuildConfiguration');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('Définir le canal de bienvenue')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Canal pour les messages de bienvenue')
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    await GuildConfiguration.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { welcomeChannel: channel.id },
      { upsert: true }
    );
    await interaction.reply(`Le canal de bienvenue est maintenant : ${channel}`);
  },
};

