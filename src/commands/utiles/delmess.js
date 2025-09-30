const { SlashCommandBuilder,PermissionFlagsBits,EmbedBuilder } = require("discord.js");

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
    ).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    try {
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Suppression de messages")
        .setDescription(`Suppression de ${amount} message(s)...`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

      // Supprimer les messages
      const deletedMessages = await interaction.channel.bulkDelete(amount, true);
      await interaction.editReply({
        content: `✅ | ${deletedMessages.size} message(s) supprimé(s).`,
        embeds: [],
        ephemeral: true,
      });
    } catch (error) {
      logger.error(`Erreur lors de la suppression des messages: ${error}`);
      await interaction.reply({
        content: "❌ | Une erreur est survenue lors de la suppression des messages.",
        ephemeral: true,
      });
    }
  },
};
