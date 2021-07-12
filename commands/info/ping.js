module.exports = {
    name: "ping",
    category: "info",
    description: "Returns latency and API ping",
    run: async (client, interaction) => {
        var createdAt;
        await interaction.reply('🏓 ***Pinging...***').then(() => {
            createdAt = Date.now();
        });
        await interaction.editReply(`🏓 **Pong!**\n**Latency**: ${Math.floor(createdAt - interaction.createdAt)}ms\n**API Latency**: ${Math.round(client.ws.ping)}ms`);
    }
}