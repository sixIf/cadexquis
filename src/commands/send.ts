import Discord from "discord.js"
import { defaultPlayer, defaultRound } from "../config/literals/command";
import { start, created } from "../config/tips.json"
import { Game } from "../config/literals/game"

module.exports = {
	name: 'send',
	description: 'Create a game',
    args: true,
    needGame: true,
	guildOnly: false,
	aliases: ['go'],
	execute(msg: Discord.Message, args: Array<string>) {
        const game = Game.activeGames.find(game => game.id == args.shift());
        // Validate arguments ?
        const text = args.join(' ');
        const isSpoilerPresent = (text.indexOf('||') != -1) && (text.lastIndexOf('||') != -1);
        const isDoubleSpoiler = text.indexOf('||') != text.lastIndexOf('||');
        if (isSpoilerPresent && isDoubleSpoiler)
            game.send(msg, text.slice(text.lastIndexOf('||')));            
        else
            msg.reply('You forgot to hide a part of your text. Encapsulate with the symbol \'||\' at the beginning and end.')
	},
};