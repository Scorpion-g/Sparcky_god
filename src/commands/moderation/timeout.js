const {
  PermissionFlagsBits,
  EmbedBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const ms = require("ms");
const GuildConfiguration = require("../../models/GuildConfiguration");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */

  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout un membre")
    .addMentionableOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre que vous voulez timeout.")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("durée")
        .setDescription("durée du timeout (30m, 1h, 1 jour).")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("raison")
        .setDescription("La raison du timeout")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),
  async execute(interaction) {
    const mentionable = interaction.options.get("membre").value;
    const durée = interaction.options.get("durée").value; // 1d, 1 day, 1s 5s, 5m
    const raison =
      interaction.options.get("raison")?.value || "Pas de raison donné";

    await interaction.deferReply();

    const membre = await interaction.guild.members.fetch(mentionable);
    if (!membre) {
      await interaction.editReply("Cet utilisateur n'est pas sur le serveur");
      return;
    }

    if (membre.user.bot) {
      await interaction.editReply("Je ne peux pas timeout un bot");
      return;
    }

    const msdurée = ms(durée);
    if (isNaN(msdurée)) {
      await interaction.editReply("Veuillez entré une durée valide");
      return;
    }

    if (msdurée < 5000 || msdurée > 2.419e9) {
      await interaction.editReply(
        "La durée du timeout ne peut pas être de moins de 5s et de plus de 28j",
      );
      return;
    }

    const membreRolePosition = membre.roles.highest.position; // Highest role of the target user
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

    if (membreRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "Vous ne pouvez pas timeout ce membre car il a un rôle plus haut ou le même que vous",
      );
      return;
    }

    if (membreRolePosition >= botRolePosition) {
      await interaction.editReply(
        "Vous ne pouvez pas me timeout car j'ai a un rôle plus haut ou le même que vous",
      );
      return;
    }

    // Timeout the user
    try {
      const { default: prettyMs } = await import("pretty-ms");

      if (membre.isCommunicationDisabled()) {
        await membre.timeout(msdurée, raison);
        await interaction.editReply(
          `Le timeout de ${membre} a été mis à jour  pour une durée de ${prettyMs(msdurée, { verbose: true })}\nRaison: ${raison}`,
        );
        return;
      }

      await membre.timeout(msdurée, raison);
      await interaction.editReply(
        `${membre} a été timeout pour une durée de ${prettyMs(msdurée, { verbose: true })}.\nRaison: ${raison}`,
      );
      await membre
        .send(
          `Tu as été timeout sur le serveur ${interaction.guild.name} par ${interaction.user.tag} pour une durée de ${prettyMs(msdurée, { verbose: true })}\nRaison: ${raison}`,
        )
        .catch(() => {});
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
              .setTitle("📋 Log timeout")
              .setDescription(`${membre} a été timeout par ${interaction.user}`)
              .addFields(
                { name: "Raison", value: raison },
                {
                  name: "Durée",
                  value: `${prettyMs(msdurée, { verbose: true })}`,
                },
              )
              .setTimestamp(),
          ],
        });
      }
    } catch (error) {
      logger.error(`Il y a eu une erreur dans le timeout d'un membre ${error}`);
    }
  },
};
