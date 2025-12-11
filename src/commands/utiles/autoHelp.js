const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const logger = require("../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Affiche la liste des commandes"),

  async execute(interaction) {
    try {
      const commands = interaction.client.commands;

      // Grouper les commandes par catégorie
      const categories = {};
      commands.forEach((command) => {
        const category = command.category || "Autres";
        if (!categories[category]) categories[category] = [];
        categories[category].push(command);
      });
      //Si commande permission, symboliser avec un cadenas
      for (const category in categories) {
        categories[category] = categories[category].map((cmd) => {
          if (cmd.data.permissions) {
            cmd.data.name = `🔒 ${cmd.data.name}`;
          }
          return cmd;
        });
      }

      // Trier chaque catégorie et ses commandes
      for (const category in categories) {
        categories[category].sort((a, b) =>
          a.data.name.localeCompare(b.data.name),
        );
      }

      // Construire les champs de l'embed
      const fields = [];
      for (const category in categories) {
        const cmds = categories[category]
          .map((cmd) => `\`/${cmd.data.name}\` → ${cmd.data.description}`)
          .join("\n");

        fields.push({
          name: `📂 ${category}`,
          value: cmds,
          inline: false,
        });
      }

      const helpEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("📖 Liste des commandes")
        .setDescription(
          "Voici toutes les commandes disponibles, triées par catégorie :",
        )
        .addFields(fields)
        .addFields(
          {
            name: "🔗 Support",
            value:
              "[Rejoindre le serveur support](https://discord.gg/your-invite-link)",
            inline: true,
          },
          {
            name: "➕ Invite",
            value: `[Ajouter le bot à votre serveur](https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=bot%20applications.commands&permissions=8)`,
            inline: true,
          },
        )
        .setTimestamp();

      await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    } catch (error) {
      logger.error(`Erreur lors de l'exécution de la commande help: ${error}`);
      await interaction.reply({
        content:
          "❌ | Une erreur est survenue lors de l'exécution de la commande help.",
        ephemeral: true,
      });
    }
  },
};
