const { MessageEmbed } = require("discord.js");
require("dotenv").config();

const lcdocGuild = process.env.LCDOC_GUILD;
const lcfdGuild = process.env.LCFD_GUILD;

const lcdocExecutive = process.env.LCDOC_EXECUTIVE;
const lcdocCommand = process.env.LCDOC_COMMAND;
const lcdocMuted = process.env.LCDOC_MUTED;

const lcfdExecutive = process.env.LCFD_EXECUTIVE;
const lcfdCommand = process.env.LCFD_COMMAND;
const lcfdEMSCommand = process.env.LCFD_EMS_COMMAND;
const lcfdMuted = process.env.LCFD_MUTED;

module.exports = {
    name: "mute",
    category: "moderation",
    description: "Mutes a person indefinitely or for a specified period of time",
    usage: "<target> [time]",
    options: [{
        type: "USER",
        name: "target",
        description: "Enter the user you wish to mute.",
        required: true
    }, {
        type: "STRING",
        name: "time",
        description: "The amount of time the user should be muted for.",
        required: false
    }],
    defaultPermission: false,
    permissions: [{
        id: '772862333445603338', // Executive Staff - LCFD
        type: 'ROLE',
        permission: true
    }, {
        id: '772862722311323690', // Command Staff - LCFD
        type: 'ROLE',
        permission: true
    }, {
        id: '772863135673090048', // EMS Command - LCFD
        type: 'ROLE',
        permission: true
    }, {
        id: '857257810982207538', // Executive Staff - LCDOC
        type: 'ROLE',
        permission: true
    }, {
        id: '857258429961338881', // Command Staff - LCDOC
        type: 'ROLE',
        permission: true
    }],
    guildId: [lcdocGuild, lcfdGuild],
    run: async (client, interaction) => {
        const embed = new MessageEmbed()
            .setColor(3092790)
            .setTimestamp()
            .setAuthor(interaction.user.tag, interaction.user.avatarURL())
            .setFooter(client.user.username, client.user.avatarURL());

        const targetId = interaction.options.get("target").value;
        const targetMember = interaction.guild.members.cache.get(targetId);

        if(interaction.user.id == targetId) {
            embed.setTitle("You cannot mute yourself.");
            return interaction.reply({ embeds: [embed] });
        }

        // if(interaction.member.roles.cache.hasAny(lcdocExecutive, lcfdExecutive) && targetMember.roles.cache.hasAny(lcdocExecutive, lcfdExecutive)
        // || interaction.member.roles.cache.hasAny(lcdocCommand, lcfdCommand, lcfdEMSCommand) 
        // && targetMember.roles.cache.hasAny(lcdocExecutive, lcdocCommand, lcfdExecutive, lcfdCommand, lcfdEMSCommand)) {
        //     embed.setTitle("You cannot mute someone in the same rank bracket as you or higher.");
        //     return interaction.reply({ embeds: [embed] });
        // }
        
        // You can use a some to check - arr.some(key => interaction.member.roles.cache.has(key))
    }
}