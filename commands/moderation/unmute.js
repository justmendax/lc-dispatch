const { MessageEmbed } = require("discord.js");
require("dotenv").config();

const lcdocGuild = process.env.LCDOC_GUILD;
const lcfdGuild = process.env.LCFD_GUILD;

const lcdocLogs = process.env.LCDOC_LOGS;
const lcfdLogs = process.env.LCFD_LOGS;

const lcdocExecutive = process.env.LCDOC_EXECUTIVE;
const lcdocCommand = process.env.LCDOC_COMMAND;
const lcdocMuted = process.env.LCDOC_MUTED;

const lcfdExecutive = process.env.LCFD_EXECUTIVE;
const lcfdCommand = process.env.LCFD_COMMAND;
const lcfdEMSCommand = process.env.LCFD_EMS_COMMAND;
const lcfdMuted = process.env.LCFD_MUTED;

module.exports = {
    name: "unmute",
    category: "moderation",
    description: "Unmutes a person",
    usage: "<target>",
    options: [{
        type: "USER",
        name: "target",
        description: "Enter the user you wish to mute.",
        required: true
    }],
    defaultPermission: false,
    permissions: [{
        id: lcfdExecutive,
        type: 'ROLE',
        permission: true
    }, {
        id: lcfdCommand,
        type: 'ROLE',
        permission: true
    }, {
        id: lcfdEMSCommand,
        type: 'ROLE',
        permission: true
    }, {
        id: lcdocExecutive,
        type: 'ROLE',
        permission: true
    }, {
        id: lcdocCommand,
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

        const mutedRoles = [lcdocMuted, lcfdMuted];
        const guildMutedRole = mutedRoles.find(key => targetMember.guild.roles.cache.has(key));

        const logChannels = [lcdocLogs, lcfdLogs];
        const channelId = logChannels.find(key => targetMember.guild.channels.cache.has(key));
        const channel = targetMember.guild.channels.cache.get(channelId);

        if(interaction.user.id == targetId) {
            embed.setTitle("You cannot unmute yourself.");
            return interaction.reply({ embeds: [embed] });
        }

        if(!mutedRoles.some(key => targetMember.roles.cache.has(key))) {
            embed.setTitle("That user is not muted.");
            return interaction.reply({ embeds: [embed] });
        }

        const executiveStaff = [lcdocExecutive, lcfdExecutive];
        const commandStaff = [lcdocCommand, lcfdCommand, lcfdEMSCommand];
        const allStaff = [lcdocExecutive, lcdocCommand, lcfdExecutive, lcfdCommand, lcfdEMSCommand];

        if(executiveStaff.some(key => interaction.member.roles.cache.has(key)) && executiveStaff.some(key => targetMember.roles.cache.has(key))
        || commandStaff.some(key => interaction.member.roles.cache.has(key))
        && allStaff.some(key => targetMember.roles.cache.has(key))) {
            embed.setTitle("You cannot unmute someone in the same rank bracket as you or higher.");
            return interaction.reply({ embeds: [embed] });
        }

        try {
            await targetMember.roles.remove(guildMutedRole);
        } catch(err) {
            embed.setTitle(`__${targetMember.displayName}__ couldn't be unmuted!`);
            embed.setDescription("Check the role hierarchy.");
            return interaction.reply({ embeds: [embed] });
        }

        embed.setTitle(`__${targetMember.displayName}__ has been unmuted!`)
            .addField("Moderator", interaction.member.displayName, true)
            .addField("Member", targetMember.user.tag, true);

        interaction.reply({ embeds: [embed] });
        channel.send({ embeds: [embed] });
    }
}