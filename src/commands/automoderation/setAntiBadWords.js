const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const GuildConfiguration = require("../../models/GuildConfiguration");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setantibadwords")
    .setDescription("Activer ou désactiver l'anti bad words")
    .addBooleanOption((option) =>
      option
        .setName("état")
        .setDescription("Activer ou désactiver l'anti bad words")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  /**
   *
   * @param {import("discord.js").Client} client
   * @param {import("discord.js").CommandInteraction} interaction
   */
  async execute(interaction) {
    const état = interaction.options.get("état").value;

    await interaction.deferReply();

    let guildConfig = await GuildConfiguration.findOne({
      guildId: interaction.guild.id,
    });
    try {
      if (!guildConfig) {
        guildConfig = new GuildConfiguration({
          guildId: interaction.guild.id,
          antiBadWords: état,
        });
      } else {
        guildConfig.antiBadWords = état;
      }

      await guildConfig.save();

      const embed = new EmbedBuilder()
        .setColor(état ? "#00ff99" : "#ff3300")
        .setTitle(
          état ? "✅ Anti Bad Words Activé" : "❌ Anti Bad Words Désactivé",
        )
        .setDescription(
          `L'anti bad words a été ${état ? "activé" : "désactivé"} avec succès.`,
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logger.error(error);
      await interaction.editReply(
        "Une erreur est survenue lors de la mise à jour de la configuration.",
      );
    }
  },
};
