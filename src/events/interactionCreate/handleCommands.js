module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(client, interaction) {
    if (!interaction.isCommand() && !interaction.isContextMenuCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`Erreur lors de l'exécution de la commande ${interaction.commandName}:`, error);
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

