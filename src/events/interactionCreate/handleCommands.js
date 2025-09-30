const logger = require("../../utils/logger"); // Assure-toi d'avoir ton logger Winston ici

module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(client, interaction) {
    // --- Autocomplete ---
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command || !command.autocomplete) return;

      try {
        await command.autocomplete(interaction);
        logger.info(`Autocomplete exécuté: ${interaction.commandName} par ${interaction.user.tag}`);
      } catch (error) {
        logger.error(`Erreur autocomplete de ${interaction.commandName} par ${interaction.user.tag}: ${error.stack}`);
      }
      return; // on arrête ici pour ne pas exécuter execute()
    }

    // --- Commandes ---
    if (!interaction.isCommand() && !interaction.isContextMenuCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    logger.info(`Commande exécutée: ${interaction.commandName} par ${interaction.user.tag} (${interaction.user.id}) dans le serveur ${interaction.guild?.name || "DM"}`);

    try {
      await command.execute(interaction, client);
    } catch (error) {
      logger.error(`Erreur lors de l'exécution de la commande ${interaction.commandName} par ${interaction.user.tag}: ${error.stack}`);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "❌ Une erreur est survenue lors de l'exécution de cette commande.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "❌ Une erreur est survenue lors de l'exécution de cette commande.",
          ephemeral: true,
        });
      }
    }
  },
};

