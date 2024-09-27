const {ApplicationCommandOptionType, PermissionFlagsBits, Client} = require('discord.js')

module.exports = {
    /**
     * 
     * @param {Client} client
     * @param {Interaction} interaction
     *
     */
    name: 'unban',
    description: 'Pour debannir un membre du serveur',
    delete: true,
    //devOnly: Boolean,
    //testOnly:Boolean,
    options: [
        {
            name : 'membre',
            description: 'Débannir un membre',
            required: true,
            type: ApplicationCommandOptionType.User,
        },
        {
            name : 'raison',
            description: 'La raison du débannissement du membre',
            required: false,
            type: ApplicationCommandOptionType.String,
        },
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.Administrator],

    callback: async (client, interaction) =>{
        const membreId = interaction.options.get('membre').id.value;
        const raison = interaction.options.get('raison')?.value || "Pas de raison donné";

        await interaction.deferReply();

        const member = await interaction.guild.members.fetch(membreId);

        if(!member){
            await interaction.editReply("Le membre mentionné n'est pas sur le serveur");
            return;
        }
        try {
            await member.unban(membreId);
            await interaction.editReply(
                `Le membre ${member} a été banni \nRaison: ${raison}`             
            )
        } catch (error) {
            console.log(`Il y a une erreur lors du bannissement: ${error}`)
        }
    }
}