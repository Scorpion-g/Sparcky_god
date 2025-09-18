const path = require('path');
const fs = require('fs');
const { SlashCommandBuilder } = require('discord.js');

const commandsPath = path.join(__dirname, 'commands'); // adapter si nécessaire
const commandFolders = fs.readdirSync(commandsPath);

let invalidOptions = [];

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);

    if (!('data' in command)) continue;

    const data = command.data;

    // Vérifier que c'est bien un SlashCommandBuilder
    if (!(data instanceof SlashCommandBuilder)) continue;

    // Vérifier les options
    if (data.options && data.options.length > 0) {
      for (const option of data.options) {
        if (!option.name || option.name.length === 0) {
          invalidOptions.push({ file: filePath, option, reason: 'Option missing name' });
        }
        if (!option.description || option.description.length === 0) {
          invalidOptions.push({ file: filePath, option, reason: 'Option missing description' });
        }
      }
    }
  }
}

if (invalidOptions.length === 0) {
  console.log('✅ Toutes les options de toutes les commandes sont valides.');
} else {
  console.log('⚠️ Options invalides détectées :');
  invalidOptions.forEach(opt => {
    console.log(`${opt.file} → ${opt.reason} (option: ${opt.option.name || 'undefined'})`);
  });
}

