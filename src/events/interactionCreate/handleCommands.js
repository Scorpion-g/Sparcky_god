const {devs, testServer}= require('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');


module.exports = async (client, interaction) => {
    if(!interaction.isChatInputCommand()) return;


    const localCommands = getLocalCommands();

    try {
        const commandObject = localCommands.find(
            (cmd) => cmd.name === interaction.commandName
    );

    if (!commandObject) return;

    if (commandObject.devOnly){
        if(!devs.includes(interaction.member.id)){
            interaction.reply({
                content: 'Seul les développeur peut exécuté cette commande.',
                ephemeral:true,
            })
            return;
        }
    }if (commandObject.testOnly){
        if(!(interaction.guild.id === testServer)){
            interaction.reply({
                content: 'Cette commande ne peut pas être éxécuté ici.',
                ephemeral:true,
            })
            return;
        }

    }

        if(commandObject.permissionsRequired?.length){
            for (const permission of commandObject.permissionsRequired){
                if(!interaction.member.permissions.has(permission)){
                    interaction.reply({
                        content:"Vous n'avez pas les permissions d'éxécuter cette commande",
                        ephemeral: true,
                    });
                    return;
                }
            }
        }
        if(commandObject.botPermissions?.length){
            for (const permission of commandObject.botPermissions){
                const bot = interaction.guild.members.me;
                if(!bot.permissions.has(permission)){
                    interaction.reply({
                        content: "Je n'ai pas les permissions d'executé cette commandes.",
                        ephemeral: true,
                    });
                    return;
                }
            }
        }
    
    
    await commandObject.callback(client, interaction)
    }
    


    
        
    catch (error) {
        console.log(`Il y a une erreur dans l'execution de cette commande: ${error} `);

    }
}
