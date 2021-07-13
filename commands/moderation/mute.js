const { MessageEmbed } = require("discord.js");
const ms = require("ms");
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
    name: "mute",
    category: "moderation",
    description: "Mutes a person indefinitely or for a specified period of time",
    usage: "<target> [time] [reason]",
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
    }, {
        type: "STRING",
        name: "reason",
        description: "The reason for muting the user.",
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

        const mutedRoles = [lcdocMuted, lcfdMuted];
        const guildMutedRole = mutedRoles.find(key => targetMember.guild.roles.cache.has(key));

        const logChannels = [lcdocLogs, lcfdLogs];
        const channelId = logChannels.find(key => targetMember.guild.channels.cache.has(key));
        const channel = targetMember.guild.channels.cache.get(channelId);

        if(interaction.user.id == targetId) {
            embed.setTitle("You cannot mute yourself.");
            return interaction.reply({ embeds: [embed] });
        }

        if(mutedRoles.some(key => targetMember.roles.cache.has(key))) {
            embed.setTitle("That user is already muted.");
            return interaction.reply({ embeds: [embed] });
        }

        const executiveStaff = [lcdocExecutive, lcfdExecutive];
        const commandStaff = [lcdocCommand, lcfdCommand, lcfdEMSCommand];
        const allStaff = [lcdocExecutive, lcdocCommand, lcfdExecutive, lcfdCommand, lcfdEMSCommand];

        if(executiveStaff.some(key => interaction.member.roles.cache.has(key)) && executiveStaff.some(key => targetMember.roles.cache.has(key))
        || commandStaff.some(key => interaction.member.roles.cache.has(key))
        && allStaff.some(key => targetMember.roles.cache.has(key))) {
            embed.setTitle("You cannot mute someone in the same rank bracket as you or higher.");
            return interaction.reply({ embeds: [embed] });
        }

        const time = interaction.options.get("time")?.value;
        if(time > 1209600000) {
            embed.setTitle("You can mute someone for a maximum of 14 days.");
            return interaction.reply({ embeds: [embed] });
        }

        var reason = interaction.options.get("reason")?.value;
        if(typeof reason == null)
            reason = "Not specified.";
        if(reason?.length > 1024)
            reason = reason.slice(0, 1021) + '...';

        try {
            await targetMember.roles.add(guildMutedRole);
        } catch(err) {
            embed.setTitle(`__${targetMember.displayName}__ couldn't be muted!`);
            embed.setDescription("Check the role hierarchy.");
            return interaction.reply({ embeds: [embed] });
        }

        embed.setTitle(`__${targetMember.displayName}__ has been muted!`)
            .addField("Moderator", interaction.member.displayName, true)
            .addField("Member", targetMember.user.tag, true)
            .addField("Time", time ? ms(ms(time), { long: true }) : "Indefinite", true)
            .addField("Reason", reason ?? "Unspecified.");

        interaction.reply({ embeds: [embed] });
        channel.send({ embeds: [embed] });

        if(time)
            var timeout = client.setTimeout(async () => {
                try {
                    await targetMember.roles.remove(guildMutedRole);
                    const unmuteEmbed = new MessageEmbed()
                        .setColor(3092790)
                        .setTimestamp()
                        .setAuthor(interaction.user.tag, interaction.user.avatarURL())
                        .setFooter(client.user.username, client.user.avatarURL())
                        .setTitle(`__${targetMember.displayName}__ has been automatically unmuted!`)
                        .addField("Moderator", interaction.member.displayName, true)
                        .addField("Member", targetMember.user.tag, true)
                        .addField("Muted for", time ? ms(ms(time), { long: true }) : "Indefinite", true)
                        .addField("Reason", reason ?? "Unspecified.");
                    interaction.channel.send({ embeds: [unmuteEmbed] });
                    return channel.send({ embeds: [embed] });
                } catch(err) {
                    const unmuteEmbed = new MessageEmbed()
                        .setColor(3092790)
                        .setTimestamp()
                        .setAuthor(interaction.user.tag, interaction.user.avatarURL())
                        .setFooter(client.user.username, client.user.avatarURL())
                        .setTitle(`__${targetMember.displayName}__ couldn't be automatically unmuted!`);
                    interaction.channel.send({ embeds: [unmuteEmbed] });
                    return channel.send({ embeds: [embed] });
                }
            }, ms(time));
            client.muteTimeouts.set(targetId, timeout);
    }
}