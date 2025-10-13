const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { v4: uuidv4 } = require("uuid");
const ShopItem = require("../../models/Shop");
const User = require("../../models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Afficher le magasin")
    .addSubcommand((sub) =>
      sub
        .setName("info")
        .setDescription("Afficher les informations du magasin"),
    )
    .addSubcommand((sub) =>
      sub
        .setName("buy")
        .setDescription("Acheter un article du magasin")
        .addStringOption(
          (option) =>
            option
              .setName("item")
              .setDescription("L'article à acheter")
              .setRequired(true)
              .setAutocomplete(true), // 🔹 Autocomplete activé
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Ajouter un article au magasin")
        .addStringOption((opt) =>
          opt
            .setName("item")
            .setDescription("Nom de l'article")
            .setRequired(true),
        )
        .addIntegerOption((opt) =>
          opt
            .setName("price")
            .setDescription("Prix de l'article")
            .setRequired(true),
        )
        .addStringOption((opt) =>
          opt
            .setName("description")
            .setDescription("Description de l'article")
            .setRequired(true),
        )
        .addStringOption((opt) =>
          opt
            .setName("type")
            .setDescription("Type d'article")
            .setRequired(true)
            .addChoices(
              { name: "Rôle", value: "role" },
              { name: "Objet", value: "item" },
              { name: "Autre", value: "other" },
            ),
        )
        .addIntegerOption((opt) =>
          opt
            .setName("stock")
            .setDescription("Stock (-1 pour illimité)")
            .setRequired(false),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Supprimer un article du magasin")
        .addStringOption(
          (opt) =>
            opt
              .setName("item")
              .setDescription("Nom de l'article")
              .setRequired(true)
              .setAutocomplete(true), // 🔹 Autocomplete activé
        ),
    ),
  // --- Autocompletion ---
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    const guildId = interaction.guild.id;

    const items = await ShopItem.find({ guildId });
    const filtered = items
      .filter((i) => i.name.toLowerCase().includes(focused.toLowerCase()))
      .slice(0, 25)
      .map((i) => ({ name: i.name, value: i.name }));

    await interaction.respond(filtered);
  },

  // --- Exécution des sous-commandes ---
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    await interaction.deferReply({ ephemeral: true });

    if (subcommand === "info") {
      const items = await ShopItem.find({ guildId });
      const embed = new EmbedBuilder()
        .setTitle("🛒 Magasin")
        .setDescription("Voici les articles disponibles dans le magasin.")
        .setColor("#0099ff")
        .setTimestamp();

      if (!items.length) {
        embed.addFields({
          name: "Aucun article disponible",
          value: "Le magasin est vide.",
        });
      } else {
        items.forEach((item) => {
          embed.addFields({
            name: `${item.name} - ${item.price} crédits (${item.type})`,
            value: `${item.description}\nStock: ${
              item.stock === -1 ? "Illimité" : item.stock
            }`,
          });
        });
      }

      return interaction.editReply({ embeds: [embed] });
    }

    if (subcommand === "buy") {
      const itemName = interaction.options.getString("item");
      const shopItem = await ShopItem.findOne({ guildId, name: itemName });

      if (!shopItem)
        return interaction.editReply({ content: "❌ Article inexistant." });
      if (shopItem.stock === 0)
        return interaction.editReply({ content: "❌ Article en rupture." });

      let user = await User.findOne({ guildId, userId });
      if (!user) user = new User({ guildId, userId, balance: 0, items: [] });

      if (user.balance < shopItem.price)
        return interaction.editReply({
          content: "❌ Solde insuffisant.",
        });

      user.balance -= shopItem.price;
      user.items.push(shopItem.name);
      if (shopItem.stock > 0) shopItem.stock -= 1;

      await user.save();
      await shopItem.save();

      // Si c'est un rôle, on l'ajoute
      if (shopItem.type === "role") {
        const role = interaction.guild.roles.cache.find(
          (r) => r.name === shopItem.name,
        );
        if (role) {
          const member = await interaction.guild.members.fetch(userId);
          await member.roles.add(role);
        }
      }

      return interaction.editReply({
        content: `✅ Vous avez acheté **${shopItem.name}** pour ${shopItem.price} crédits !`,
      });
    }

    if (subcommand === "add") {
      if (
        !interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
      ) {
        return interaction.editReply({
          content: "❌ Vous n'avez pas la permission d'ajouter des articles.",
        });
      }
      const name = interaction.options.getString("item");
      const price = interaction.options.getInteger("price");
      const description = interaction.options.getString("description");
      const stock = interaction.options.getInteger("stock") ?? -1;
      const type = interaction.options.getString("type");

      const newShopItem = new ShopItem({
        itemId: uuidv4(),
        guildId,
        name,
        price,
        description,
        stock,
        type,
      });

      await newShopItem.save();

      return interaction.editReply({
        content: `✅ Article **${name}** ajouté pour ${price} crédits. Stock: ${
          stock === -1 ? "Illimité" : stock
        }`,
      });
    }

    if (subcommand === "remove") {
      if (
        !interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
      ) {
        return interaction.editReply({
          content:
            "❌ Vous n'avez pas la permission de supprimer des articles.",
        });
      }
      const itemName = interaction.options.getString("item");
      const shopItem = await ShopItem.findOne({ guildId, name: itemName });

      if (!shopItem)
        return interaction.editReply({ content: "❌ Article inexistant." });

      await ShopItem.deleteOne({ guildId, name: itemName });

      return interaction.editReply({
        content: `✅ Article **${itemName}** supprimé.`,
      });
    }
  },
};
