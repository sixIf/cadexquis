import Discord from "discord.js"
import { Game } from "../config/literals/game"

module.exports = {
	name: 'skip',
    description: 'Skip sleeping player\'s turn.',
    args: true,
    needGame: true,
	guildOnly: false,
	aliases: ['go'],
	execute(msg: Discord.Message, args: Array<string>) {
        const game = Game.activeGames.find(game => game.id == args.shift());
        game.skip();
	},
};