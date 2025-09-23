const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfiguration = require('../../models/GuildConfiguration');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('badwords')
    .setDescription('Gérer la liste des mots interdits (serveur)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild) // Limite aux membres pouvant gérer le serveur
    .addSubcommand(sc =>
      sc
        .setName('add')
        .setDescription('Ajouter un mot à la liste')
        .addStringOption(o =>
          o
            .setName('word')
            .setDescription('Le mot à ajouter à la liste')
            .setRequired(true)
        )
    )
    .addSubcommand(sc =>
      sc
        .setName('remove')
        .setDescription('Supprimer un mot de la liste')
        .addStringOption(o =>
          o
            .setName('word')
            .setDescription('Le mot à supprimer de la liste')
            .setRequired(true)
        )
    )
    .addSubcommand(sc =>
      sc
        .setName('list')
        .setDescription('Afficher la liste des mots interdits')
    )
    .addSubcommand(sc =>
      sc
        .setName('clear')
        .setDescription('Supprimer tous les mots de la liste')
    ).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    await interaction.deferReply({ ephemeral: true });
    const guildId = interaction.guild.id;

    const cfg = await GuildConfiguration.findOneAndUpdate(
      { guildId },
      { $setOnInsert: { guildId } },
      { upsert: true, new: true }
    );

    if (sub === 'add') {
      const w = interaction.options.getString('word').trim().toLowerCase();
      if (!w) return interaction.editReply('Mot invalide.');
      if ((cfg.badWords || []).includes(w)) return interaction.editReply('Ce mot est déjà dans la liste.');
      cfg.badWords = [...(cfg.badWords || []), w];
      await cfg.save();
      return interaction.editReply(`✅ Mot ajouté : \`${w}\``);
    }

    if (sub === 'remove') {
      const w = interaction.options.getString('word').trim().toLowerCase();
      if (!cfg.badWords || !cfg.badWords.includes(w)) return interaction.editReply("Ce mot n'est pas dans la liste.");
      cfg.badWords = cfg.badWords.filter(x => x !== w);
      await cfg.save();
      return interaction.editReply(`✅ Mot supprimé : \`${w}\``);
    }

    if (sub === 'list') {
      const list = cfg.badWords || [];
      if (list.length === 0) return interaction.editReply('La liste est vide.');
      const chunk = list.join(', ');
      return interaction.editReply({ content: `Mots interdits (${list.length}):\n${chunk}`, ephemeral: true });
    }

    if (sub === 'clear') {
      cfg.badWords = [];
      await cfg.save();
      return interaction.editReply('✅ Liste nettoyée.');
    }

    return interaction.editReply('Sous-commande inconnue.');
  }
};

