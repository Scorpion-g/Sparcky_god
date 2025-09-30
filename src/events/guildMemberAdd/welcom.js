const { EmbedBuilder } = require('discord.js');
const GuildConfiguration = require('../../models/GuildConfiguration');

module.exports = {
  name: 'guildMemberAdd',
  async execute(client, member) {
    try {
      const guildConfig = await GuildConfiguration.findOne({ guildId: member.guild.id });
      if (!guildConfig || !guildConfig.welcomeChannel) return;

      const channel = member.guild.channels.cache.get(guildConfig.welcomeChannel);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle(`Bienvenue ${member.user.username}!`)
        .setDescription(`Nous sommes ravis de te voir sur le serveur 🎉`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

      channel.send({ embeds: [embed] });
      if(guildConfig.autoRole) {
        const role = member.guild.roles.cache.get(guildConfig.autoRole);
        if(role) {
          await member.roles.add(role).catch(err => logger.error('Erreur lors de l\'attribution du rôle automatique:', err));
        }
      } 
    } catch (error) {
      logger.error('Erreur event guildMemberAdd:', error);
    }
  },
};
;
