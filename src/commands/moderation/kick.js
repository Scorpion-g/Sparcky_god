const {
	ApplicationCommandOptionType,
	PermissionFlagsBits,
	Client,
} = require('discord.js');

module.exports = {
	/**
	 *
	 * @param {Client} client
	 * @param {Interaction} interaction
	 *
	 */
	name: 'kick',
	description: 'Pour kick un membre du serveur',
	//devOnly: Boolean,
	//testOnly:Boolean,
	options: [
		{
			name: 'membre',
			description: 'Kick un membre',
			required: true,
			type: ApplicationCommandOptionType.Mentionable,
		},
		{
			name: 'raison',
			description: 'La raison du kick du membre',
			required: false,
			type: ApplicationCommandOptionType.String,
		},
	],
	permissionsRequired: [PermissionFlagsBits.KickMembers],
	botPermissions: [PermissionFlagsBits.KickMembers],

	callback: async (client, interaction) => {
		const membreId = interaction.options.get('membre').value;
		const raison =
			interaction.options.get('raison')?.value || 'Pas de raison donné';

		await interaction.deferReply();

		const member = await interaction.guild.members.fetch(membreId);

		if (!member) {
			await interaction.editReply(
				"Le membre mentionné n'est pas sur le serveur"
			);
			return;
		}

		if (member.id === interaction.guild.ownerId) {
			await interaction.editReply(
				'Tu ne peux pas kick le créateur du serveur'
			);
			return;
		}

		const memberRolePosition = member.roles.highest.position;
		const requestUserRolePosition =
			interaction.member.roles.highest.position;
		const botRolePosition =
			interaction.guild.members.me.roles.highest.position;

		if (memberRolePosition >= requestUserRolePosition) {
			await interaction.editReply(
				'Vous ne pouvez pas kick ce membre car il a un rôle superieur ou égale  à vous'
			);
			return;
		}
		if (memberRolePosition >= botRolePosition) {
			await interaction.editReply(
				'je ne peux pas kick ce membre car il a un rôle superieur ou égale a vous'
			);
			return;
		}
		try {
			await member.kick({ raison });
			await interaction.editReply(
				`Le membre ${member} a été kick \nRaison: ${raison}`
			);
		} catch (error) {
			console.log(`Il y a une erreur lors du kick: ${error}`);
		}
	},
};
