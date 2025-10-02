// utils/autoSanction.js
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const GuildConfiguration = require("../models/GuildConfiguration");

/**
 * Vérifie le nombre de warns et applique la sanction automatique
 * @param {import("discord.js").GuildMember} member
 * @param {number} warnCount
 */
async function checkAndSanction(member, warnCount) {
  if (!member || !member.guild) return;

  const guildConfig = await GuildConfiguration.findOne({
    guildId: member.guild.id,
  });
  if (!guildConfig?.autoSanction) return;

  let action;
  let reasonText = "";

  // Définir les actions selon le nombre de warns
  if (warnCount === 3) {
    action = "timeout";
    reasonText = "Atteint 3 warns - Sanction automatique";
  } else if (warnCount === 5) {
    action = "kick";
    reasonText = "Atteint 5 warns - Sanction automatique";
  } else if (warnCount === 7) {
    action = "ban";
    reasonText = "Atteint 7 warns - Sanction automatique";
  } else {
    return; // Pas d'action à prendre
  }

  try {
    const logChannel = member.guild.channels.cache.get(
      guildConfig?.modLogChannel,
    );

    if (action === "timeout") {
      if (
        member.guild.members.me.permissions.has(
          PermissionFlagsBits.ModerateMembers,
        )
      ) {
        await member.timeout(10 * 60 * 1000, reasonText);

        const embed = new EmbedBuilder()
          .setColor("#FFFF00")
          .setDescription(
            `⏲️ <@${member.id}> a été mis en timeout automatiquement pour avoir atteint ${warnCount} warns.`,
          )
          .setTimestamp();

        if (logChannel && logChannel.isTextBased())
          logChannel.send({ embeds: [embed] });
      }
    } else if (action === "kick") {
      if (member.kickable) {
        await member.kick(reasonText);

        const embed = new EmbedBuilder()
          .setColor("#FFA500")
          .setDescription(
            `🔨 <@${member.id}> a été expulsé automatiquement pour avoir atteint ${warnCount} warns.`,
          )
          .setTimestamp();

        if (logChannel && logChannel.isTextBased())
          logChannel.send({ embeds: [embed] });
      }
    } else if (action === "ban") {
      if (member.bannable) {
        await member.ban({ reason: reasonText });

        const embed = new EmbedBuilder()
          .setColor("#FF0000")
          .setDescription(
            `🔨 <@${member.id}> a été banni automatiquement pour avoir atteint ${warnCount} warns.`,
          )
          .setTimestamp();

        if (logChannel && logChannel.isTextBased())
          logChannel.send({ embeds: [embed] });
      }
    }
  } catch (error) {
    console.error(
      `Erreur lors de la sanction automatique de ${member.user.tag}:`,
      error,
    );
  }
}

module.exports = { checkAndSanction };
