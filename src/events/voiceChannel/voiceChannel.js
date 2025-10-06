module.exports = {
  name: "voiceStateUpdate", async execute(client,oldState, newState) {
    // Vérifie si le salon de base est configuré
    const GuildConfig = await require("../../models/GuildConfiguration").findOne({ guildId: newState.guild.id });
    if (!GuildConfig || !GuildConfig.vocChannelId) return;

    // Vérifie si l'utilisateur a rejoint le salon de base

    if (oldState.channelId !== newState.channelId && newState.channelId === GuildConfig.vocChannelId) {

      const member = newState.member;
      console.log(`🎧 ${member.user.tag} a rejoint le salon de base !`);
      console.log(`${oldState.channelId} -> ${newState.channelId}`);

      try {
        // demander le nom du salon
        const nom = await new Promise((resolve) => {
          const filter = (m) => m.author.id === member.id;
          newState.guild.channels.cache.get(GuildConfig.vocChannelId).send(`${member}, quel nom veux-tu pour ton salon vocal ? (Réponds dans les 30 secondes)`).then(() => {
            newState.guild.channels.cache.get(GuildConfig.vocChannelId).awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
              .then(collected => {
                const response = collected.first().content;
                resolve(response);
              })
              .catch(() => {
                resolve(`${member.user.username} 🔊`); // Nom par défaut si pas de réponse
              });
          });
        });
        // Crée un nouveau salon vocal
        const newChannel = await newState.guild.channels.create({
          name: `${nom}`,
          type: 2,
          parent: newState.channel?.parent || null,
          permissionOverwrites: [
            {
              id: member.id,
              allow: [
                "Connect",
                "Speak",
                "MuteMembers",
                "DeafenMembers",
                "MoveMembers",
                "ManageChannels",
              ],
            },
            {
              id: newState.guild.roles.everyone,
              allow: ["Connect", "Speak"],
            },
          ],
        });

        if (member.voice.channelId) {
          await member.voice.setChannel(newChannel);
        }

        const checkEmpty = setInterval(async () => {
          if (newChannel.members.size === 0) {
            clearInterval(checkEmpty);
            await newChannel.delete().catch(() => { });
            console.log(`🗑️ Salon ${newChannel.name} supprimé (vide).`);
          }
        }, 10000);
      } catch (error) {
        console.error("Erreur lors de la création du salon vocal :", error);
      }
    }
  },
};
