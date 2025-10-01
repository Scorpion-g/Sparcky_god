const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../models/User");
const logger = require("../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Payer un utilisateur")
    .addUserOption((option) =>
      option
        .setName("utilisateur")
        .setDescription("Utilisateur à qui vous voulez payer")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("montant")
        .setDescription("Montant à payer")
        .setRequired(true),
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser("utilisateur");
    const amount = interaction.options.getInteger("montant");

    if (targetUser.id === interaction.user.id) {
      return interaction.reply({
        content: "Vous ne pouvez pas vous payer vous-même.",
        ephemeral: true,
      });
    }

    if (amount <= 0) {
      return interaction.reply({
        content: "Le montant doit être supérieur à zéro.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      let payer = await User.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id,
      });
      if (!payer) {
        payer = new User({
          userId: interaction.user.id,
          guildId: interaction.guild.id,
          balance: 0,
        });
      }

      if (payer.balance < amount) {
        return interaction.editReply({
          content: "Vous n'avez pas assez de fonds pour effectuer ce paiement.",
          ephemeral: true,
        });
      }

      let payee = await User.findOne({ userId: targetUser.id , guildId: interaction.guild.id });
      if (!payee) {
        payee = new User({ userId: targetUser.id,guildId: interaction.guild.id, balance: 0 });
      }

      payer.balance -= amount;
      payee.balance += amount;

      await payer.save();
      await payee.save();

      const embed = new EmbedBuilder()
        .setTitle("Paiement effectué")
        .setDescription("Votre paiement a été effectué avec succès.")
        .addFields(
          { name: "Payeur", value: `<@${interaction.user.id}>`, inline: true },
          { name: "Bénéficiaire", value: `<@${targetUser.id}>`, inline: true },
          { name: "Montant", value: `${amount}`, inline: true },
        )
        .setColor("#00FF00")
        .setTimestamp();

      await interaction.editReply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      logger.error(`Erreur lors du paiement: ${error}`);
      await interaction.editReply({
        content:
          "Une erreur est survenue lors du traitement de votre paiement.",
        ephemeral: true,
      });
    }
  },
};
