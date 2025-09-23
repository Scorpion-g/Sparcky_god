module.exports = {
  name: "interactionCreate",
  async execute(client, interaction) {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith("role_react_")) {
      const roleId = interaction.customId.replace("role_react_", "");
      const role = interaction.guild.roles.cache.get(roleId);

      if (!role) {
        return interaction.reply({
          content: "❌ Ce rôle n'existe plus.",
          ephemeral: true,
        });
      }

      try {
        if (interaction.member.roles.cache.has(role.id)) {
          await interaction.member.roles.remove(role);
          await interaction.reply({
            content: `❌ Le rôle **${role.name}** t'a été retiré.`,
            ephemeral: true,
          });
        } else {
          await interaction.member.roles.add(role);
          await interaction.reply({
            content: `✅ Le rôle **${role.name}** t'a été attribué.`,
            ephemeral: true,
          });
        }
      } catch (error) {
        await interaction.reply({
          content:
            `❌ Impossible de modifier tes rôles. Vérifie mes permissions.`,
          ephemeral: true,
        });
        console.error("Erreur lors de l'ajout/retrait de rôle :", error);
      }
    }
  },
};
