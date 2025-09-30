const {
  PermissionFlagsBits,
  EmbedBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const GuildConfiguration = require("../../models/GuildConfiguration");
const { addWarn } = require("../../utils/warnUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Pour warn un membre du serveur")
    .addMentionableOption((option) =>
      option
        .setName("membre")
        .setDescription("Membre à avertir")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("raison")
        .setDescription("La raison de l’avertissement du membre")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  /**
   * @param {Client} client
   * @param {import("discord.js").CommandInteraction} interaction
   */
  async execute(interaction) {
    const membreId = interaction.options.get("membre").value;
    const raison =
      interaction.options.get("raison")?.value || "Pas de raison donnée";

    await interaction.deferReply({ ephemeral: true });

    const member = await interaction.guild.members
      .fetch(membreId)
      .catch(() => null);
    if (!member)
      return interaction.editReply(
        "Le membre mentionné n'est pas sur le serveur.",
      );

    // Protections
    if (member.id === interaction.guild.ownerId)
      return interaction.editReply(
        "❌ Tu ne peux pas warn le créateur du serveur.",
      );
    if (
      member.roles.highest.position >= interaction.member.roles.highest.position
    )
      return interaction.editReply(
        "❌ Tu ne peux pas warn ce membre (rôle supérieur ou égal au tien).",
      );
    if (
      member.roles.highest.position >=
      interaction.guild.members.me.roles.highest.position
    )
      return interaction.editReply(
        "❌ Je ne peux pas warn ce membre (rôle trop haut).",
      );

    // Création ou mise à jour du warn
    const warnCount = await addWarn(member, raison);
    const Warn = require("../../models/Warn");
    const checkAndSanction = require("../../utils/checkAndSanction");
    const warnDoc = new Warn({
      userId: member.id,
      guildId: interaction.guild.id,
      moderatorId: interaction.user.id,
      reason: raison,
      date: new Date(),
      warn: warnCount,
    });
    await warnDoc.save();
    try {
      await checkAndSanction(member, warnDoc.warn);
    } catch (error) {
      logger.error(
        "Erreur lors de la vérification des sanctions automatiques :",
        error,
      );
    }
    // Vérification et application des sanctions automatiques

    // Embed de confirmation
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("⚠️ Warn")
      .setDescription(`Le membre ${member} a été warn.`)
      .addFields(
        { name: "Raison", value: raison, inline: false },
        { name: "Nombre de warns", value: `${warnCount}`, inline: true },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    // DM au membre
    await member
      .send({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle(`⚠️ Vous avez été warn sur ${interaction.guild.name}`)
            .addFields(
              { name: "Raison", value: raison },
              { name: "Total de warns", value: `${warnCount}` },
            )
            .setTimestamp(),
        ],
      })
      .catch(() => {});

    // Log dans le modLogChannel
    try {
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
              .setColor("#FFA500")
              .setTitle("📋 Log Warn")
              .setDescription(`${member} a été warn par ${interaction.user}`)
              .addFields(
                { name: "Raison", value: raison },
                { name: "Total de warns", value: `${warnCount}` },
              )
              .setTimestamp(),
          ],
        });
      }
    } catch (error) {
      logger.error("Erreur lors du log du warn:", error);
    }
  },
};
