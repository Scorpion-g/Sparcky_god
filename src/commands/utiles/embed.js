const {
  EmbedBuilder,
  SlashCommandBuilder,
} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Créer un embed")
    .addStringOption((option) =>
      option
        .setName("titre")
        .setDescription("ajouter un titre")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("ajouter une descritpion")
        .setRequired(true),
    ),
  async execute(interaction) {
    const title = interaction.options.getString("titre");
    const description = interaction.options.getString("description");
    const author = interaction.user;
    try {
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setAuthor({
          name: author.username,
          iconURL: author.displayAvatarURL(),
        })
        .setTitle(`${title}`)
        .setDescription(`${description}`)
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(`Il y a une erreur dans embed: ${error}`);
    }
  },
};
