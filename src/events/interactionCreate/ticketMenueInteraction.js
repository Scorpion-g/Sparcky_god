const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(client, interaction) {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === "select_ticket_category") {
      const categorie = interaction.values[0]; // la valeur choisie

      // Création du salon
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
          `Bonjour ${interaction.user}, un membre du support va vous répondre bientôt.`
        )
        .addFields({
          name: "Catégorie",
          value:
            categorie === "support_technique"
              ? "Support Technique"
              : categorie === "facturation"
                ? "Facturation"
                : "Autre",
          inline: true,
        })
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
  },
};

