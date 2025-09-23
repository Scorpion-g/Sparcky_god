const { SlashCommandBuilder,EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Affiche le classement des membres").addSubcommand((subcommand) =>
      subcommand
        .setName("warns")
        .setDescription("Classement des membres avec le plus de warns"),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("messages")
        .setDescription("Classement des membres avec le plus de messages"),
    ).addSubcommand((subcommand) =>
      subcommand
        .setName("money")
        .setDescription("Classement des membres avec le plus d'argent"),
    ).addSubcommand((subcommand) =>
      subcommand
        .setName("voicetime")
        .setDescription("Classement des membres avec le plus de temps en vocal"),
    ).addSubcommand((subcommand) =>
      subcommand
        .setName("invites")
        .setDescription("Classement des membres avec le plus d'invitations"),
    ).addSubcommand((subcommand) =>
      subcommand
        .setName("level")
        .setDescription("Classement des membres avec le plus haut niveau"),
    ),
  /**
   * @param {import("discord.js").CommandInteraction} interaction
   */
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    let Model, field, title, unit;

    switch (subcommand) {
      case "warns":
        Model = require("../../models/Warn");
        field = "warn";
        title = "Classement des membres avec le plus de warns";
        unit = "warns";
        break;
      case "messages":
        Model = require("../../models/MessageCount");
        field = "count";
        title = "Classement des membres avec le plus de messages";
        unit = "messages";
        break;
      case "money":
        Model = require("../../models/User");
        field = "balance";
        title = "Classement des membres avec le plus d'argent";
        unit = "💰";
        break;
      case "voicetime":
        Model = require("../../models/VoiceTime");
        field = "time";
        title = "Classement des membres avec le plus de temps en vocal";
        unit = "heures";
        break;
      case "invites":
        Model = require("../../models/Invite");
        field = "total";
        title = "Classement des membres avec le plus d'invitations";
        unit = "invitations";
        break;
      case "level":
        Model = require("../../models/Level");
        field = "level";
        title = "Classement des membres avec le plus haut niveau";
        unit = "niveau";
        break;
      default:
        return interaction.reply({
          content: "Sous-commande invalide.",
          ephemeral: true,
        });
    }

    await interaction.deferReply();

    const topEntries = await Model.find({ guildId: interaction.guild.id })
      .sort({ [field]: -1 })
      .limit(10);

    if (topEntries.length === 0) {
      return interaction.editReply("Aucune donnée disponible pour ce classement.");
    }

    let description = "";
    for (let i = 0; i < topEntries.length; i++) {
      const entry = topEntries[i];
      const member = await interaction.guild.members.fetch(entry.userId).catch(() => null);
      const memberName = member ? member.user.tag : "Utilisateur inconnu";
      let value = entry[field];

      if (subcommand === "voicetime") {
        value = (value / 3600).toFixed(2); // Convertir les secondes en heures
      }

      description += `**${i + 1}. ${memberName}** - ${value} ${unit}\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor("#0099ff")
      .setTimestamp();

    interaction.editReply({ embeds: [embed] });
  },
};  
