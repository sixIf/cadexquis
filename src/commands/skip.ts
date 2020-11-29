import Discord from "discord.js"
import { Game } from "../classes/game"

module.exports = {
	name: 'skip',
    description: 'Skip sleeping player\'s turn.',
    args: false,
    needGame: true,
	guildOnly: false,
	aliases: ['next'],
	execute(msg: Discord.Message, args: Array<string>) {
        const game = Game.activeGames.find(game => game.id == args.shift());
        game.skip();
	},
};