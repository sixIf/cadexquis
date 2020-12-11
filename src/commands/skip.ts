import Discord from "discord.js"
import { Game } from "../classes/game"
import { locales } from "../utils/i18n";

module.exports = {
	name: 'skip',
    description: "skip.shortDescription",
    args: false,
    needGame: true,
	guildOnly: false,
	aliases: ['next'],
	execute(msg: Discord.Message, args: Array<string>, locale: locales) {
        const game = Game.activeGames.find(game => game.id == args.shift());
        game.skip();
	},
};