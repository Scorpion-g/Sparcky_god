const {ApplicationCommandOptionType, Client, Interaction} = require('discord.js');
const User = require('../../models/User');
module.exports = {
    name: 'money',
    description: "Voir votre argent ou celui d'un membre.",
    options: [
        {
            name: 'user',
            description : "Le membre dont vous voulez voir l'argent.",
            type : ApplicationCommandOptionType.User,
        }
    ],
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback : async(client , interaction) =>{
        if(!interaction.inGuild()){
            interaction.reply({ content:"Vous ne pouvez éxecuter cette commande en dehors d'un serveur", ephemeral : true
            });
            return;
        }

        const targetUserId = interaction.options.get('user')?.value || interaction.member.id;

        await interaction.deferReply();

        const user = await User.findOne({
            userId: targetUserId,
            guildId: interaction.guild.id
        });

        if(!user){
            interaction.editReply(`<@${targetUserId}> n'as pas encore d'argent.`);
            return;
        }

        interaction.editReply(
            targetUserId === interaction.member.id
            ? `Tu as **${user.balance} $**.`
            :`<@${targetUserId}> a **${user.balance} $**.`
        )
    }

}