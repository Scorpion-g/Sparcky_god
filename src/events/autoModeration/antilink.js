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

    const contentToCheck = message.content.replace(/[<>()]/g, ""); // éviter les contournements

    const linkPatterns = [
      /https?:\/\/[^\s]+/gi,
      /www\.[^\s]+/gi,
      /discord\.gg\/[^\s]+/gi,
      /discordapp\.com\/invite\/[^\s]+/gi,
    ];

    const containsLink = linkPatterns.some((pattern) =>
      pattern.test(contentToCheck),
    );

    if (!containsLink) return;

    try {
      // Supprimer le message
      if (message.deletable) {
        await message.delete().catch(() => {});
      }

      const warningMessage = await message.channel.send({
        content: `<@${message.author.id}>, les liens sont interdits sur ce serveur !`,
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setDescription(
              "Votre message a été supprimé car les liens sont interdits sur ce serveur. Veuillez ne pas en envoyer.",
            )
            .setTimestamp(),
        ],
      });

      // Supprimer le warning après 5s
      setTimeout(() => warningMessage.delete().catch(() => {}), 5000);

      // Timeout l'utilisateur (10s)
      if (
        message.guild.members.me.permissions.has(
          PermissionFlagsBits.ModerateMembers,
        )
      ) {
        await message.member
          .timeout(10 * 1000, "Envoi de liens")
          .then(async () => {
            const timeoutMessage = await message.channel.send({
              content: `<@${message.author.id}> a été mis en timeout pendant 10 secondes pour avoir envoyé un lien.`,
              embeds: [
                new EmbedBuilder()
                  .setColor("#FFA500")
                  .setDescription(
                    "L'utilisateur a été mis en timeout pour avoir enfreint les règles du serveur.",
                  )
                  .setTimestamp(),
              ],
            });

            setTimeout(() => timeoutMessage.delete().catch(() => {}), 5000);
          })
          .catch(() =>
            console.warn(
              `Impossible de timeout ${message.author.tag} (permissions ou rôle trop haut)`,
            ),
          );
        const warnCount = await addWarn(message.member, "Envoi de lien");
        // DM à l'utilisateur
        await message.author
          .send({
            embeds: [
              new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle(
                  `⚠️ Vous avez été warn sur ${message.guild.name} pour avoir envoyé un lien`,
                )
                .addFields(
                  { name: "Raison", value: "Envoi de lien" },
                  { name: "Total de warns", value: `${warnCount}` },
                )
                .setTimestamp(),
            ],
          })
          .catch(() =>
            console.warn(`Impossible d'envoyer un DM à ${message.author.tag}`),
          );
        //Log le warn dans le channel de log si configuré
        const logChannel = message.guild.channels.cache.get(
          guildConfig?.modLogChannel,
        );
        const messageContent = message.content.length
          ? message.content.length > 1024
            ? message.content.substring(0, 1021) + "..."
            : message.content
          : "Contenu non disponible";
        if (logChannel && logChannel.isTextBased()) {
          const logEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("🛑 Lien Détecté")
            .addFields(
              {
                name: "Utilisateur",
                value: `${message.author.tag} (${message.author.id})`,
                inline: false,
              },
              { name: "Message", value: messageContent, inline: false },
              { name: "Canal", value: `${message.channel}`, inline: true },
            )
            .setTimestamp();
          logChannel.send({ embeds: [logEmbed] }).catch(() => {});
        }
      }
    } catch (error) {
      logger.error("Erreur lors de la gestion de l'antilink :", error);
    }
  },
};
