const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  Client,
  SlashCommandBuilder,
} = require("discord.js");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   *
   */
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Pour debannir un membre du serveur")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Débannir un membre")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("raison")
        .setDescription("La raison du débannissement du membre")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const membreId = interaction.options.get("membre").id.value;
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
    try {
      await member.unban(membreId);
      await interaction.editReply(
        `Le membre ${member} a été banni \nRaison: ${raison}`,
      );
    } catch (error) {
      console.log(`Il y a une erreur lors du bannissement: ${error}`);
    }
  },
};
