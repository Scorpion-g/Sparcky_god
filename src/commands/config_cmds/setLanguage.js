const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const GuildConfiguration = require("../../models/GuildConfiguration");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("language")
    .setDescription("Changer la langue du bot sur ce serveur")
    .addStringOption((option) =>
      option
        .setName("lang")
        .setDescription("Langue")
        .setRequired(true)
        .addChoices(
          { name: "Français", value: "fr" },
          { name: "English", value: "en" },
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const lang = interaction.options.getString("lang", true);

    await GuildConfiguration.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { language: lang },
      { upsert: true },
    );

    const title = await interaction.t?.("CONFIG.LANGUAGE.TITLE");
    const desc = await interaction.t?.("CONFIG.LANGUAGE.UPDATED", { language: lang });

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(title || "Langue mise à jour")
      .setDescription(desc || `Langue du bot définie sur: **${lang}**`);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

