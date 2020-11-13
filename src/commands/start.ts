import Discord from "discord.js"
import { defaultPlayer, defaultRound } from "../config/literals/command";
import { start, created } from "../config/tips.json"
import { Game } from "../config/literals/game"

module.exports = {
	name: 'start',
	description: 'Create a game',
    args: false,
	guildOnly: true,
	aliases: ['go'],
	execute(msg: Discord.Message, args: Array<string>) {
		const playerNb = parseInt(args[0]) || defaultPlayer;
        const roundNb = parseInt(args[1]) || defaultPlayer;
        
        msg.channel.send(start).then((botMsg) => {
            setTimeout(() => {
                botMsg.react('👍')
                .then()
                .catch(console.error);                
            }, 1000);

            // Await reaction to subscribe user
            const filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
                return ['👍'].includes(reaction.emoji.name); // TODO: add !user.bot
            };
            
            botMsg.awaitReactions(filter, { max: playerNb, time: 10000, errors: ['time'] })
                .then(collected => {
                    const reaction = collected.first();
                    const participants = reaction.users.cache.mapValues(user => user);
                    const game = new Game(msg.author, [...participants.values()], msg, roundNb);
                    game.start();
                })
                .catch((collected: Discord.Collection<string, Discord.MessageReaction>) => {
                    const reaction = collected.first();
                    console.log(`Collected ${collected.size} reactions`);
                    const participants = reaction.users.cache.mapValues(user => user);
                    participants.each(user => console.log(`${user.username}`))
                    
                    if (participants.size == 1) botMsg.reply('Not enough players, the game has been cancelled.')
                    else {
                        const game = new Game(msg.author, [...participants.values()], msg, roundNb);
                        game.start();
                    }
                });
        })
	},
};