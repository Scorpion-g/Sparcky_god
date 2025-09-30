const registerCommands = require('./01registerCommands.js');

module.exports = {
  name: 'clientReady', // Discord.js v15
  once: true,
  async execute(client) {
    logger.info(`${client.user.tag} est en ligne ✔️ !`);

    // Synchronisation automatique des commandes
    await registerCommands.execute(client);
    logger.info('✅ Synchronisation des commandes terminée.');
  }
};

