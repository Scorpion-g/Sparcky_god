const {
  AttachmentBuilder,
  SlashCommandBuilder,
} = require("discord.js");

const calculateLevelXp = require("../../utils/calculateLevelXp");
const Level = require("../../models/Level");
const { RankCardBuilder, Font } = require("canvacord");

Font.loadDefault(); // Charger une seule fois

module.exports = {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("Affiche ton niveau ou celui d'un autre membre.")
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("Le membre dont tu veux voir le niveau")
        .setRequired(false),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply("❌ Cette commande ne peut être utilisée que dans un serveur.");
    }

    await interaction.deferReply();

    // Récupération de l'utilisateur
    const targetUser = interaction.options.getUser("target-user") || interaction.user;
    const targetMember = await interaction.guild.members.fetch(targetUser.id);

    // Récupération du niveau
    const fetchedLevel = await Level.findOne({
      userId: targetUser.id,
      guildId: interaction.guild.id,
    });

    if (!fetchedLevel) {
      return interaction.editReply(
        targetUser.id !== interaction.user.id
          ? `${targetUser.tag} n'a pas encore de niveau.`
          : "Tu n'as pas encore de niveau. Envoie quelques messages et réessaie !",
      );
    }

    // Classement
    let allLevels = await Level.find({ guildId: interaction.guild.id }).select("-_id userId level xp");

    allLevels.sort((a, b) => (a.level === b.level ? b.xp - a.xp : b.level - a.level));
    let currentRank = allLevels.findIndex((lvl) => lvl.userId === targetUser.id) + 1;

    // Génération de la RankCard
    const rank = new RankCardBuilder()
      .setAvatar(targetUser.displayAvatarURL({ size: 256 }))
      .setRank(currentRank)
      .setLevel(fetchedLevel.level)
      .setCurrentXP(fetchedLevel.xp)
      .setRequiredXP(calculateLevelXp(fetchedLevel.level))
      .setStyles({
        progressbar: {
          thumb: { style: { backgroundColor: "#FFC300" } },
        },
      })
      .setUsername(targetUser.username)
      .setDisplayName(targetMember.displayName);

    const data = await rank.build();
    const attachment = new AttachmentBuilder(data, { name: "rank.png" });

    return interaction.editReply({ files: [attachment] });
  },
};

