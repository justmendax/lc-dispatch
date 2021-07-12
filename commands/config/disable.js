const { MessageEmbed } = require("discord.js");
var { enabled } = require("../../handler/command.js");
const { hostGuild } = require("../../bot.js");

module.exports = {
    name: "disable",
    category: "config",
    description: "Disables a command you enter",
    usage: "<command>",
    options: [{
        type: "STRING",
        name: "command",
        description: "Enter the name of a command to disable.",
        required: true
    }],
    defaultPermission: false,
    permissions: [{
        id: '251758061981532162',
        type: 'USER',
        permission: true
    }],
    guildId: [hostGuild],
    run: async (client, interaction) => {
        const input = interaction.options.first().value;
        const embed = new MessageEmbed()
            .setColor(3092790)
            .setTimestamp()
            .setAuthor(interaction.user.tag, interaction.user.avatarURL())
            .setFooter(client.user.username, client.user.avatarURL())

        if(client.commands.some(cmd => cmd.name == input && cmd.category == "config")) {
            embed.setTitle("You tried.");
            return interaction.reply({ embeds: [embed] });
        }

        if(!client.commands.some(cmd => cmd.name == input)) {
            embed.setTitle(`The \`${input}\` command doesn't exist.`);
            return interaction.reply({ embeds: [embed] });
        }

        if(!enabled[enabled.indexOf(input)]) {
            embed.setTitle(`The \`${input}\` command is already disabled.`);
            return interaction.reply({ embeds: [embed] });
        }

        client.commands.delete(input);
        enabled.splice(enabled.indexOf(input), 1);
        embed.setTitle(`The \`${input}\` command has been disabled successfully!`);
        interaction.reply({ embeds: [embed] });
    }
}