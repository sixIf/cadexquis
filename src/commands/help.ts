import { prefix } from "../config/config.json"
import Discord from "discord.js"
import { defaultCooldown } from "../config/literals/command";
import { Bot } from "../bot/bot";
import { description } from "../config/tips.json"

module.exports = {
    name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands'],
	usage: '[command name]',
	cooldown: 2,
	execute(msg: Discord.Message, args: Array<string>) {
		const data = [];

        const commands = Bot.commands;
        const embedMsg = Bot.embedMsg.setTitle('Cadavre exquis')
            .setURL('http://cadexquis.site/')
            .setDescription(description);

        if (!args.length) {
            data.push('Here\'s a list of all my commands:');
            data.push(commands.map(command => command.name).join(', '));
            data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
            
            embedMsg.addField('Commands', data.join('\n'))
            return msg.channel.send(embedMsg);       
        }
        else {
            const name = args[0].toLowerCase();
            const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
            
            if (!command) {
                return msg.reply('that\'s not a valid command!');
            }
            
            data.push(`**Name:** ${command.name}`);
            
            if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
            if (command.description) data.push(`**Description:** ${command.description}`);
            if (command.usage) data.push(`**Usage:** \`${prefix}${command.name} ${command.usage}\``);
            
            data.push(`**Cooldown:** ${command.cooldown || defaultCooldown} second(s)`);
            
            embedMsg.addField('Commands', data.join('\n'))
            return msg.channel.send(embedMsg); 
        }
	},
}