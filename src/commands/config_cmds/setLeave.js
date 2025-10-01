const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const logger = require("../../utils/logger");
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
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    try {
      await GuildConfiguration.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { leaveChannel: channel.id },
        { upsert: true },
      );
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Canal d'aurevoir défini")
        .setDescription(`Le canal d'aurevoir a été défini sur ${channel}.`)
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      logger.error(
        `Erreur lors de la configuration du canal d'aurevoir: ${error}`,
      );
      await interaction.reply({
        content:
          "Une erreur est survenue lors de la configuration du canal d'aurevoir.",
        ephemeral: true,
      });
    }
  },
};
