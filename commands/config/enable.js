const { MessageEmbed } = require("discord.js");
const { commandArray } = require("../../handler/command.js");
var { enabled } = require("../../handler/command.js");
const { readdirSync } = require("fs");
const { hostGuild } = require("../../bot.js");

module.exports = {
    name: "enable",
    category: "config",
    description: "Enables a command you enter",
    usage: "<command>",
    options: [{
        type: "STRING",
        name: "command",
        description: "Enter the name of a command to enable.",
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

        if(!commandArray.some(cmd => cmd[0] == input + ".js")) {
            embed.setTitle(`The \`${input}\` command doesn't exist.`);
            return interaction.reply({ embeds: [embed] });
        }

        if(enabled[enabled.indexOf(input)]) {
            embed.setTitle(`The \`${input}\` command is already enabled.`);
            return interaction.reply({ embeds: [embed] });
        }

        readdirSync("./commands/").forEach(dir => {
            
            const commands = readdirSync(`./commands/${dir}/`).filter(f => f.endsWith(".js"));
    
            for (let file of commands) {
                let pull = require(`../${dir}/${file}`)

                if (pull.name == input) {
                    client.commands.set(pull.name, pull);
                    enabled.push(pull.name);
                    break;
                }
            }
        });
        embed.setTitle(`The \`${input}\` command has been enabled successfully!`);
        interaction.reply({ embeds: [embed] });
    }
}