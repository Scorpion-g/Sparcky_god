const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Système de ticket")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName("setup")
        .setDescription("Configurer le système de ticket")
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("Le salon où le panneau sera envoyé")
            .setRequired(true)
            .addChannelTypes(0),
        )
        .addRoleOption((opt) =>
          opt
            .setName("support_role")
            .setDescription("Rôle qui pourra voir les tickets")
            .setRequired(true),
        )
        .addChannelOption((opt) =>
          opt
            .setName("ticket_category")
            .setDescription("Catégorie où les tickets seront créés")
            .setRequired(true)
            .addChannelTypes(4),
        )
       .addChannelOption((opt) =>
          opt
            .setName("log_channel")
            .setDescription("Salon pour logs")
            .setRequired(true)
            .addChannelTypes(0),
        )
        .addStringOption((opt) =>
          opt
            .setName("ticket_types")
            .setDescription("Types de tickets séparés par des virgules")
            .setRequired(false),
        )
        .addStringOption((opt) =>
          opt
            .setName("ticket_description")
            .setDescription("Description du panneau")
            .setRequired(false),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("delete")
        .setDescription("Supprimer la configuration du système de ticket"),
    )
    .addSubcommand((sub) =>
      sub.setName("close").setDescription("Fermer le ticket actuel"),
    ),

  async execute(interaction, client) {
    const { guild, options } = interaction;
    const subcommand = options.getSubcommand();
    const TicketSettings = require("../../models/Ticket");

    if (subcommand === "setup") {
      const channel = options.getChannel("channel");
      const supportRole = options.getRole("support_role");
      const ticketCategory = options.getChannel("ticket_category");
      const logChannel = options.getChannel("log_channel");
      const ticketTypesInput = options.getString("ticket_types");
      const ticketDescription =
        options.getString("ticket_description")?.replace(/\\n/g, '\n') ||
        "Sélectionnez le type de ticket dans le menu ci-dessous.";

      // Check si configuration déjà existante
      const existingConfig = await TicketSettings.findOne({
        guildId: guild.id,
      });
      if (existingConfig) {
        return interaction.reply({
          content:
            "Le système de ticket est déjà configuré. Utilisez `/ticket delete` avant d'en créer un nouveau.",
          ephemeral: true,
        });
      }

      // Préparer les types de tickets
      let ticketTypes = ticketTypesInput
        ? ticketTypesInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
        : ["Support", "Vente", "Signalement", "Autre"];
      if (ticketTypes.length > 25) ticketTypes = ticketTypes.slice(0, 25);

      // Enregistrer la config
      const newConfig = new TicketSettings({
        guildId: guild.id,
        supportRoleId: supportRole.id,
        ticketCategoryId: ticketCategory.id,
        logChannelId: logChannel.id,
        ticketTypes,
      });
      await newConfig.save();

      // Créer le panneau
      const embed = new EmbedBuilder()
        .setTitle("🎫 Système de Ticket")
        .setDescription(ticketDescription)
        .setColor("#0099ff")
        .setTimestamp()
        .setFooter({ text: `Demandé par ${interaction.user.tag}` });

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`ticket_menu`) // unique par serveur
          .setPlaceholder("Sélectionnez le type de ticket")
          .addOptions(
            ticketTypes.map((type, index) => ({
              label: type,
              description: `Créer un ticket de type ${type}`,
              value: `ticket_${type.toLowerCase()}_${index}`,
              emoji: "🎫",
            })),
          ),
      );

      await channel.send({ embeds: [embed], components: [row] });
      return interaction.reply({
        content: `Système de ticket configuré et panneau envoyé dans ${channel}.`,
        ephemeral: true,
      });
    }

    if (subcommand === "delete") {
      const existingConfig = await TicketSettings.findOne({
        guildId: guild.id,
      });
      if (!existingConfig) {
        return interaction.reply({
          content: "Aucune configuration trouvée pour ce serveur.",
          ephemeral: true,
        });
      }
      await TicketSettings.deleteOne({ guildId: guild.id });
      return interaction.reply({
        content: "Configuration du système de ticket supprimée.",
        ephemeral: true,
      });
    }

    if (subcommand === "close") {
      const channel = interaction.channel;
      const existingTicket = await TicketSettings.findOne({
        guildId: guild.id,
      });

      if (!existingTicket) {
        return interaction.reply({
          content:
            "❌ Le système de ticket n'est pas configuré pour ce serveur.",
          ephemeral: true,
        });
      }

      if (!channel.name.startsWith("ticket-")) {
        return interaction.reply({
          content: "❌ Ce salon n'est pas un ticket.",
          ephemeral: true,
        });
      }

      // Vérification des permissions
      if (
        interaction.user.id !== existingTicket.userId &&
        !interaction.member.roles.cache.has(existingTicket.supportRoleId) &&
        !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
      ) {
        return interaction.reply({
          content: "❌ Vous n'avez pas la permission de fermer ce ticket.",
          ephemeral: true,
        });
      }

      await interaction.deferReply({ ephemeral: true });

      // Génération du transcript HTML
      const discordTranscripts = require("discord-html-transcripts");
      const transcript = await discordTranscripts.createTranscript(channel, {
        limit: -1, // -1 = tous les messages
        returnBuffer: false,
        fileName: `${channel.name}.html`,
      });

      // Récupérer salon de logs
      const logChannel = guild.channels.cache.get(existingTicket.logChannelId);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle("📕 Ticket Fermé")
          .setDescription(
            `Le ticket **${channel.name}** a été fermé par **${interaction.user.tag}**.`,
          )
          .setColor("#ff0000")
          .setTimestamp();

        await logChannel.send({
          embeds: [logEmbed],
          files: [transcript], // ✅ transcript HTML en pièce jointe
        });
      }

      // Supprimer le salon
      await channel.delete().catch(console.error);

    }
  },
};
