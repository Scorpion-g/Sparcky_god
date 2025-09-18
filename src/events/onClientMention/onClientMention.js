const {EmbedBuilder} = require('discord.js');

module.exports = {
  name: 'messageCreate',
  async execute(client, message) {
    const commandList  =[] 
    client.commands.forEach(command => {
      commandList.push(`- \`${command.data.name}\`: ${command.data.description}`);
    });
    
    const commandListString = commandList.join('\n');

      
    if (message.author.bot) return;

    if (message.mentions.has(client.user)) {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Bonjour !')
        .setDescription(`Merci de m'avoir mentionné, ${message.author.username} !`)
        .addFields(
          { name: 'Commandes Disponibles', value: commandListString || 'Aucune commande disponible.' },
          { name: 'Invite', value: `[Ajouter le bot à votre serveur](https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=bot%20applications.commands&permissions=8)` },
          { name: 'Support', value: '[Rejoignez notre serveur support](https://discord.gg/your-invite-link)' }
        )
        .setTimestamp()
        .setFooter({ text: 'Bot développé par Scorpion' });

      message.channel.send({ embeds: [embed] });
    }
  },
};  
