import Discord from "discord.js"
import { defaultPlayer, defaultRound } from "../config/literals/command";
import { start, created } from "../config/tips.json"
import { Game } from "../classes/game"

module.exports = {
	name: 'send',
	description: 'Send your text to next user. Hide the text by putting it between \'||\' symbol.',
    args: true,
    usage: '[GAMEID] [|| Text to hide ||] [text to show]',
    needGame: true,
	guildOnly: false,
	aliases: ['go'],
	execute(msg: Discord.Message, args: Array<string>) {
        const game = Game.activeGames.find(game => game.id == args.shift());
        game.send(msg);            
	},
};