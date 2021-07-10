module.exports = {
    name: "ping",
    category: "info",
    description: "Returns latency and API ping",
    run: async (client, message, args) => {
        const msg = await message.channel.send('🏓 ***Pinging...***');
        msg.edit(`🏓 **Pong!**\n**Latency**: ${Math.floor(msg.createdAt - message.createdAt)}ms\n**API Latency**: ${Math.round(client.ws.ping)}ms`);
    }
}