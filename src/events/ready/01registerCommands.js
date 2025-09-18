const { testServer } = require("../../../config.json");
const getLocalCommands = require("../../utils/getLocalCommands");
const areCommandsDifferent = require("../../utils/areCommandsDifferent");
const getApplicationCommands = require("../../utils/getApplicationCommands");

module.exports = {
  name: "registerCommands",
  async execute(client) {
    try {
      const localCommands = getLocalCommands();
      const applicationCommands = await getApplicationCommands(
        client,
        testServer,
      );

      for (const localCommand of localCommands) {
        const commandData = localCommand.data.toJSON();

        if (!commandData.name || !commandData.description) {
          console.log(
            `⚠️ Commande ignorée car name ou description manquant:`,
            localCommand,
          );
          continue;
        }

        const existingCommand = applicationCommands.cache.find(
          (cmd) => cmd.name === commandData.name,
        );

        if (existingCommand) {
          if (localCommand.deleted) {
            await applicationCommands.delete(existingCommand.id);
            console.log(`La commande "${commandData.name}" a été supprimée.`);
            // Retirer de la collection locale si elle existait
            client.commands.delete(commandData.name);
            continue;
          }

          if (areCommandsDifferent(existingCommand, commandData)) {
            await applicationCommands.edit(existingCommand.id, commandData);
            console.log(`Modification de la commande "${commandData.name}".`);
          }

          // Ajout ou mise à jour dans client.commands
          client.commands.set(commandData.name, localCommand);
        } else {
          if (localCommand.deleted) {
            console.log(
              `Commande "${commandData.name}" ignorée car marquée supprimée.`,
            );
            continue;
          }

          console.log("Création de la commande :", commandData);
          await applicationCommands.create(commandData);
          console.log(`Enregistrement de "${commandData.name}" ✅`);

          // Ajout dans client.commands
          client.commands.set(commandData.name, localCommand);
        }
      }

      console.log(
        `✅ Toutes les commandes locales ont été synchronisées et ajoutées à client.commands.`,
      );
    } catch (error) {
      console.error("Erreur lors de la synchronisation des commandes :", error);
    }
  },
};
