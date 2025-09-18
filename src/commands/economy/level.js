const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  Partials,
  SlashCommandBuilder,
} = require("discord.js");
const calculateLevelXp = require("../../utils/calculateLevelXp");
const Level = require("../../models/Level");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("Shows your/someone's level.")
    .addMentionableOption((option) =>
      option
        .setName("target-user")
        .setDescription("The user whose level you want to see.")
        .setRequired(false),
    ),
  async execute(interaction) {
    if (!interaction.inGuild()) {
      interaction.reply("You can only run this command inside a server.");
      return;
    }

    await interaction.deferReply();

    const mentionedUserId = interaction.options.get("target-user")?.value;
    const targetUserId = mentionedUserId || interaction.member.id;
    const targetUserObj = await interaction.guild.members.fetch(targetUserId);

    const fetchedLevel = await Level.findOne({
      userId: targetUserId,
      guildId: interaction.guild.id,
    });

    if (!fetchedLevel) {
      interaction.editReply(
        mentionedUserId
          ? `${targetUserObj.user.tag} doesn't have any levels yet. Try again when they chat a little more.`
          : "You don't have any levels yet. Chat a little more and try again.",
      );
      return;
    }

    let allLevels = await Level.find({
      guildId: interaction.guild.id,
    }).select("-_id userId level xp");

    allLevels.sort((a, b) => {
      if (a.level === b.level) {
        return b.xp - a.xp;
      } else {
        return b.level - a.level;
      }
    });

    let currentRank =
      allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;
    const { RankCardBuilder, Font } = require("canvacord");

    Font.loadDefault();
    const rank = new RankCardBuilder()
      .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256 }))
      .setRank(currentRank)
      .setLevel(fetchedLevel.level)
      .setCurrentXP(fetchedLevel.xp)
      .setRequiredXP(calculateLevelXp(fetchedLevel.level))
      .setStyles({
        progressbar: {
          thumb: {
            style: {
              backgroundColor: "#FFC300",
            },
          },
        },
      })
      .setUsername(targetUserObj.user.username)
      .setDisplayName(targetUserObj.user.displayName);

    const data = await rank.build();
    const attachment = new AttachmentBuilder(data);
    interaction.editReply({ files: [attachment] });
  },
};
