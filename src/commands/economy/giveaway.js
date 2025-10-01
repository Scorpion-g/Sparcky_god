const { SlashCommandBuilder,EmbedBuilder,PermissionFlagsBits } = require("discord.js");
const Giveaway = require("../../models/Giveaway");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Gérer les giveaways")
    .addSubcommand((sub) =>
      sub
        .setName("start")
        .setDescription("Démarrer un giveaway")
        .addStringOption((opt) =>
          opt.setName("prize").setDescription("Prix du giveaway").setRequired(true)
        )
        .addIntegerOption((opt) =>
          opt
            .setName("duration")
            .setDescription("Durée du giveaway en minutes")
            .setRequired(true)
        )
        .addIntegerOption((opt) =>
          opt
            .setName("winners")
            .setDescription("Nombre de gagnants")
            .setRequired(true)
        )
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("Canal pour le giveaway")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("end")
        .setDescription("Terminer un giveaway")
        .addStringOption((opt) =>
          opt
            .setName("giveaway_id")
            .setDescription("ID du giveaway à terminer")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("reroll")
        .setDescription("Relancer un giveaway")
        .addStringOption((opt) =>
          opt
            .setName("giveaway_id")
            .setDescription("ID du giveaway à relancer")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "start") {
      const prize = interaction.options.getString("prize");
      const duration = interaction.options.getInteger("duration");
      const winnersCount = interaction.options.getInteger("winners");
      const channel = interaction.options.getChannel("channel");

      if (channel.type !== 0) {
        return interaction.reply({
          content: "Veuillez sélectionner un canal textuel.",
          ephemeral: true,
        });
      }

      const endTime = Date.now() + duration * 60000;

      const giveaway = new Giveaway({
        guildId: interaction.guild.id,
        channelId: channel.id,
        prize: prize,
        endTime: endTime,
        winnersCount: winnersCount,
        participants: [],
        isEnded: false,
      });

      await giveaway.save();

      const embed = new EmbedBuilder()
        .setTitle("Nouveau Giveaway!")
        .setDescription(
          `Prix: **${prize}**\nDurée: **${duration} minutes**\nNombre de gagnants: **${winnersCount}**\nRéagissez avec 🎉 pour participer!`
        )
        .setFooter({ text: `Giveaway ID: ${giveaway._id}` })
        .setColor("#00ff00")
        .setTimestamp();

      const giveawayMessage = await channel.send({ embeds: [embed] });
      await giveawayMessage.react("🎉");

      giveaway.messageId = giveawayMessage.id;
      await giveaway.save();

      await interaction.reply({
        content: `Le giveaway a été démarré dans ${channel}.`,
        ephemeral: true,
      });
    } else if (subcommand === "end") {
      const giveawayId = interaction.options.getString("giveaway_id");
      const giveaway = await Giveaway.findOne({
        _id: giveawayId,
        guildId: interaction.guild.id,
      });

      if (!giveaway) {
        return interaction.reply({
          content: "Giveaway non trouvé.",
          ephemeral: true,
        });
      }

      if (giveaway.isEnded) {
        return interaction.reply({
          content: "Ce giveaway est déjà terminé.",
          ephemeral: true,
        });
      }

      giveaway.isEnded = true;
      await giveaway.save();

      const channel = interaction.guild.channels.cache.get(giveaway.channelId);
      if (!channel) {
        return interaction.reply({
          content: "Le canal du giveaway n'existe plus.",
          ephemeral: true,
        });
      }

      const giveawayMessage = await channel.messages.fetch(giveaway.messageId);
      if (!giveawayMessage) {
        return interaction.reply({
          content: "Le message du giveaway n'existe plus.",
          ephemeral: true,
        });
      }

      const participants = giveaway.participants;
      if (participants.length === 0) {
        const embed = new EmbedBuilder()
          .setTitle("Giveaway Terminé")
          .setDescription(
            `Le giveaway pour **${giveaway.prize}** est terminé.\nAucun participant n'a réagi.`
          )
          .setColor("#ff0000")
          .setTimestamp();
        await giveawayMessage.edit({ embeds: [embed] });
        return interaction.reply({
          content: "Le giveaway est terminé, mais il n'y a pas de participants.",
          ephemeral: true,
        });
      }

      const winners = [];
      while (winners.length < giveaway.winnersCount && participants.length > 0) {
        const randomIndex = Math.floor(Math.random() * participants.length);
        winners.push(participants.splice(randomIndex, 1)[0]);
      }

      const embed = new EmbedBuilder()
        .setTitle("Giveaway Terminé")
        .setDescription(
          `Le giveaway pour **${giveaway.prize}** est terminé!\nFélicitations à: ${winners
            .map((w) => `<@${w}>`)
            .join(", ")}`
        )
        .setColor("#00ff00")
        .setTimestamp();
      await giveawayMessage.edit({ embeds: [embed] });

      await interaction.reply({
        content: `Le giveaway est terminé. Gagnants: ${winners
          .map((w) => `<@${w}>`)
          .join(", ")}`,
        ephemeral: true,
      });
    } else if (subcommand === "reroll") {
      const giveawayId = interaction.options.getString("giveaway_id");
      const giveaway = await Giveaway.findOne({
        _id: giveawayId,
        guildId: interaction.guild.id,
      });

      if (!giveaway) {
        return interaction.reply({
          content: "Giveaway non trouvé.",
          ephemeral: true,
        });
      }

      if (!giveaway.isEnded) {
        return interaction.reply({
          content: "Ce giveaway n'est pas encore terminé.",
          ephemeral: true,
        });
      }

      const channel = interaction.guild.channels.cache.get(giveaway.channelId);
      if (!channel) {
        return interaction.reply({
          content: "Le canal du giveaway n'existe plus.",
          ephemeral: true,
        });
      }

      const giveawayMessage = await channel.messages.fetch(giveaway.messageId);
      if (!giveawayMessage) {
        return interaction.reply({
          content: "Le message du giveaway n'existe plus.",
          ephemeral: true,
        });
      }

      const participants = giveaway.participants;
      if (participants.length === 0) {
        return interaction.reply({
          content: "Aucun participant pour relancer le giveaway.",
          ephemeral: true,
        });
      }

      const winners = [];
      while (winners.length < giveaway.winnersCount && participants.length > 0) {
        const randomIndex = Math.floor(Math.random() * participants.length);
        winners.push(participants.splice(randomIndex, 1)[0]);
      }

      const embed = new EmbedBuilder()
        .setTitle("Giveaway Relancé")
        .setDescription(
          `Le giveaway pour **${giveaway.prize}** a été relancé!\nNouveaux gagnants: ${winners
            .map((w) => `<@${w}>`)
            .join(", ")}`
        )
        .setColor("#00ff00")
        .setTimestamp();
      await giveawayMessage.edit({ embeds: [embed] });

      await interaction.reply({
        content: `Le giveaway a été relancé. Nouveaux gagnants: ${winners
          .map((w) => `<@${w}>`)
          .join(", ")}`,
        ephemeral: true,
      });
    }
  },
};  
