import Discord from "discord.js"
import { Game } from "../classes/game"

module.exports = {
	name: 'stop',
    description: 'Stop the game.',
    args: false,
    needGame: true,
	guildOnly: false,
	aliases: ['done'],
	execute(msg: Discord.Message, args: Array<string>) {
        const game = Game.activeGames.find(game => game.id == args.shift());
        if (msg.author.id == game.author.id) game.stop();
        else  msg.reply(`Only ${game.author} is powerful enough to stop the game.`)
	},
};