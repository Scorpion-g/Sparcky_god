const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { addWarn } = require("../../utils/warnUtils");
module.exports = {
  name: "messageCreate",
  async execute(client, message) {
    if (message.author.bot || !message.guild) return;

    const GuildConfiguration = require("../../models/GuildConfiguration");
    const guildConfig = await GuildConfiguration.findOne({
      guildId: message.guild.id,
    });

    if (!guildConfig || !guildConfig.antispam) return;

    const userMessages = client.userMessages || new Map();
    client.userMessages = userMessages;

    const now = Date.now();
    const timestamps = userMessages.get(message.author.id) || [];
    const filteredTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < 10000, // 10 secondes
    );
    filteredTimestamps.push(now);
    userMessages.set(message.author.id, filteredTimestamps);

    if (filteredTimestamps.length > 5) {
      try {
        // Supprimer le message si possible
        if (message.deletable) {
          await message.delete();
        }

        const warningMessage = await message.channel.send({
          content: `<@${message.author.id}>, arrête de spammer !`,
          embeds: [
            new EmbedBuilder()
              .setColor("#FF0000")
              .setDescription(
                "Votre message a été supprimé car vous envoyez trop de messages en peu de temps. Veuillez ralentir le rythme.",
              )
              .setTimestamp(),
          ],
        });

        // Supprimer le message d’avertissement après 5 secondes
        if (warningMessage.deletable) {
          setTimeout(() => warningMessage.delete().catch(() => {}), 5000);
        }
        // timeout l'utilisateur pendant 10 secondes s'il a la permission
        if (
          message.guild.members.me.permissions.has(
            PermissionsBitField.Flags.ModerateMembers,
          )
        ) {
          if (
            message.guild.members.me.permissions.has(
              PermissionsBitField.Flags.ModerateMembers,
            )
          ) {
            const member = await message.guild.members.fetch(message.author.id);
            if (member.moderatable) {
              await member.timeout(60000, "Spam détecté par l'antispam");
              const timeoutMessage = await message.channel.send({
                content: `<@${message.author.id}> a été mis en timeout pendant 1 minute pour spam.`,
                embeds: [
                  new EmbedBuilder()
                    .setColor("#FFA500")
                    .setDescription(
                      "Vous avez été mis en timeout pendant 1 minute pour avoir envoyé trop de messages en peu de temps.",
                    )
                    .setTimestamp(),
                ],
              });
              // Supprimer le message de timeout après 5 secondes
              if (timeoutMessage.deletable) {
                setTimeout(() => timeoutMessage.delete().catch(() => {}), 5000);
              }
            }
            //ajouter un warn à l'utilisateur
            const userWarn = await addWarn(message.author, "spam de message"); // DM à l'utilisateur
            await message.author
              .send({
                embeds: [
                  new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle(`⚠️ Vous avez été warn sur ${message.guild.name}`)
                    .addFields(
                      {
                        name: "Raison",
                        value: "Spam détecté par l'antispam",
                      },
                      { name: "Total de warns", value: `${userWarn.warn}` },
                    )
                    .setTimestamp(),
                ],
              })
              .catch(() => {}); // Ignorer les erreurs si le DM échoue
            // Log le warn dans le channel de log si configuré
            const logChannel = message.guild.channels.cache.get(
              guildConfig?.modLogChannel,
            );
            if (logChannel && logChannel.isTextBased()) {
              const logEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("⚠️ Utilisateur warn pour spam")
                .addFields(
                  { name: "Utilisateur", value: `<@${message.author.id}>` },
                  { name: "Raison", value: "Spam détecté par l'antispam" },
                  { name: "Total de warns", value: `${userWarn.warn}` },
                )
                .setTimestamp();
              logChannel.send({ embeds: [logEmbed] }).catch(() => {});
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du message:", error);
      }
    }
  },
};
