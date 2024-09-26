const {
	ApplicationCommandOptionType,
	PermissionFlagsBits,
	Client,
} = require('discord.js');
const Warn = require('../../models/Warn');
const cooldowns = new Set();
const nbWarn = 0;
module.exports = {
	/**
	 *
	 * @param {Client} client
	 * @param {Interaction} interaction
	 *
	 *
	 */
	name: 'warn',
	description: 'Pour warn un membre du serveur',
	//devOnly: Boolean,
	//testOnly:Boolean,
	options: [
		{
			name: 'membre',
			description: 'avertir un membre',
			required: true,
			type: ApplicationCommandOptionType.Mentionable,
		},
		{
			name: 'raison',
			description: 'La raison de l avertissement du membre',
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
				'Tu ne peux pas warn le créateur du serveur'
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
				'Vous ne pouvez pas warn ce membre car il a un rôle superieur ou égale  à vous'
			);
			return;
		}
		if (memberRolePosition >= botRolePosition) {
			await interaction.editReply(
				'je ne peux pas warn ce membre car il a un rôle superieur ou égale a vous'
			);
			return;
		}
		const query = {
			userId: interaction.member.id,
			guildId: interaction.guild.id,
		};
		try {
			const warn = await Warn.findOne(query);
			if (warn) {
				warn.warn += nbWarn + 1;
				await warn.save().catch(e => {
					console.log(`erreur sauvegarde mise à jour level ${e}`);
					return;
				});
				cooldowns.add(interaction.member.id);
				setTimeout(() => {
					cooldowns.delete(interaction.member.id);
				}, 60000);
				await interaction.editReply(
					`Le membre ${member} a été warn \nRaison: ${raison}`
				);
			} else {
				const newWarn = new Warn({
					userId: interaction.member.id,
					guildId: interaction.guild.id,
					warn: warn,
					raison: raison,
				});

				await newWarn.save();
				cooldowns.add(interaction.member.id);
				setTimeout(() => {
					cooldowns.delete(interaction.member.id);
				}, 60000);
				await interaction.editReply(
					`Le membre ${member} a été warn \nRaison: ${raison}`
				);
			}
		} catch (error) {
			console.log(`Erreur dans le warn : ${error}`);
		}
	},
};
