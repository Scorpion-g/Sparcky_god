const { testServer } = require("../../../config.json");
const getLocalCommands = require("../../utils/getLocalCommands");
const areCommandsDifferent = require("../../utils/areCommandsDifferent");
const getApplicationCommands = require("../../utils/getApplicationCommands");

module.exports = {
  name: "registerCommands",
  async execute(client) {
    try {
      // Récupère toutes les commandes locales (fichiers)
      const localCommands = getLocalCommands();

      // Récupère toutes les commandes déjà enregistrées sur Discord pour le serveur
      const applicationCommands = await getApplicationCommands(
        client,
        testServer,
      );

      // --- Supprimer les commandes sur Discord qui n'existent plus localement ---
      for (const appCommand of applicationCommands.cache.values()) {
        const existsLocally = localCommands.some(
          (c) => c.data.name === appCommand.name,
        );
        if (!existsLocally) {
          await applicationCommands.delete(appCommand.id);
          console.log(`Commande supprimée sur Discord: ${appCommand.name}`);
          client.commands.delete(appCommand.name); // Supprime de la collection locale
        }
      }

      // --- Créer ou mettre à jour les commandes locales ---
      for (const localCommand of localCommands) {
        const commandData = localCommand.data.toJSON();

        if (!commandData.name) {
          console.log(`⚠️ Commande ignorée car name manquant:`, localCommand);
          continue;
        }

        // Les context menu (User / Message) n'ont pas de description
        if (commandData.type === 1 && !commandData.description) {
          console.log(
            `⚠️ Commande slash ignorée car description manquante:`,
            localCommand,
          );
          continue;
        }
        const existingCommand = applicationCommands.cache.find(
          (cmd) => cmd.name === commandData.name,
        );

        if (existingCommand) {
          // Mise à jour si besoin
          if (areCommandsDifferent(existingCommand, commandData)) {
            await applicationCommands.edit(existingCommand.id, commandData);
            console.log(`Commande mise à jour: "${commandData.name}"`);
          }
        } else {
          // Création si n'existe pas
          await applicationCommands.create(commandData);
          console.log(`Commande créée: "${commandData.name}"`);
        }

        // Ajout dans client.commands pour utilisation dans interactionCreate
        client.commands.set(commandData.name, localCommand);
      }

      console.log(`✅ Synchronisation complète des commandes terminée.`);
    } catch (error) {
      console.error("Erreur lors de la synchronisation des commandes:", error);
    }
  },
};
