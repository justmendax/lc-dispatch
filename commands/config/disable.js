const { MessageEmbed } = require("discord.js");
var { enabled } = require("../../handler/command.js");
const { hostGuild } = require("../../bot.js");

module.exports = {
    name: "disable",
    category: "config",
    description: "Disables a command you enter",
    usage: "<command>",
    run: async (client, message, args) => {
        if (message.author.id !== '251758061981532162')
            return message.channel.send(`Only **${message.guild.members.cache.get("251758061981532162").user.tag}** can use this command!`)

        if (!args[0])
            return message.channel.send("Give me a command to disable you fucking retard.")

        if(client.commands.some(cmd => cmd.name === args[0] && cmd.category === "config"))
            return message.channel.send("You tried. :boar:")

        if(!client.commands.some(cmd => cmd.name === args[0]))
            return message.channel.send("That command doesn't exist, moron.")

        if(!enabled[enabled.indexOf(args[0])])
            return message.channel.send("That command is already disabled, idiot.")

        client.commands.delete(args[0]);
        enabled.splice(enabled.indexOf(args[0]), 1);

        const embed = new MessageEmbed()
            .setColor(client.guilds.cache.get(hostGuild).me.displayHexColor)
            .setTimestamp()
            .setAuthor(message.author.tag, message.author.avatarURL())
            .setFooter(client.user.username, client.user.avatarURL())
            .setTitle(`The \`${args[0]}\` command has been disabled successfully! :boar:`);
        message.channel.send(embed);
    }
}