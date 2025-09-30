const { SlashCommandBuilder,EmbedBuilder,PermissionFlagsBits } = require("discord.js");
const GuildConfiguration = require("../../models/GuildConfiguration");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setlogchannel")
    .setDescription("Définir le channel de log")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Le channel où les logs seront envoyés")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    if (channel.type !== 0) {
      return interaction.reply({
        content: "Veuillez sélectionner un channel textuel.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      let guildConfig = await GuildConfiguration.findOne({
        guildId: interaction.guild.id,
      });

      if (!guildConfig) {
        guildConfig = new GuildConfiguration({
          guildId: interaction.guild.id,
          modLogChannel: channel.id,
        });
      } else {
        guildConfig.modLogChannel = channel.id;
      }

      await guildConfig.save();

      const embed = new EmbedBuilder()
        .setTitle("Configuration du channel de log")
        .setDescription(
          `Le channel de log a été défini sur ${channel}.`,
        )
        .setColor("#0099ff")
        .setTimestamp();

      await interaction.editReply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      logger.error(`Erreur lors de la configuration du channel de log: ${error}`);
      await interaction.editReply({
        content:
          "Une erreur est survenue lors de la configuration du channel de log.",
        ephemeral: true,
      });
    }
  },
};  

