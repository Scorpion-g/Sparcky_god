const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Système de tickets")
    .addSubcommand((sub) =>
      sub
        .setName("create")
        .setDescription("Créer un ticket pour contacter le support")
        .addStringOption((option) =>
          option
            .setName("raison")
            .setDescription("Raison du ticket")
            .setRequired(true)
            .setMaxLength(100),
        )
        .addStringOption((option) =>
          option
            .setName("categorie")
            .setDescription("Catégorie du ticket")
            .setRequired(true)
            .addChoices(
              { name: "Support Technique", value: "support_technique" },
              { name: "Facturation", value: "facturation" },
              { name: "Autre", value: "autre" },
            ),
        )
        .addStringOption((option) =>
          option
            .setName("details")
            .setDescription("Détails supplémentaires (optionnel)")
            .setRequired(false)
            .setMaxLength(300),
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("close")
        .setDescription("Fermer le ticket actuel")
    )
    .addSubcommand((sub) =>
      sub
        .setName("menu")
        .setDescription("Afficher le menu déroulant de création de ticket")
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    // === /ticket create ===
    if (subcommand === "create") {
      const raison = interaction.options.getString("raison");
      const categorie = interaction.options.getString("categorie");
      const details = interaction.options.getString("details") ?? "Aucun détail supplémentaire fourni.";

      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: 0,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: ["ViewChannel"],
          },
          {
            id: interaction.user.id,
            allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
          },
        ],
      });

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("🎫 Nouveau Ticket")
        .setDescription(
          `Bonjour ${interaction.user}, un membre du support va vous répondre bientôt.\n\n**Raison du ticket :** ${raison}`,
        )
        .addFields(
          {
            name: "Catégorie",
            value:
              categorie === "support_technique"
                ? "Support Technique"
                : categorie === "facturation"
                  ? "Facturation"
                  : "Autre",
            inline: true,
          },
          { name: "Détails supplémentaires", value: details, inline: false },
        )
        .setTimestamp();

      await ticketChannel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
      });

      await interaction.reply({
        content: `✅ Votre ticket a été créé : ${ticketChannel}`,
        ephemeral: true,
      });
    }

    // === /ticket menu ===
    else if (subcommand === "menu") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) { 
        return interaction.reply({
          content: "❌ Vous n'avez pas la permission d'utiliser cette commande.",
          ephemeral: true,
        });
      }

      const row = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('select_ticket_category')
            .setPlaceholder('Choisissez une catégorie de ticket')
            .addOptions([
              {
                label: 'Support Technique',
                description: 'Obtenez de l\'aide pour les problèmes techniques',
                value: 'support_technique',
              },
              {
                label: 'Facturation',
                description: 'Questions concernant la facturation et les paiements',
                value: 'facturation',
              },
              {
                label: 'Autre',
                description: 'Pour toute autre demande',
                value: 'autre',
              },
            ]),
        );

      await interaction.reply({ 
        content: 'Sélectionnez une catégorie pour créer un ticket:', 
        components: [row] 
      });
    }

    // === /ticket close ===
    else if (subcommand === "close") {
      if (!interaction.channel.name.startsWith("ticket-")) {
        return interaction.reply({
          content: "❌ Vous ne pouvez fermer qu’un ticket.",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: "✅ Le ticket va être fermé.",
        ephemeral: true,
      });

      setTimeout(() => {
        interaction.channel.delete().catch(console.error);
      }, 2000);
    }
  },
};

