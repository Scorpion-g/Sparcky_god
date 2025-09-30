const {
  PermissionFlagsBits,
  EmbedBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const GuildConfiguration = require("../../models/GuildConfiguration");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Débannir un membre du serveur")
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("L'ID du membre à débannir")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("raison")
        .setDescription("La raison du débannissement")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  /**
   *
   * @param {Client} client
   * @param {import("discord.js").CommandInteraction} interaction
   */
  async execute(interaction) {
    const raison =
      interaction.options.get("raison")?.value || "Pas de raison donnée";
    const memberId = interaction.options.get("id").value;

    await interaction.deferReply();

    try {
      // Vérifie si le membre est vraiment banni
      const bans = await interaction.guild.bans.fetch();
      const banInfo = bans.get(memberId);

      if (!banInfo) {
        return interaction.editReply(
          `❌ Aucun membre avec l'ID **${memberId}** n'est banni.`,
        );
      }

      // Déban
      await interaction.guild.members.unban(memberId, raison);

      // Confirmation dans le channel
      const embed = new EmbedBuilder()
        .setColor("#00ff99")
        .setTitle("✅ Unban")
        .setDescription(`Le membre **${banInfo.user.tag}** a été débanni.`)
        .addFields(
          { name: "ID", value: memberId, inline: true },
          { name: "Raison", value: raison, inline: true },
          { name: "Modérateur", value: interaction.user.tag, inline: true },
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Essaye d’envoyer un DM
      await banInfo.user
        .send({
          embeds: [
            new EmbedBuilder()
              .setColor("#00ff99")
              .setTitle(`✅ Vous avez été débanni`)
              .setDescription(
                `Vous avez été débanni du serveur **${interaction.guild.name}**`,
              )
              .addFields({ name: "Raison", value: raison })
              .setTimestamp(),
          ],
        })
        .catch(() => {});

      // Log modération
      const guildConfig = await GuildConfiguration.findOne({
        guildId: interaction.guild.id,
      });
      const logChannel = interaction.guild.channels.cache.get(
        guildConfig?.modLogChannel,
      );

      if (logChannel) {
        logChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#00ff99")
              .setTitle("📋 Log Unban")
              .setDescription(
                `Le membre **${banInfo.user.tag}** a été débanni.`,
              )
              .addFields(
                { name: "ID", value: memberId, inline: true },
                { name: "Raison", value: raison, inline: true },
                {
                  name: "Modérateur",
                  value: interaction.user.tag,
                  inline: true,
                },
              )
              .setTimestamp(),
          ],
        });
      }
    } catch (error) {
      logger.error(`Erreur lors du débannissement:`, error);
      await interaction.editReply(
        "❌ Une erreur est survenue lors du débannissement.",
      );
    }
  },
};
