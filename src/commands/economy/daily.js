const {Client, Interaction,} = require('discord.js')
const User = require('../../models/User')

const dailyAmount = 500;


module.exports = {
    name : 'daily',
    description: "Récupère ta récomprense du jour",
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback : async(client,interaction) =>{
        if(!interaction.inGuild()){
            interaction.reply({ content:"Vous ne pouvez éxecuter cette commande en dehors d'un serveur", ephemeral : true
            });
            return;
        }
    

        try {
            await interaction.deferReply();

            const query = {
                userId: interaction.member.id,
                guildId: interaction.guild.id,
            }

            let user = await User.findOne(query);

            if(user){
                const lastDailyDate = user.lastDaily.toDateString();
                const currentDate = new Date().toDateString();

                if (lastDailyDate === currentDate){
                    interaction.editReply(
                        "Vous avez déjà récupéré vos récompense journalière. Revenez demain !"
                    );
                    return;
                }

                user.lastDaily = new Date();
                } else{
                user = new User({
                    ...query,
                    lastDaily: new Date(),
                });
            
            }

            user.balance += dailyAmount;
            await user.save();

            interaction.editReply(`**${dailyAmount} $** ont été ajouté à votre compte. Votre compte s'élève donc à **${user.balance} $**`);
        }
        catch (error) {
            console.log(`Il y a une erreur avec /daily : ${error}`)
        }
    }
}