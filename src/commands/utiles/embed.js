const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
module.exports = {
    /**
     *
     *
     * @param {Client} client
     * @param {Interaction} interaction
     * 
     *
     */ 
	name: 'embed',
	description: 'Créer un embed',
	options: [
		{
			name: 'titre',
			description: 'ajouter un titre',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'description',
			description: 'ajouter une descritpion',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
	//devOnly: Boolean,
	//testOnly:Boolean,
	//options: Object[],

	callback: async (client, interaction) => {
		const title = interaction.options.get('titre').value;
		
		const description = interaction.options.get('description').value;
		const author = interaction.author.value
		try {
			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(`${title}`)
				.setDescription(`${description}`)
			

			interaction.reply({ embeds: [embed] });
		} catch (error) {
			console.log(`Il y a une erreur: ${error}`);
		}
	},
};
