const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
module.exports = {
    /**
     *
     *
     * @param {Client} client
     * @param {Interaction} interaction
     *
     *
     */
    name: "embed",
    description: "Créer un embed",
    options: [
        {
            name: "titre",
            description: "ajouter un titre",
            required: true,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: "description",
            description: "ajouter une descritpion",
            required: true,
            type: ApplicationCommandOptionType.String,
        },
    ],
    //devOnly: Boolean,
    //testOnly:Boolean,
    //options: Object[],

    callback: async (client, interaction) => {
        const title = interaction.options.get("titre").value;
        const description = interaction.options.get("description").value;
        const author = interaction.author.value;
        try {
            const embed = new EmbedBuilder().setColor("#0099ff");

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.log(`Il y a une erreur dans embed: ${error}`);
        }
    },
};
