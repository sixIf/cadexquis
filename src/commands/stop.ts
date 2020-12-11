import Discord from "discord.js"
import { Game } from "../classes/game"
import { ApplicationContainer } from "../di";
import { LocaleService } from "../services/localeService";
import { locales } from "../utils/i18n";

const localeService = ApplicationContainer.resolve(LocaleService);

module.exports = {
	name: 'stop',
    description: 'stop.shortDescription',
    args: false,
    needGame: true,
	guildOnly: false,
	aliases: ['done'],
	execute(msg: Discord.Message, args: Array<string>, locale: locales) {
        const game = Game.activeGames.find(game => game.id == args.shift());
        if (msg.author.id == game.author.id) game.stop();
        else  msg.reply(localeService.translate("stop.onlyCreator", locale, {creator: game.author}))
	},
};