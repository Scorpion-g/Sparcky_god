const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const GuildConfiguration = require("../../models/GuildConfiguration");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setantilink")
    .setDescription("Activer ou désactiver l'antilink")
    .addStringOption((option) =>
      option
        .setName("etat")
        .setDescription("Choisir l'état de l'antilink (on/off)")
        .setRequired(true)
        .addChoices({ name: "on", value: "on" }, { name: "off", value: "off" }),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const etat = interaction.options.getString("etat");
    // Ici, vous pouvez ajouter la logique pour activer ou désactiver l'antilink
    // Par exemple, en mettant à jour une base de données ou une configuration en mémoire
    await interaction.deferReply({ ephemeral: true });

    try {
      let guildConfig = await GuildConfiguration.findOne({
        guildId: interaction.guild.id,
      });

      if (!guildConfig) {
        guildConfig = new GuildConfiguration({
          guildId: interaction.guild.id,
          antilink: etat === "on",
        });
      } else {
        guildConfig.antilink = etat === "on";
      }

      await guildConfig.save();

      const embed = new EmbedBuilder()
        .setTitle("Configuration de l'Antilink")
        .setDescription(
          `L'antilink a été **${etat === "on" ? "activé" : "désactivé"}**.`,
        )
        .setColor(etat === "on" ? "#00FF00" : "#FF0000");

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(`Erreur lors de la configuration de l'antilink: ${error}`);
      await interaction.editReply({
        content:
          "Une erreur est survenue lors de la configuration de l'antilink.",
        ephemeral: true,
      });
    }
  },
};
