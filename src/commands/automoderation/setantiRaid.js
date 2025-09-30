const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const GuildConfiguration = require("../../models/GuildConfiguration");
module.exports = {
  name: "setantiraid",
  description: "Enable or disable anti-raid system",
  data: new SlashCommandBuilder()
    .setName("setantiraid")
    .setDescription("Enable or disable anti-raid system")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Enable or disable anti-raid")
        .setRequired(true)
        .addChoices(
          { name: "enable", value: "enable" },
          { name: "disable", value: "disable" },
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client) {
    const action = interaction.options.getString("action");
    const guildId = interaction.guild.id;

    // Fetch the current anti-raid setting from the database
    const guildConfiguration = await GuildConfiguration.findOne({ guildId });
    const currentConfiguration = guildConfiguration.antiRaid;
    try {
      if (action === "enable") {
        if (currentConfiguration) {
          return interaction.reply({
            content: "Anti-raid system is already enabled.",
            ephemeral: true,
          });
        }
        guildConfiguration.antiRaid = true;
        await guildConfiguration.save();
        const embed = new EmbedBuilder()
          .setTitle("Anti-Raid System Enabled")
          .setDescription("The anti-raid system has been successfully enabled.")
          .setColor("Green")
          .setTimestamp();
        return interaction.reply({ embeds: [embed], ephemeral: true });
      } else if (action === "disable") {
        if (!currentConfiguration) {
          return interaction.reply({
            content: "Anti-raid system is already disabled.",
            ephemeral: true,
          });
        }
        guildConfiguration.antiRaid = false;
        await guildConfiguration.save();
        const embed = new EmbedBuilder()
          .setTitle("Anti-Raid System Disabled")
          .setDescription(
            "The anti-raid system has been successfully disabled.",
          )
          .setColor("Red")
          .setTimestamp();
        return interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        return interaction.reply({
          content: "Invalid action. Please choose 'enable' or 'disable'.",
          ephemeral: true,
        });
      }
    } catch (error) {
      logger.error("Erreur dans la maj de l'antiraid:", error);
      return interaction.reply({
        content:
        "Une erreur est survenue lors de la mise à jour de la configuration de l'antiraid.",
        ephemeral: true,
      });
    }
  },
};
