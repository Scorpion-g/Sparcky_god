const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  welcomeChannel: { type: String, default: null },
  leaveChannel: { type: String, default: null },
});

module.exports = mongoose.model('GuildConfiguration', guildConfigSchema);

