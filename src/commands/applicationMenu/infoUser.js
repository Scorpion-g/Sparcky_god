const {
  ContextMenuCommandBuilder,
  EmbedBuilder,
  ApplicationCommandType,
} = require("discord.js");
const Level = require("../../models/Level");
const Warn = require("../../models/Warn");
const logger = require("../../utils/logger");
module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("info")
    .setType(ApplicationCommandType.User), //2 pour les utilisateurs
  async execute(interaction) {
    try {
      const user = interaction.targetUser;
      const member = await interaction.guild.members
        .fetch(user.id)
        .catch(() => null);
      if (!member) {
        return interaction.reply({
          content: "Utilisateur non trouvé dans ce serveur.",
          ephemeral: true,
        });
      }
      //Récupérer les informations de niveau
      const levelData = await Level.findOne({
        userId: user.id,
        guildId: interaction.guild.id,
      });
      //Récupérer les informations de warns
      const warns = await Warn.find({
        userId: user.id,
        guildId: interaction.guild.id,
      });
      const embed = new EmbedBuilder()
        .setTitle(`Infos de ${user.tag}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setColor("#0099ff")
        .addFields(
          { name: "🆔 ID", value: user.id, inline: true },
          {
            name: "📅 Compte créé le",
            value: `<t:${Math.floor(user.createdTimestamp / 1000)}: F>`,
            inline: true,
          },
          {
            name: "👤 Rejoint le serveur",
            value: member.joinedAt
              ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>`
              : "Inconnu",
            inline: true,
          },
          {
            name: "🏷️ Rôles",
            value:
              member.roles.cache.size > 1
                ? member.roles.cache
                  .filter((r) => r.id !== interaction.guild.id)
                  .map((r) => r.name)
                  .join(", ")
                : "Aucun rôle",
            inline: false,
          },
          { name: "⚠️ Warns", value: warns.length.toString(), inline: true },
          {
            name: "⭐ Niveau",
            value: levelData
              ? `Niveau ${levelData.level} (${levelData.xp} XP)`
              : "Aucun niveau",
            inline: true,
          },
        )
        .setTimestamp();
      try {
        if (member.presence) {
          embed.addFields({
            name: "Statut",
            value: member.presence.status,
            inline: true,
          });
          if (member.presence.activities.length > 0) {
            const activities = member.presence.activities
              .map((activity) => {
                let activityType;
                switch (activity.type) {
                  case 0:
                    activityType = "Joue à";
                    break;
                  case 1:
                    activityType = "En streaming";
                    break;
                  case 2:
                    activityType = "Écoute";
                    break;
                  case 3:
                    activityType = "Regarde";
                    break;
                  case 4:
                    activityType = "Fait";
                    break;
                  case 5:
                    activityType = "Compétition";
                    break;
                  default:
                    activityType = "Fait quelque chose";
                }
                return `${activityType} ${activity.name}`;
              })
              .join("\n");
            embed.addFields({
              name: "Activités",
              value: activities,
              inline: false,
            });
          }
        }
      } catch (error) {
        logger.error("Erreur lors de la récupération de la présence :", error);
      }

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      logger.error(
        "Erreur lors de l'exécution de la commande infouser :",
        error,
      );
      await interaction.reply({
        content: "Une erreur est survenue lors de l'exécution de la commande.",
        ephemeral: true,
      });
    }
  },
};
