const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const GuildConfiguration = require("../../models/GuildConfiguration");
const logger = require("../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setantilink")
    .setDescription("Activer ou désactiver l'antilink")
    .addStringOption((option) =>
      option
        .setName("etat")
        .setDescription("Choisir l'état de l'antilink (on/off)")
        .setRequired(true)
        .addChoices(
          { name: "on", value: "on" },
          { name: "off", value: "off" }
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const etat = interaction.options.getString("etat");
    await interaction.deferReply({ ephemeral: true });

    try {
      let guildConfig = await GuildConfiguration.findOne({
        guildId: interaction.guild.id,
      });

      if (!guildConfig) {
        guildConfig = new GuildConfiguration({
          guildId: interaction.guild.id,
        });
      }

      guildConfig.antilink = etat==="on";
      await guildConfig.save();

      const embed = new EmbedBuilder()
        .setTitle("⚙️ Configuration de l'Antilink")
        .setDescription(
          `L'antilink a été **${etat === "on" ? "activé ✅" : "désactivé ❌"}**.`
        )
        .setColor(etat === "on" ? "#00FF00" : "#FF0000");

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      logger.error(`Erreur lors de la configuration de l'antilink: ${error}`);
      await interaction.editReply({
        content:
          "❌ Une erreur est survenue lors de la configuration de l'antilink.",
      });
    }
  },
};

