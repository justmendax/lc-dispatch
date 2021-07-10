const { MessageEmbed } = require("discord.js");
const { prefix } = require("../../bot.js");
const { hostGuild } = require("../../bot.js");

module.exports = {
    name: "help",
    category: "info",
    description: "Returns all commands, or one specific command info",
    usage: "[command | alias]",
    run: async (client, message, args) => {
        if (args[0]) {
            return getCMD(client, message, args[0]);
        }
        else {
            return getAll(client, message);
        }
    }
}

function getAll (client, message) {
    const embed = new MessageEmbed()
        .setColor(client.guilds.cache.get(hostGuild).me.displayHexColor)

    const commands = (category) => {
        return client.commands
            .filter(cmd => cmd.category === category)
            .map(cmd => `${prefix + cmd.name} - ${cmd.description}`)
            .join("\n");
    }

    const info = client.categories
        .map(cat => {
            if(message.author.id != "251758061981532162" && cat == "config")
                return "";
            else
                return `\n__**${cat[0].toUpperCase() + cat.slice(1)}**__ \n${commands(cat)}`;
        })
        .reduce((string, category) => string + "\n" + category);

    return message.channel.send(embed.setDescription(info));
}

function getCMD (client, message, input) {
    const embed = new MessageEmbed()

    const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase()));

    let info = `No information found for command **${input.toLowerCase()}**.`;

    if (!cmd) {
        return message.channel.send(embed.setColor("RED").setDescription(info).setFooter(client.user.username, client.user.avatarURL()).setTimestamp());
    }

    if (cmd.name) info = `**Command Name**: ${cmd.name}`;
    if (cmd.aliases) info += `\n**Aliases**: ${cmd.aliases.map(a => `\`${a}\``).join(", ")}`;
    if (cmd.description) info += `\n**Description**: ${cmd.description}`;
    if (cmd.usage)
        info += `\n**Usage**: ${cmd.usage} (Syntax: <> = required, [] = optional)`;

    return message.channel.send(embed.setColor("GREEN").setDescription(info).setFooter(client.user.username, client.user.avatarURL()).setTimestamp());
}