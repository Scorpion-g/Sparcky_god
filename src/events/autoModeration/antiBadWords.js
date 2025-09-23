const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const GuildConfiguration = require("../../models/GuildConfiguration");
const { containsBadWord } = require("../../utils/badWordUtils"); // ton util
const Warn = require("../../models/Warn");
const { addWarn } = require("../../utils/warnUtils");
module.exports = {
  name: "messageCreate",
  async execute(client, message) {
    if (message.author.bot || !message.guild) return;

    // Récupérer la config serveur
    const guildConfig = await GuildConfiguration.findOne({
      guildId: message.guild.id,
    });

    // Vérifier si l'anti-link est activé
    if (!guildConfig?.antilink) return;

    const serverBadWords = guildConfig?.badWords || []; // mots du serveur
    const messageContent = message.content;

    // Liste combinée : serveur + global
    const badWordsList = [...serverBadWords]; // defaultBadWords sera utilisé par containsBadWord si nécessaire

    if (containsBadWord(messageContent, badWordsList)) {
      try {
        // Supprimer le message si possible
        if (message.deletable) await message.delete();

        // Message d’avertissement
        const warningEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setDescription(
            `<@${message.author.id}>, ton message contient un mot interdit et a été supprimé.`,
          )
          .setTimestamp();

        const warningMsg = await message.channel.send({
          embeds: [warningEmbed],
        });

        // Supprimer l’avertissement après 5 secondes
        if (warningMsg.deletable) {
          setTimeout(() => warningMsg.delete().catch(() => {}), 5000);
        }

        // Timeout si le bot a la permission
        if (
          message.guild.members.me.permissions.has(
            PermissionFlagsBits.ModerateMembers,
          )
        ) {
          await message.member.timeout(10 * 1000, "Mot interdit détecté");
          const timeoutEmbed = new EmbedBuilder()
            .setColor("#FFA500")
            .setDescription(
              `<@${message.author.id}> a été mis en timeout pendant 10 secondes pour avoir utilisé un mot interdit.`,
            )
            .setTimestamp();

          const timeoutMsg = await message.channel.send({
            embeds: [timeoutEmbed],
          });
          if (timeoutMsg.deletable)
            setTimeout(() => timeoutMsg.delete().catch(() => {}), 5000);

          //ajouter un warn à l'utilisateur
          const warnCount = await addWarn(
            message.member,
            "Utilisation de mots interdits",
          );
          // DM à l'utilisateur
          await message.author
            .send({
              embeds: [
                new EmbedBuilder()
                  .setColor("#FF0000")
                  .setTitle(`⚠️ Vous avez été warn sur ${message.guild.name}`)
                  .addFields(
                    { name: "Raison", value: "Utilisation de mots interdits" },
                    { name: "Total de warns", value: `${warnCount}` },
                  )
                  .setTimestamp(),
              ],
            })
            .catch(() => {});
        }

        // Log dans le channel de modération si configuré
        const logChannel = message.guild.channels.cache.get(
          guildConfig?.modLogChannel,
        );
        if (logChannel && logChannel.isTextBased()) {
          const logEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("🛑 Mot Interdit Détecté")
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
      } catch (error) {
        console.error("Erreur lors de la gestion des mots interdits :", error);
      }
    }
  },
};
