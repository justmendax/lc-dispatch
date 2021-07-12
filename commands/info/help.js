const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "help",
    category: "info",
    description: "Returns all commands, or one specific command info",
    usage: "[command | alias]",
    options: [{
        type: "STRING",
        name: "command",
        description: "Enter the name or alias of a command if you need info about it.",
        required: false
    }],
    run: async (client, interaction) => {
        if (interaction.options.first()) {
            return getCMD(client, interaction);
        }
        else {
            return getAll(client, interaction);
        }
    }
}

function getAll (client, interaction) {
    const embed = new MessageEmbed()
        .setColor(3092790);

    const commands = (category) => {
        return client.commands
            .filter(cmd => cmd.category === category)
            .map(cmd => `${"/" + cmd.name} - ${cmd.description}`)
            .join("\n");
    }

    const info = client.categories
        .map(cat => {
            if(interaction.user.id != client.application.owner.id && cat == "config")
                return "";
            else
                return `\n__**${cat[0].toUpperCase() + cat.slice(1)}**__ \n${commands(cat)}`;
        })
        .reduce((string, category) => string + "\n" + category);

    embed.setDescription(info);
    return interaction.reply({ embeds: [embed] });
}

function getCMD (client, interaction) {
    const embed = new MessageEmbed();
    const input = interaction.options.first().value;

    const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase()));

    let info = `No information found for command **${input.toLowerCase()}**.`;

    if (!cmd) {
        embed.setColor("RED").setDescription(info).setFooter(client.user.username, client.user.avatarURL()).setTimestamp();
        return interaction.reply({ embeds: [embed] });
    }

    if (cmd.name) info = `**Command Name**: ${cmd.name}`;
    if (cmd.aliases) info += `\n**Aliases**: ${cmd.aliases.map(a => `\`${a}\``).join(", ")}`;
    if (cmd.description) info += `\n**Description**: ${cmd.description}`;
    if (cmd.usage)
        info += `\n**Usage**: ${cmd.usage} (Syntax: <> = required, [] = optional)`;

    embed.setColor("GREEN").setDescription(info).setFooter(client.user.username, client.user.avatarURL()).setTimestamp();
    return interaction.reply({ embeds: [embed] });
}