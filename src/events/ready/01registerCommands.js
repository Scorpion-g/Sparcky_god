const { testServer } = require('../../../config.json');
const areCommandsDifferent = require('../../utils/areCommandsDifferent');
const getApplicationCommands = require('../../utils/getApplicationCommands');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async client => {
	try {
		const localCommands = getLocalCommands();
		const applicationCommands = await getApplicationCommands(
			client,
			testServer
		);

		for (const localCommand of localCommands) {
			const { name, description, options } = localCommand;

			const existingCommand = await applicationCommands.cache.find(
				cmd => cmd.name === name
			);

			if (existingCommand) {
				if (localCommand.deleted) {
					await applicationCommands.deleted(existingCommand.id);
					console.log(`La commande ${name} a été suprimé.`);
					continue;
				}

				if (areCommandsDifferent(existingCommand, localCommand)) {
					await applicationCommands.edit(existingCommand.id, {
						description,
						options,
					});
					console.log(`Modification de la commande "${name}".`);
				}
			} else {
				if (localCommand.deleted) {
					console.log(
						`Passage de l'enregistrement de la commande "${name}" comme elle a été suprimé.`
					);
					continue;
				}

				await applicationCommands.create({
					name,
					description,
					options,
				});

				console.log(`enregistrement de "${name}" 👌.`);
			}
		}
	} catch (error) {
		console.log(`Il y a une erreur ${error}`);
	}
};
