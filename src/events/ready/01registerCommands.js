const { testServer } = require("../../../config.json");
const getLocalCommands = require("../../utils/getLocalCommands");
const areCommandsDifferent = require("../../utils/areCommandsDifferent");
const getApplicationCommands = require("../../utils/getApplicationCommands");

module.exports = {
  name: "registerCommands",
  async execute(client) {
    try {
      // Récupérer toutes les commandes locales (dans ton code)
      const localCommands = getLocalCommands();

      // Récupérer les commandes du serveur test (rapide pour dev)
      const guildCommands = await getApplicationCommands(client, testServer);

      // Récupérer les commandes globales (partout sur Discord)
      const globalCommands = client.application.commands;

      // Fonction générique de synchro
      async function syncCommands(applicationCommands, scope = "global") {
        // --- Supprimer les commandes sur Discord qui n'existent plus localement ---
        for (const appCommand of applicationCommands.cache.values()) {
          const existsLocally = localCommands.some(
            (c) => c.data.name === appCommand.name,
          );

          if (!existsLocally) {
            await applicationCommands.delete(appCommand.id);
            console.log(`🗑️ Commande supprimée (${scope}): ${appCommand.name}`);
            client.commands.delete(appCommand.name);
          }
        }

        // --- Créer ou mettre à jour les commandes locales ---
        for (const localCommand of localCommands) {
          const commandData = localCommand.data.toJSON();

          if (!commandData.name) {
            console.log(`⚠️ Commande ignorée car name manquant:`, localCommand);
            continue;
          }

          // Vérif description (sauf menus contextuels)
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
            if (areCommandsDifferent(existingCommand, commandData)) {
              await applicationCommands.edit(existingCommand.id, commandData);
              console.log(`♻️ Commande mise à jour (${scope}): "${commandData.name}"`);
            }
          } else {
            await applicationCommands.create(commandData);
            console.log(`✨ Commande créée (${scope}): "${commandData.name}"`);
          }

          client.commands.set(commandData.name, localCommand);
        }
      }

      // Synchro serveur test
      await syncCommands(guildCommands, "guild");

      // Synchro globales (⚠️ prend parfois 1h à se propager sur Discord)
      await syncCommands(globalCommands, "global");

      console.log("✅ Synchronisation complète des commandes terminée.");
    } catch (error) {
      console.error("❌ Erreur lors de la synchronisation des commandes:", error);
    }
  },
};

