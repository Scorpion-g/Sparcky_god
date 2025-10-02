const { EmbedBuilder } = require("discord.js");
const logger = require("../../utils/logger"); // Assure-toi d'avoir ton logger Winston ici
const TicketSettings = require("../../models/Ticket");
module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(client, interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "ticket_menu") return;

    const selectedType = interaction.values[0];
    const guild = interaction.guild;
    const ticketSettings = await TicketSettings.findOne({ guildId: guild.id });
    if (!ticketSettings) {
      return interaction.reply({
        content: "Le système de ticket n'est pas configuré sur ce serveur.",
        ephemeral: true,
      });
    }

    const supportRoleId = ticketSettings.supportRoleId;
    const ticketCategoryId = ticketSettings.ticketCategoryId;

      

    // Vérifie si l'utilisateur a déjà un ticket ouvert
    const existingChannel = guild.channels.cache.find(
      (channel) =>
        channel.name === `ticket-${interaction.user.username}` &&
        channel.parentId === ticketCategoryId,
    );
    if (existingChannel) {
      return interaction.reply({
        content: `Vous avez déjà un ticket ouvert : ${existingChannel}`,
        ephemeral: true,
      });
    }

    // Permissions pour le salon de ticket
    const permissions = [
      {
        id: guild.roles.everyone, // Tout le monde
        deny: ["ViewChannel"],
      },
      {
        id: interaction.user.id, // L'utilisateur qui a ouvert le ticket
        allow: [
          "ViewChannel",
          "SendMessages",
          "ReadMessageHistory",
          "AttachFiles",
          "EmbedLinks",
        ],
      },
      {
        id: supportRoleId, // Rôle de support
        allow: [
          "ViewChannel",
          "SendMessages",
          "ReadMessageHistory",
          "AttachFiles",
          "EmbedLinks",
        ],
      },
    ];

    // Crée le salon de ticket
    try {
      // Crée le salon de ticket
      const ticketChannel = await guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: 0, // Type de salon texte
        parent: ticketCategoryId,
        permissionOverwrites: permissions,
        reason: `Ticket créé par ${interaction.user.tag} (${interaction.user.id})`,
      });

      const embed = new EmbedBuilder()
        .setTitle(`Nouveau ticket - ${selectedType}`)
        .setDescription(
          `Bonjour ${interaction.user}, un membre de notre équipe de support vous répondra bientôt.\n\nVeuillez décrire votre problème en détail pour que nous puissions vous aider au mieux.`,
        )
        .setColor("Blue")
        .setFooter({ text: "Support Team" })
        .setTimestamp();

      await ticketChannel.send({
        content: `${interaction.user} <@&${supportRoleId}>`,
        embeds: [embed],
      });

      await interaction.reply({
        content: `Votre ticket a été créé : ${ticketChannel}`,
        ephemeral: true,
      });
    } catch (error) {
      logger.error(`Erreur lors de la création du ticket : ${error}`);
      return interaction.reply({
        content:
          "Une erreur est survenue lors de la création de votre ticket. Veuillez réessayer plus tard.",
        ephemeral: true,
      });
    }
  },
};
