const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Client,
  TimestampStyles,
} = require("discord.js");
const test = require("../../commands/*");
const { create } = require("../../models/User");
const { name, description } = require("../economy/balance");
module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   *
   *
   */
  name: "help",
  description: "Pour savoir comment utiliser les différentes commande",
  options: [
    {
      name: "nom",
      description: "nom de la commande",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  callback: async (client, interaction) => {
    const embed = new EmbedBuilder()
      .setTitle(`${cmd.name}`)
      .setDescription(`${cmd.description}`)
      .setColor("Blurple");
    interaction.editReply({ embeds: [embed] });
  },
};
