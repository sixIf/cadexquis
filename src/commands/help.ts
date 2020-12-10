import { prefix } from "../config/config.json"
import Discord from "discord.js"
import { defaultCooldown } from "../config/literals/discordCommand";
import { Bot } from "../bot/bot";
import { ApplicationContainer } from "../di";
import { LocaleService } from "../services/localeService";

const localeService = ApplicationContainer.resolve(LocaleService);

module.exports = {
    name: 'help',
	description: localeService.translate("help.shortDescription"),
	aliases: ['aide'],
	usage: '[command name]',
	cooldown: 2,
	execute(msg: Discord.Message, args: Array<string>) {       
		const data = [];

        const commands = Bot.commands;
        const embedMsg = Bot.embedMsg.setTitle('Cadavre exquis')
            .setURL('http://cadexquis.site/')
            .setDescription(localeService.translate("help.description"));

        if (!args.length) {
            data.push(localeService.translate("help.listCmds"));
            data.push(commands.map(command => command.name).join(', '));
            data.push(localeService.translate("help.detailledHelp", {prefix: prefix}));
            
            embedMsg.addField(localeService.translate('help.cmds'), data.join('\n'))
            return msg.channel.send(embedMsg);       
        }
        else {
            const name = args[0].toLowerCase();
            const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
            
            if (!command) {
                return msg.reply(localeService.translate('help.cmdNotValid'));
            }
            
            data.push(localeService.translate("help.cmdName", {name: command.name}));
            
            if (command.aliases) data.push(localeService.translate("help.cmdAliases", {aliases: command.aliases.join(', ')}));
            if (command.description) data.push(localeService.translate("help.cmdDescription", {description: command.description}));
            if (command.usage) data.push(localeService.translate("help.cmdUsage", {usage: `${prefix}${command.name} ${command.usage}`}));
            
            data.push(localeService.translate("help.cmdCooldown", {cooldown: `${command.cooldown || defaultCooldown}`}));
            
            embedMsg.addField(localeService.translate('help.cmds'), data.join('\n'))
            return msg.channel.send(embedMsg); 
        }
	},
}