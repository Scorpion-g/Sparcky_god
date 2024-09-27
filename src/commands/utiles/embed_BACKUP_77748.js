<<<<<<< HEAD
const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
=======
const { EmbedBuilder,ApplicationCommandOptionType } = require('discord.js');
>>>>>>> a694e1179a2ea8e947f8e1ee056b8d703ef2e760
module.exports = {
	name: 'embed',
	description: 'Créer un embed',
	options: [
		{
			name: 'titre',
			description: 'ajouter un titre',
<<<<<<< HEAD
			type: ApplicationCommandOptionType.String,
=======
            type: ApplicationCommandOptionType.String,
>>>>>>> a694e1179a2ea8e947f8e1ee056b8d703ef2e760
			required: true,
		},
		{
			name: 'description',
			description: 'ajouter une descritpion',
<<<<<<< HEAD
			type: ApplicationCommandOptionType.String,
=======
            type: ApplicationCommandOptionType.String,
>>>>>>> a694e1179a2ea8e947f8e1ee056b8d703ef2e760
			required: true,
		},
	],
	//devOnly: Boolean,
	//testOnly:Boolean,
	//options: Object[],

	callback: async (client, interaction) => {
<<<<<<< HEAD
		const title = interaction.options.get('titre').value;
		const description = interaction.options.get('description').value;
		const author = interaction.author.value
		try {
			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(title)
				.setDescription(description)
				.addFields(
					{ name: 'title', value: 'value', inline: false },
				)
			

			interaction.reply({ embeds: [embed] });
		} catch (error) {
			console.log(`Il y a une erreur: ${error}`);
		}
=======
        const title= interaction.options.get('titre').value;
        const description= interaction.options.get('description').value;
		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle(title)
			.setDescription(description)
			.addFields({ name: 'title', value: 'value', inline: false });

		await interaction.deferReply({ embeds: [embed] });
>>>>>>> a694e1179a2ea8e947f8e1ee056b8d703ef2e760
	},
};
