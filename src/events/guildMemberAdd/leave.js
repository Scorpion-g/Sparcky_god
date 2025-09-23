const { EmbedBuilder } = require('discord.js');
const GuildConfiguration = require('../../models/GuildConfiguration');

module.exports = {
  name: 'guildMemberRemove',
  async execute(client, member) {
    try {
      const guildConfig = await GuildConfiguration.findOne({ guildId: member.guild.id });
      if (!guildConfig || !guildConfig.leaveChannel) return;

      const channel = member.guild.channels.cache.get(guildConfig.leaveChannel);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle(`Aurevoir ${member.user.username}!`)
        .setDescription(`Nous sommes ravis de t'avoir acceuilli sur le serveur 🎉`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

      channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur event guildMemberAdd:', error);
    }
  },
};
;
