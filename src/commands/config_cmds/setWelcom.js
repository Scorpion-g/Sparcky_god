const { SlashCommandBuilder,EmbedBuilder,PermissionFlagsBits } = require('discord.js');
const GuildConfiguration = require('../../models/GuildConfiguration');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('Définir le canal de bienvenue')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Canal pour les messages de bienvenue')
        .setRequired(true)
    ).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    await GuildConfiguration.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { welcomeChannel: channel.id },
      { upsert: true }
    );
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Canal de bienvenue défini')
      .setDescription(`Le canal de bienvenue a été défini sur ${channel}.`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

