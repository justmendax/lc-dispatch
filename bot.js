const { Client, MessageEmbed, Collection, Intents } = require("discord.js");
const { updatePresence } = require("./functions.js");
const { commandArray } = require("./handler/command.js");
require("dotenv").config();
const fs = require("fs");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });

client.commands = new Collection();
client.aliases = new Collection();
client.categories = fs.readdirSync("./commands/");
client.activated = new Collection();

const hostGuild = process.env.HOST_GUILD;
module.exports.hostGuild = hostGuild;

["command"].forEach(handler => {
    require(`./handler/${handler}`)(client);
});

client.on('ready', () => {
    const embed = new MessageEmbed()
        .setColor(3092790)
        .addField(`Bot __*${client.user.username}*__ loaded successfully!`, "**Command status:**")
        .setFooter(client.user.username, client.user.avatarURL())
        .setTimestamp();

    commandArray.forEach(c => {
        embed.addField(c[0], c[1] === true ? '✅' : '❌');
    });

    client.channels.cache.get(process.env.LOAD_CHANNEL).send({ embeds: [embed] });
    console.log(`[*] Client is ready as ${client.user.username}!`);
    updatePresence(client);
});

client.on('messageCreate', async message => {
    if(!client.application.owner)
        await client.application.fetch();

    if(message.content.toLowerCase() == '!deploy' && message.author.id == client.application.owner.id) {
        const embed = new MessageEmbed()
            .setColor(3092790)
            .addField(`Commands deployed successfully!`, "**Command status:**")
            .setFooter(client.user.username, client.user.avatarURL())
            .setTimestamp();

        client.commands.forEach(pull => {
            do {
                const guildId = pull.guildId?.shift() || null;
                client.application.commands.create({
                    name: pull.name,
                    description: pull.description,
                    options: pull.options,
                    defaultPermission: pull.defaultPermission
                }, guildId).then(cmd => {
                    if(pull.permissions && guildId)
                        cmd.permissions.set({ permissions: pull.permissions });
                }).then(embed.addField(pull.name, '✅')).catch(console.error);
            } while(pull.guildId?.length > 0 && (pull.guild ?? false));
        });

        message.channel.send({ embeds: [embed] });
    }

    if(message.content.toLowerCase() == '!deleteglobalcommands' && message.author.id == client.application.owner.id) {
        const embed = new MessageEmbed()
            .setColor(3092790)
            .setTitle("Commands deleted successfully!")
            .setFooter(client.user.username, client.user.avatarURL())
            .setTimestamp();

        client.application.commands.fetch()
            .then(commands => commands.forEach(cmd => {
                cmd.delete();
            }));

        message.channel.send({ embeds: [embed] });
    }

    if(message.content.toLowerCase() == '!deleteguildcommands' && message.author.id == client.application.owner.id) {
        const embed = new MessageEmbed()
            .setColor(3092790)
            .setTitle("Commands deleted successfully!")
            .setFooter(client.user.username, client.user.avatarURL())
            .setTimestamp();

        message.guild.commands.fetch()
            .then(commands => commands.forEach(cmd => {
                cmd.delete();
            }));

        message.channel.send({ embeds: [embed] });
    }

    if(message.content.toLowerCase() == '!test' && message.author.id == client.application.owner.id) {
        message.guild.commands.fetch()
            .then(commands => commands.forEach(cmd => {
                console.log(cmd.defaultPermission);
            }));
    }
});

client.on('guildCreate', guild => {
    console.log(`[+] Guild '${guild.name}' added (ID: ${guild.id}).`);
});

client.on('guildDelete', guild => {
    console.log(`[-] Guild '${guild.name}' removed (ID: ${guild.id}).`);
});

client.on('interactionCreate', interaction => {
    if(!interaction.guild || !interaction.isCommand())
        return;
    
    let command = client.commands.get(interaction.commandName);
    if(!command)
        command = client.commands.get(client.aliases.get(interaction.commandName));

    if(command && command.cooldown && command.exceptCooldown == false) {
        const trigger = client.activated.get(command.name);
        const now = Date.now();
        if(typeof trigger == 'undefined') {
            client.activated.set(command.name, now);
        } else {
            const left = ((trigger + command.cooldown * 1000 - now) / 1000).toFixed(1);
            const embed = new MessageEmbed()
                .setColor(3092790)
                .addField('Too fast!', `Please wait ${left} more second(s) before reusing the \`${command.name}\` command.`)
                .setFooter(client.user.username, client.user.avatarURL())
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }
    }

    if(command) {
        command.run(client, interaction);
        setTimeout(() => client.activated.delete(command.name), command.cooldown * 1000);
    }
});

client.login(process.env.TOKEN);