const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const GuildConfiguration = require("../../models/GuildConfiguration");

module.exports = {
  name: "guildMemberAdd",
  async execute(client, member) {
    try {
      const guildConfig = await GuildConfiguration.findOne({
        guildId: member.guild.id,
      });
      if (!guildConfig || !guildConfig.antiRaid) return;

      // Logique anti-raid ici
      // Par exemple, vérifier si le membre est nouveau et appliquer des restrictions

      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Anti-Raid Alert")
        .setDescription(`Un nouveau membre a rejoint: ${member.user.tag}`)
        .setTimestamp();

      // Envoyer une notification dans un canal spécifique si nécessaire
      const logChannelId = guildConfig.modLogChannel; // Assurez-vous que ce champ existe dans votre modèle
      if (logChannelId) {
        const logChannel = member.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          logChannel.send({ embeds: [embed] });
        }
      }
      //mp le membre
      try {
        await member.send(
          "Le serveur est actuellement en système antiraid merci de votre compréhension.",
        );
      } catch (err) {
        logger.error("Impossible d'envoyer un MP au membre:", err);
      }
      // Kick le membre si nécessaire
      await member.kick("Anti-raid system activated");
    } catch (error) {
      logger.error("Erreur event guildMemberAdd:", error);
    }
  },
};
//     }
//   },
// };
