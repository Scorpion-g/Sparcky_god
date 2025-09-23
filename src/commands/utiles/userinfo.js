const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const warn = require("../../models/Warn");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Retourne les informations d'un utilisateur")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("L'utilisateur dont vous voulez les informations")
        .setRequired(false),
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);

    const createdAt = user.createdAt.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });

    const joinedAt = member.joinedAt
      ? member.joinedAt.toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        })
      : "Date de join non disponible";
    const warns = await warn.find({
      userId: user.id,
      guildId: interaction.guild.id,
    });
    const roles =
      member.roles.cache
        .filter((role) => role.id !== interaction.guild.id)
        .map((role) => role.toString())
        .join(", ") || "Aucun rôle";

    const userInfo = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`Informations sur ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setDescription(`Voici les informations de l'utilisateur :`)
      .addFields(
        {
          name: "**Nom d'utilisateur :** ",
          value: user.tag,
        },
        {
          name: "**ID :**",
          value: user.id,
        },
        {
          name: "**Surnom :**",
          value: member.nickname ? member.nickname : "Aucun surnom",
          inline: true,
        },
        {
          name: "**Nombre de warns :**",
          value: `${warns.length}`,
        },
        {
          name: "**Serveur :**",
          value: interaction.guild.name,
          inline: true,
        },
        {
          name: "**Créé le :**",
          value: createdAt,
          inline: true,
        },
        {
          name: "**A rejoint le :**",
          value: joinedAt,
          inline: true,
        },
        {
          name: "**Rôles :**",
          value: roles,
        },
        {
          name: "**Statut :**",
          value: user.presence ? user.presence.status : "Hors ligne",
          inline: true,
        },
        {
          name: "Bot :",
          value: user.bot ? "Oui" : "Non",
          inline: true,
        },
        {
          name: "Dernier message :",
          value: member.lastMessage
            ? member.lastMessage.content
            : "Aucun message",
          inline: true,
        },
      )
      .setFooter({
        text: `Demandé par ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();
    await interaction.reply({ embeds: [userInfo], ephemeral: true });
  },
};
