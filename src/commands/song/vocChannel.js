const { SlashCommandBuilder,EmbedBuilder,PermissionFlagsBits } = require("discord.js");
const GuildConfig = require("../../models/GuildConfiguration");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vocchannel")
    .setDescription("Le salon de vocal où créer son propre salon vocal.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Le salon vocal où les utilisateurs pourront créer leur propre salon.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const channel = interaction.options.getChannel("channel");

    if (channel.type !== 2) {
      return interaction.reply({
        content: "Veuillez sélectionner un salon vocal valide.",
        ephemeral: true,
      });
    }

    let guildConfig = await GuildConfig.findOne({ guildId });

    if (!guildConfig) {
      guildConfig = new GuildConfig({ guildId, vocChannelId: channel.id });
    } else {
      guildConfig.vocChannelId = channel.id;
    }

    await guildConfig.save();

    const embed = new EmbedBuilder()
      .setTitle("Salon de vocal configuré")
      .setDescription(
        `Le salon vocal pour créer des salons vocaux a été défini sur <#${channel.id}>.`
      )
      .setColor("Green")
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};  
