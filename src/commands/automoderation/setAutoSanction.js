const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const logger = require("../../utils/logger");

const GuildConfiguration = require("../../models/GuildConfiguration");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setautosanction")
    .setDescription("Activer ou désactiver la sanction automatique")
    .addBooleanOption((option) =>
      option
        .setName("état")
        .setDescription("Activer ou désactiver la sanction automatique")
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
    try {
      await interaction.deferReply();

      let guildConfig = await GuildConfiguration.findOne({
        guildId: interaction.guild.id,
      });

      if (!guildConfig) {
        guildConfig = new GuildConfiguration({
          guildId: interaction.guild.id,
          autoSanction: état,
        });
      } else {
        guildConfig.autoSanction = état;
      }

      await guildConfig.save();

      const embed = new EmbedBuilder()
        .setColor(état ? "#00ff99" : "#ff3300")
        .setTitle(
          état
            ? "✅ Sanction Automatique Activée"
            : "❌ Sanction Automatique Désactivée",
        )
        .setDescription(
          `La sanction automatique a été ${état ? "activée" : "désactivée"} avec succès.`,
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logger.error(error);
      await interaction.editReply(
        "❌ Une erreur est survenue lors du débannissement du membre.",
      );
    }
  },
};
