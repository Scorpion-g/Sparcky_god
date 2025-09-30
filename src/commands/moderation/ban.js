const {
  PermissionFlagsBits,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");

const GuildConfiguration = require("../../models/GuildConfiguration");
module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   *
   */
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Pour bannir un membre du serveur")
    .addMentionableOption((option) =>
      option
        .setName("membre")
        .setDescription("Bannir un membre")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("raison")
        .setDescription("La raison du bannissement du membre")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const membreId = interaction.options.get("membre").value;
    const raison =
      interaction.options.get("raison")?.value || "Pas de raison donné";

    await interaction.deferReply();

    const member = await interaction.guild.members.fetch(membreId);

    if (!member) {
      await interaction.editReply(
        "Le membre mentionné n'est pas sur le serveur",
      );
      return;
    }

    if (member.id === interaction.guild.ownerId) {
      await interaction.editReply(
        "Tu ne peux pas bannir le créateur du serveur",
      );
      return;
    }

    const memberRolePosition = member.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = interaction.guild.members.me.roles.highest.position;

    if (memberRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "Vous ne pouvez pas bannir ce membre car il a un rôle superieur ou égale  à vous",
      );
      return;
    }
    if (memberRolePosition >= botRolePosition) {
      await interaction.editReply(
        "je ne peux pas bannir ce membre car il a un rôle superieur ou égale a vous",
      );
      return;
    }
    try {
      await member.ban({ raison });
      await interaction.editReply(
        `Le membre ${member} a été banni \nRaison: ${raison}`,
      );
      await member
        .send(
          `Tu as été banni du serveur ${interaction.guild.name} par ${interaction.user.tag} \nRaison: ${raison}`,
        )
        .catch(() => {});
      // Log the ban action in the mod-log channel if it exists
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
              .setTitle("📋 Log ban")
              .setDescription(`${member} a été banni par ${interaction.user}`)
              .addFields({ name: "Raison", value: raison })
              .setTimestamp(),
          ],
        });
      }
    } catch (error) {
      logger.error(`Il y a une erreur lors du bannissement: ${error}`);
    }
  },
};
