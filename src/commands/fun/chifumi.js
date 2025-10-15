const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const logger = require("../../utils/logger");
const User = require("../../models/User");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("chifumi")
    .setDescription("Jouer au chifumi contre le bot")
    .addStringOption((option) =>
      option
        .setName("choix")
        .setDescription("Choisissez pierre, feuille ou ciseaux")
        .setRequired(true)
        .addChoices(
          { name: "pierre", value: "pierre" },
          { name: "feuille", value: "feuille" },
          { name: "ciseaux", value: "ciseaux" },
        ),
    )
    .addMentionableOption((option) =>
      option
        .setName("opponent")
        .setDescription(
          "Mentionnez un utilisateur pour jouer contre lui (optionnel)",
        )
        .setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName("mise")
        .setDescription("Misez un montant (optionnel)")
        .setRequired(false)
        .setMinValue(1),
    ),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const userChoice = interaction.options.getString("choix");
    const choices = ["pierre", "feuille", "ciseaux"];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    const opponent = interaction.options.getMentionable("opponent");
    const betAmount = interaction.options.getInteger("mise") || 0;
    let userData;
    // Gestion de la mise
    if (betAmount > 0) {
      let userData = await User.findOne({guildId:guildId, userId: interaction.user.id });

      if (!userData) {
        userData = new User({guildId:guildId , userId: interaction.user.id, balance: 100 }); // Initial balance
      }

      if (userData.balance < betAmount) {
        return interaction.reply({
          content: "Vous n'avez pas assez de fonds pour cette mise.",
          ephemeral: true,
        });
      }

      userData.balance -= betAmount;
      await userData.save();
    }

    // Jeu contre un autre utilisateur

    if (opponent && opponent.id === interaction.user.id) {
      userData = await User.findOne({guildId:guildId, userId: interaction.user.id });
      if (betAmount > 0 && userData) {
        userData.balance += betAmount; // Rembourse la mise
        await userData.save();
      }
      return interaction.reply({
        content: "Vous ne pouvez pas jouer contre vous-même!",
        ephemeral: true,
      });
    }

    if (
      opponent &&
      opponent.user.bot &&
      opponent.id !== interaction.client.user.id
    ) {
      userData = await User.findOne({ guildId:guildId, userId: interaction.user.id });
      if (betAmount > 0 && userData) {
        userData.balance += betAmount; // Rembourse la mise
        await userData.save();
      }
      return interaction.reply({
        content: "Vous ne pouvez pas jouer contre un bot autre que moi même !",
        ephemeral: true,
      });
    }
    if (opponent && opponent.id !== interaction.client.user.id) {
      const filter = (m) => m.author.id === opponent.id;
      await interaction.reply({
        content: `${opponent}, c'est à votre tour de choisir pierre, feuille ou ciseaux ! (Vous avez 30 secondes et la mise est de ${betAmount}) `,
      });

      try {
        const collected = await interaction.channel.awaitMessages({
          filter,
          max: 1,
          time: 30000,
          errors: ["time"],
        });
        const opponentChoice = collected.first().content.toLowerCase();
        if (!choices.map((c) => c.split(" ")[0]).includes(opponentChoice)) {
          return interaction.followUp({
            content:
              "Choix invalide! Veuillez choisir entre pierre, feuille ou ciseaux.",
          });
        }

        let result;
        if (userChoice == opponentChoice) {
          result = "Égalité!";
          userData = await User.findOne({ userId: interaction.user.id,guildId:guildId });
          if (betAmount > 0 && userData) {
            userData.balance += betAmount; // Rembourse la mise
            await userData.save();
          }
          userData = await User.findOne({ userId: opponent.id , guildId:guildId});
          if (betAmount > 0 && userData) {
            userData.balance += betAmount; // Rembourse la mise
            await userData.save();
          }
          new embed().setDescription(
            `Égalité! ${interaction.user.username} et ${opponent.user.username} récupèrent leur mise de ${betAmount} crédits chacun.`,
          );
        } else if (
          (userChoice == "pierre" && opponentChoice == "ciseaux") ||
          (userChoice == "feuille" && opponentChoice == "pierre") ||
          (userChoice == "ciseaux" && opponentChoice == "feuille")
        ) {
          result = `${interaction.user.username} gagne!`;
          userData = await User.findOne({ userId: interaction.user.id, guildId:guildId });
          if (betAmount > 0) {
            userData.balance += betAmount * 2; // Gagne le double de la mise
            await userData.save();
          }
          userData = await User.findOne({ userId: opponent.id , guildId:guildId });
          if (betAmount > 0 && userData) {
            userData.balance -= betAmount; // Perd la mise
            await userData.save();
          }
          const embed = new EmbedBuilder().setDescription(
            `${interaction.user.username} a gagné ${betAmount * 2} crédits en battant ${opponent.user.username} !`,
          );
          await interaction.followUp({ embeds: [embed] });
          
        } else {
          result = `${opponent.user.username} gagne!`;
          let opponentData = await User.findOne({ userId: opponent.id , guildId:guildId});
          if (betAmount > 0 && opponentData) {
            opponentData.balance += betAmount * 2; // Gagne le double de la mise
            await opponentData.save();
          }
          userData = await User.findOne({ userId: interaction.user.id ,guildId:guildId });
          if (betAmount > 0) {
            userData.balance -= betAmount; // Perd la mise
            await userData.save();
          }
          const embed = new EmbedBuilder().setDescription(
            `${opponent.user.username} a gagné ${betAmount * 2} crédits en battant ${interaction.user.username} !`,
          );
          await interaction.followUp({ embeds: [embed] });
          
        }

        const embed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle("Chifumi")
          .addFields(
            {
              name: `${interaction.user.username} a choisi`,
              value: userChoice,
              inline: true,
            },
            {
              name: `${opponent.user.username} a choisi`,
              value: opponentChoice,
              inline: true,
            },
            { name: "Résultat", value: result, inline: false },
          )
          .setTimestamp();

        return interaction.followUp({ embeds: [embed] });
      } catch (e) {
        logger.error(e);
        return interaction.followUp({
          content: "Temps écoulé! Aucun choix reçu.",
        });
      }
    }
    // Jeu contre le bot
    // Détermine le gagnant
    let result;
    if (userChoice === botChoice) {
      result = "Égalité!";
    } else if (
      (userChoice === "pierre" && botChoice === "ciseaux") ||
      (userChoice === "feuille" && botChoice === "pierre") ||
      (userChoice === "ciseaux" && botChoice === "feuille")
    ) {
      result = "Vous gagnez!";
    } else {
      result = "Le bot gagne!";
    }

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Chifumi")
      .addFields(
        { name: "Votre choix", value: userChoice, inline: true },
        { name: "Choix du bot", value: botChoice, inline: true },
        { name: "Résultat", value: result, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
