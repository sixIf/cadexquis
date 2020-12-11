import { prefix } from "../config/config.json"
import Discord from "discord.js"
import { defaultCooldown } from "../config/literals/discordCommand";
import { Bot } from "../bot/bot";
import { ApplicationContainer } from "../di";
import { LocaleService } from "../services/localeService";
import { locales } from "../utils/i18n";

const localeService = ApplicationContainer.resolve(LocaleService);

module.exports = {
    name: 'help',
	description: "help.shortDescription",
	aliases: ['aide'],
	usage: '[command name]',
	cooldown: 2,
	execute(msg: Discord.Message, args: Array<string>, locale: locales) {       
		const data = [];

        const commands = Bot.commands;
        const embedMsg = Bot.embedMsg.setTitle('Cadavre exquis')
            .setURL('http://cadexquis.site/')
            .setDescription(localeService.translate("help.description", locale, {startCmd: `${prefix}start`}));

        if (!args.length) {
            data.push(localeService.translate("help.listCmds", locale));
            data.push(commands.map(command => command.name).join(', '));
            data.push(localeService.translate("help.detailledHelp", locale, {prefix: prefix}));
            
            embedMsg.addField(localeService.translate('help.cmds', locale), data.join('\n'))
            return msg.channel.send(embedMsg);       
        }
        else {
            const name = args[0].toLowerCase();
            const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
            
            if (!command) {
                return msg.reply(localeService.translate('help.cmdNotValid', locale));
            }
            
            data.push(localeService.translate("help.cmdName", locale, {name: command.name}));
            
            if (command.aliases) data.push(localeService.translate("help.cmdAliases", locale, {aliases: command.aliases.join(', ')}));
            if (command.description) data.push(localeService.translate("help.cmdDescription", locale, {description: localeService.translate(command.description, locale, command.descriptionArgs)}));
            if (command.usage) data.push(localeService.translate("help.cmdUsage", locale, {usage: `${prefix}${command.name} ${command.usage}`}));
            
            data.push(localeService.translate("help.cmdCooldown", locale, {cooldown: `${command.cooldown || defaultCooldown}`}));
            
            embedMsg.addField(localeService.translate('help.cmds', locale), data.join('\n'))
            return msg.channel.send(embedMsg); 
        }
	},
}