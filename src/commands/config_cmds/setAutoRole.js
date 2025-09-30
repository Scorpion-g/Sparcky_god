const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const GuildConfiguration = require("../../models/GuildConfiguration");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setautorole")
    .setDescription("Définir le rôle automatique pour les nouveaux membres")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Rôle à attribuer automatiquement aux nouveaux membres")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const role = interaction.options.getRole("role");
    try {
      await GuildConfiguration.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { autoRole: role.id },
        { upsert: true },
      );
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Rôle automatique défini")
        .setDescription(`Le rôle automatique a été défini sur ${role}.`)
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      logger.error(
        `Erreur lors de la configuration du rôle automatique: ${error}`,
      );
      await interaction.reply({
        content:
          "Une erreur est survenue lors de la configuration du rôle automatique.",
        ephemeral: true,
      });
    }
  },
};
