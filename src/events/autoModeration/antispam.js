const { EmbedBuilder, PermissionsBitField } = require("discord.js");
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
    if (!guildConfig || !guildConfig.antispam) return;

    // Gestion des messages pour l'antispam
    const userMessages = client.userMessages || new Map();
    client.userMessages = userMessages;

    const now = Date.now();
    const timestamps = userMessages.get(message.author.id) || [];
    const filteredTimestamps = timestamps.filter(ts => now - ts < 10000); // 10 secondes
    filteredTimestamps.push(now);
    userMessages.set(message.author.id, filteredTimestamps);

    // Seuil de spam
    if (filteredTimestamps.length <= 5) return;

    try {
      // Supprimer le message si possible
      if (message.deletable) await message.delete().catch(() => {});

      // Ajouter un warn
      const member = await message.guild.members.fetch(message.author.id);
const warnCount = await addWarn(member, "Spam de messages");


      // DM à l'utilisateur
      await message.author.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle(`⚠️ Vous avez été warn sur ${message.guild.name}`)
            .addFields(
              { name: "Raison", value: "Spam de messages" },
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
          .setTitle("🛑 Spam Détecté")
          .addFields(
            { name: "Utilisateur", value: `${message.author.tag} (${message.author.id})`, inline: false },
            { name: "Message", value: message.content.length > 1024 ? message.content.slice(0, 1021) + "..." : message.content, inline: false },
            { name: "Canal", value: `${message.channel}`, inline: true },
            { name: "Total de warns", value: `${warnCount}`, inline: true }
          )
          .setTimestamp();
        logChannel.send({ embeds: [logEmbed] }).catch(() => {});
      }

      // Timeout si possible
      if (message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        const member = await message.guild.members.fetch(message.author.id);
        if (member.moderatable) {
          await member.timeout(60_000, "Spam détecté par l'antispam").catch(() => {});
          const timeoutMessage = await message.channel.send({
            content: `<@${message.author.id}> a été mis en timeout pendant 1 minute pour spam.`,
            embeds: [
              new EmbedBuilder()
                .setColor("#FFA500")
                .setDescription("L'utilisateur a été mis en timeout pour avoir spammé.")
                .setTimestamp(),
            ],
          });
          if (timeoutMessage.deletable) setTimeout(() => timeoutMessage.delete().catch(() => {}), 5000);
        }
      }

    } catch (error) {
      logger.error("Erreur lors de la gestion de l'antispam :", error);
    }
  },
};

