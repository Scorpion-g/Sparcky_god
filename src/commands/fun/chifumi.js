const { SlashCommandBuilder,EmbedBuilder } = require("discord.js");

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
          { name: "pierre", value: "pierre ✊" },
          { name: "feuille", value: "feuille  " },
          { name: "ciseaux", value: "ciseaux ✌️" },
        ),
    ),
  async execute(interaction) {
    const userChoice = interaction.options.getString("choix");
    const choices = ["pierre ✊", "feuille ✋", "ciseaux ✌️"];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

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
