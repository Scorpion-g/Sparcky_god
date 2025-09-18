const { SlashCommandBuilder,EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Affiche la liste des commandes"),
  async execute(interaction) {
    try {
      const commands = interaction.client.commands;
      let helpMessage = "";
      let helpUsage = "";
      let helpName = "";
      let helpDescription = "";
      commands.forEach((command) => { 
        helpName += `${command.data.name}\n`;
        helpDescription += `${command.data.description}\n`;
        helpUsage = `/${command.data.name}`;
        if (command.data.options && command.data.options.length > 0) {
          command.data.options.forEach((option) => {
            helpUsage += ` <${option.name}>`;
          });
        }
        helpMessage += `\`${helpUsage}\`\n`;
      });
      // Create the embed message for help command
      const helpEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Liste des commandes")
      .addFields(
        { name: 'Commandes', value: `**__${helpName}__**`, inline: true },
        { name: 'Descriptions', value: `**${helpDescription}**`, inline: true },
        { name: `Usage`, value: helpMessage, inline: false },
      )
      .addFields(
        { name: 'Support', value: '[Rejoindre le serveur support](https://discord.gg/your-invite-link)', inline: true },
        { name: 'Invite', value: `[Ajouter le bot à votre serveur](https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=bot%20applications.commands&permissions=8)`, inline: true },
      )
      .setTimestamp();
      await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    } catch (error) {
      console.error(`Erreur lors de l'exécution de la commande help: ${error}`);
      await interaction.reply({
        content: "❌ | Une erreur est survenue lors de l'exécution de la commande help.",
        ephemeral: true,
      });
    }
  },
};
