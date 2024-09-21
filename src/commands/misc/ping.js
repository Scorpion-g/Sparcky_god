module.exports = {
    name: 'ping',
    description: 'Retourne votre ping',
    //devOnly: Boolean,
    //testOnly:Boolean,
    //options: Object[],
    //dleted: true,


    callback: async (client, interaction) =>{
        await interaction.deferReply();

        const reply = await interaction.fetchReply();

        const ping = reply.createdTimestamp - interaction.createdTimestamp;

        interaction.editReply(
            `Pong! Client ${ping}ms | Websocket: ${client.ws.ping}ms`
        );

    },
};