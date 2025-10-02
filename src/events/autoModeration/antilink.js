const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const GuildConfiguration = require("../../models/GuildConfiguration");
const { addWarn } = require("../../utils/warnUtils");
const logger = require("../../utils/logger");

module.exports = {
  name: "messageCreate",
  async execute(client, message) {
    if (message.author.bot || !message.guild) return;

    const guildConfig = await GuildConfiguration.findOne({
      guildId: message.guild.id,
    });

    if (!guildConfig || !guildConfig.antilink) return;

    const contentToCheck = message.content.replace(/[<>()]/g, "");
    const linkPatterns = [
      /https?:\/\/[^\s]+/gi,
      /www\.[^\s]+/gi,
      /discord\.gg\/[^\s]+/gi,
      /discordapp\.com\/invite\/[^\s]+/gi,
    ];

    const containsLink = linkPatterns.some(pattern =>
      pattern.test(contentToCheck)
    );
    if (!containsLink) return;

    try {
      if (message.deletable) await message.delete();

      // Ajouter un warn à l'utilisateur
      const warnCount = await addWarn(message.member, "Envoi de lien");

      // DM à l'utilisateur
      await message.author.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle(`⚠️ Vous avez été warn sur ${message.guild.name}`)
            .addFields(
              { name: "Raison", value: "Envoi de lien" },
              { name: "Total de warns", value: `${warnCount}` }
            )
            .setTimestamp(),
        ],
      }).catch(() => {});

      // Log dans le channel de mod si configuré
      const logChannel = message.guild.channels.cache.get(guildConfig?.modLogChannel);
      if (logChannel && logChannel.isTextBased()) {
        const logEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("🛑 Lien Détecté")
          .addFields(
            { name: "Utilisateur", value: `${message.author.tag} (${message.author.id})`, inline: false },
            { name: "Message", value: message.content.length > 1024 ? message.content.slice(0, 1021) + "..." : message.content, inline: false },
            { name: "Canal", value: `${message.channel}`, inline: true },
            { name: "Total de warns", value: `${warnCount}`, inline: true }
          )
          .setTimestamp();
        logChannel.send({ embeds: [logEmbed] }).catch(() => {});
      }

      // Timeout uniquement si le bot a la permission
      if (message.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        const member = await message.guild.members.fetch(message.author.id);
        if (member.moderatable) {
          await member.timeout(10_000, "Envoi de lien").catch(() => {});
          const timeoutMessage = await message.channel.send({
            content: `<@${message.author.id}> a été mis en timeout pendant 10 secondes pour avoir envoyé un lien.`,
            embeds: [
              new EmbedBuilder()
                .setColor("#FFA500")
                .setDescription("L'utilisateur a été mis en timeout pour avoir enfreint les règles du serveur.")
                .setTimestamp(),
            ],
          });
          if (timeoutMessage.deletable) setTimeout(() => timeoutMessage.delete().catch(() => {}), 5000);
        }
      }

    } catch (error) {
      logger.error("Erreur lors de la gestion de l'antilink :", error);
    }
  },
};

