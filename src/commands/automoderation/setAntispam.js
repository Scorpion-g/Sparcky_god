const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const GuildConfiguration = require("../../models/GuildConfiguration");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setantispam")
    .setDescription("Activer ou désactiver l'antispam")
    .addStringOption((option) =>
      option
        .setName("etat")
        .setDescription("Choisir l'état de l'antispam")
        .setRequired(true)
        .addChoices(
          { name: "activer", value: "on" },
          { name: "désactiver", value: "off" },
        ),
    ),
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
          antispam: etat === "on",
        });
      } else {
        guildConfig.antispam = etat === "on";
      }

      await guildConfig.save();

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Configuration de l'antispam")
        .setDescription(
          `L'antispam a été **${etat === "on" ? "activé" : "désactivé"}**.`,
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(`Erreur lors de la configuration de l'antispam: ${error}`);
      await interaction.editReply({
        content:
          "Une erreur est survenue lors de la configuration de l'antispam.",
        ephemeral: true,
      });
    }
  },
};  
