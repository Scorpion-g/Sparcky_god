const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "messageCreate",
  async execute(client, message) {
    if (message.author.bot || !message.guild) return;

    // Vérifie si le bot est mentionné
    if (!message.mentions.has(client.user)) return;

    // Générer la liste des commandes
    const commandList = [...client.commands.values()].map(
      (cmd) => `- \`${cmd.data.name}\`: ${cmd.data.description}`,
    );
    let commandListString = commandList.join("\n");

    // Tronquer si trop long pour Discord
    if (commandListString.length > 1024) {
      commandListString = commandListString.substring(0, 1021) + "...";
    }

    // Construire l'embed
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`Bonjour, ${message.author.username} !`)
      .setDescription("Merci de m’avoir mentionné !")
      .addFields(
        {
          name: "Commandes Disponibles",
          value: commandListString || "Aucune commande disponible.",
        },
        {
          name: "Invite",
          value: `[Ajouter le bot à votre serveur](https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=bot%20applications.commands&permissions=8)`,
        },
        {
          name: "Support",
          value:
            "[Rejoignez notre serveur support](https://discord.gg/your-invite-link)",
        },
      )
      .setTimestamp()
      .setFooter({ text: "Bot développé par Scorpion" });

    // Vérifie les permissions du bot avant d’envoyer
    const botMember = await message.guild.members.fetch(client.user.id);
    if (
      !message.channel
        .permissionsFor(botMember)
        .has([
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.EmbedLinks,
        ])
    ) {
      console.warn(
        `Pas la permission d'envoyer des messages ou des embeds dans ${message.channel.name}`,
      );
      return;
    }

    // Envoi sécurisé de l'embed
    try {
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Erreur lors de l’envoi de l’embed:", error);
    }
  },
};
