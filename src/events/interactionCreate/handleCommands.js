module.exports = {
  name: 'interactionCreate',
  async execute(client, interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.log(`Commande non trouvée: ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Erreur lors de l'exécution de la commande ${interaction.commandName}:`, error);
      await interaction.reply({ content: 'Une erreur est survenue.', ephemeral: true });
    }
  }
};
;
