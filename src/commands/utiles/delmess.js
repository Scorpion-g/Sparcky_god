const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delmess")
    .setDescription("Supprimer des messages")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Nombre de messages à supprimer (1-100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100),
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    try {
      const deletedMessages = await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({
        content: `✅ | J'ai supprimé ${deletedMessages.size} message(s).`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(`Erreur lors de la suppression des messages: ${error}`);
      await interaction.reply({
        content: "❌ | Une erreur est survenue lors de la suppression des messages.",
        ephemeral: true,
      });
    }
  },
};
