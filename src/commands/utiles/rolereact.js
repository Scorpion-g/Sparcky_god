const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rolereact")
    .setDescription("Configure un message de réaction pour obtenir un rôle")
    .addStringOption((option) =>
      option
        .setName("message_id")
        .setDescription("L'ID du message à configurer")
        .setRequired(true),
    )
    .addRoleOption((option) =>
      option
        .setName("rôle")
        .setDescription("Le rôle à attribuer")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("button_emoji")
        .setDescription("Emoji du bouton (Unicode ou ID d'emoji personnalisé)")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: "❌ Cette commande ne peut être utilisée que dans un serveur.",
        ephemeral: true,
      });
    }

    const messageId = interaction.options.getString("message_id");
    const role = interaction.options.getRole("rôle");
    const buttonEmoji = interaction.options.getString("button_emoji");

    await interaction.deferReply({ ephemeral: true });

    // Vérifier permissions bot
    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.ManageRoles,
      )
    ) {
      return interaction.editReply(
        "❌ Je n'ai pas la permission de gérer les rôles.",
      );
    }
    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.editReply(
        "❌ Je ne peux pas attribuer ce rôle car il est au-dessus de mon rôle le plus élevé.",
      );
    }

    // Récupérer le message
    let targetMessage;
    try {
      targetMessage = await interaction.channel.messages.fetch(messageId);
    } catch (error) {
       interaction.editReply(
        `❌ Impossible de récupérer le message. Vérifie l'ID.` ,
      );
      console.error("Erreur lors de la récupération du message :", error);
    }

    // Vérifier emoji
    let emoji = buttonEmoji;
    if (/^\d+$/.test(buttonEmoji)) {
      emoji = interaction.guild.emojis.cache.get(buttonEmoji);
      if (!emoji) {
        return interaction.editReply(
          "❌ Emoji personnalisé introuvable dans ce serveur.",
        );
      }
    }

    // Créer le bouton
    const button = new ButtonBuilder()
      .setCustomId(`role_react_${role.id}`)
      .setLabel(`Obtenir le rôle ${role.name}`)
      .setStyle(ButtonStyle.Primary)
      .setEmoji(emoji);

    // Ajouter le bouton
    let row;
    if (targetMessage.components.length > 0) {
      row = ActionRowBuilder.from(targetMessage.components[0]);
      if (
        row.components.some(
          (comp) => comp.data.custom_id === button.data.custom_id,
        )
      ) {
        return interaction.editReply(
          "❌ Un bouton pour ce rôle existe déjà sur ce message.",
        );
      }
      if (row.components.length >= 5) {
        return interaction.editReply(
          "❌ Impossible d'ajouter plus de 5 boutons par ligne.",
        );
      }
      row.addComponents(button);
    } else {
      row = new ActionRowBuilder().addComponents(button);
    }

    try {
      await targetMessage.edit({ components: [row] });
    } catch (error) {
       interaction.editReply(
        `❌ Impossible d'ajouter le bouton au message.`,
      );
      console.error("Erreur lors de l'édition du message :", error);
    }

    // Confirmation
    const successEmbed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("Configuration réussie")
      .setDescription(
        `✅ Le message a été configuré pour attribuer le rôle **${role.name}** avec le bouton.`,
      )
      .setTimestamp();

    return interaction.editReply({ embeds: [successEmbed] });
  },
};
