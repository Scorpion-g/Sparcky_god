const {
  PermissionFlagsBits,
  EmbedBuilder,
  SlashCommandBuilder,
} = require("discord.js");

const Warn = require("../../models/Warn");
const GuildConfiguration = require("../../models/GuildConfiguration");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unwarn")
    .setDescription("Enlever un ou plusieurs warns à un membre du serveur")
    .addMentionableOption((option) =>
      option
        .setName("membre")
        .setDescription("Membre à unwarn")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("nombre")
        .setDescription("Nombre de warns à retirer")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("raison")
        .setDescription("Raison de l’unwarn")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  /**
   *
   * @param {Client} client
   * @param {import("discord.js").CommandInteraction} interaction
   */
  async execute(interaction) {
    const membreId = interaction.options.get("membre").value;
    const nbUnwarn = interaction.options.get("nombre").value;
    const raison =
      interaction.options.get("raison")?.value || "Pas de raison donnée";

    await interaction.deferReply();

    const member = await interaction.guild.members
      .fetch(membreId)
      .catch(() => null);
    if (!member)
      return interaction.editReply(
        "❌ Le membre mentionné n'est pas sur le serveur.",
      );

    // Récupération des warns
    const warn = await Warn.findOne({
      userId: member.id,
      guildId: interaction.guild.id,
    });
    if (!warn) {
      return interaction.editReply(`❌ ${member} n’a jamais été warn.`);
    }

    if (warn.warn <= 0) {
      return interaction.editReply(`❌ ${member} n’a déjà plus de warns.`);
    }

    let oldWarns = warn.warn;

    if (nbUnwarn >= warn.warn) {
      warn.warn = 0;
    } else {
      warn.warn -= nbUnwarn;
    }

    warn.raison.push(`Unwarn: ${raison}`);
    await warn.save();

    // Embed de confirmation
    const embed = new EmbedBuilder()
      .setColor("#00ff99")
      .setTitle("✅ Unwarn")
      .setDescription(`${member} a été unwarn.`)
      .addFields(
        { name: "Raison", value: raison, inline: false },
        { name: "Warns retirés", value: `${nbUnwarn}`, inline: true },
        { name: "Warns restants", value: `${warn.warn}`, inline: true },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    // DM au membre
    await member
      .send({
        embeds: [
          new EmbedBuilder()
            .setColor("#00ff99")
            .setTitle(`✅ Vous avez été unwarn sur ${interaction.guild.name}`)
            .addFields(
              { name: "Raison", value: raison },
              { name: "Warns retirés", value: `${nbUnwarn}` },
              { name: "Warns restants", value: `${warn.warn}` },
            )
            .setTimestamp(),
        ],
      })
      .catch(() => {});

    // Log modération
    const guildConfig = await GuildConfiguration.findOne({
      guildId: interaction.guild.id,
    });
    const logChannel = interaction.guild.channels.cache.get(
      guildConfig?.modLogChannel,
    );

    if (logChannel) {
      logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#00ff99")
            .setTitle("📋 Log Unwarn")
            .setDescription(`${member} a été unwarn par ${interaction.user}`)
            .addFields(
              { name: "Raison", value: raison },
              { name: "Warns retirés", value: `${nbUnwarn}` },
              { name: "Warns avant", value: `${oldWarns}`, inline: true },
              { name: "Warns restants", value: `${warn.warn}`, inline: true },
            )
            .setTimestamp(),
        ],
      });
    }
  },
};
