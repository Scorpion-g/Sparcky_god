const {
	ApplicationCommandOptionType,
	PermissionFlagsBits,
	Client,
	EmbedBuilder,
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
	name: 'unwarn',
	description: 'Pourenlver un warn à un membre du serveur',
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
			name: 'nombre',
			description: 'nombre de warn à enlever',
			required: true,
			type: ApplicationCommandOptionType.Integer,
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
		const nbUnwarn = interaction.options.get('nombre').value;
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
			userId: member.id,
			guildId: interaction.guild.id,
		};
		try {
			const warn = await Warn.findOne(query);
			if (warn) {
				warn.raison.push(raison);
				if (warn.warn <= 0 || warn.warn == null) {
					await interaction.editReply(
						`${member} n'as plus de warn à son actif!`
					);
				} else if (warn.warn < nbUnwarn) {
					await interaction.editReply(
						`Comme ${nbUnwarn}>${warn.warn} les warns de ${member} ont été mis à 0!`
					);
					warn.warn = 0;
				} else {
					warn.warn += nbWarn - nbUnwarn;
					warn.unwarn += nbUnwarn;
					warn.raison.push("unwarn: "+raison);
					const embed = new EmbedBuilder()
						.setColor('#0099ff')
						.setTitle('Unwarn')
						.setDescription(
							`Le membre ${member} a été unwarn `
						)
						.addFields({
							name: 'Raison',
							value: `${raison}`,
							inline: false,
						},
						{
							name:`Nombre d'unwarn`,
							value:`${nbUnwarn}`
						}
					)
					
					interaction.editReply({ embeds: [embed] });
				}
				await warn.save().catch(e => {
					console.log(`erreur sauvegarde mise à jour level ${e}`);
					return;
				});
				cooldowns.add(member.id);
				setTimeout(() => {
					cooldowns.delete(member.id);
				}, 60000);
			} else {
				await interaction.editReply(
					`Le membre ${member} n'as jamais été warn vous ne pouvez donc pas l'unwarn.`
				);
			}
		} catch (error) {
			console.log(`Erreur dans le warn : ${error}`);
		}
	},
};
