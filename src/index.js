require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');
const logger = require('./utils/logger');

// Gestion des erreurs globales
process.on("unhandledRejection", (reason, promise) => {
  logger.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  logger.error("❌ Uncaught Exception:", err);
});
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildModeration,
    IntentsBitField.Flags.GuildIntegrations,
    IntentsBitField.Flags.GuildWebhooks,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.DirectMessageReactions,
    IntentsBitField.Flags.DirectMessageTyping,
  ],
});

// Initialise la collection pour les commandes
client.commands = new Map();

(async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    // Charge tous les events
    eventHandler(client);

    client.login(process.env.TOKEN);
  } catch (error) {
    console.error('Erreur au lancement du bot:', error);
  }
})();

