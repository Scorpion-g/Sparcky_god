const registerCommands = require('./01registerCommands.js');

module.exports = {
  name: 'clientReady', // Discord.js v15
  once: true,
  async execute(client) {
    console.log(`${client.user.tag} est en ligne ✔️ !`);

    // Synchronisation automatique des commandes
    await registerCommands.execute(client);
    console.log('✅ Synchronisation des commandes terminée.');
  }
};

