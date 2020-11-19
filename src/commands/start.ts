import Discord from "discord.js"
import { defaultPlayer } from "../config/literals/command";
import { start } from "../config/tips.json"
import { CadavreExquis } from "../classes/cadavreExquis"

module.exports = {
	name: 'start',
	description: 'Create a game',
    args: false,
	guildOnly: true,
	aliases: ['go'],
	execute(msg: Discord.Message, args: Array<string>) {
		const playerNb = parseInt(args[0]) || defaultPlayer;
        const roundNb = parseInt(args[1]) || defaultPlayer;

        if (playerNb < 2) return msg.reply('You have to be at least 2 players.');

        msg.channel.send(start).then((botMsg) => {
            setTimeout(() => {
                botMsg.react('👍')
                .then()
                .catch(console.error);                
            }, 1000);

            // Await reaction to subscribe user
            const filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
                return ['👍'].includes(reaction.emoji.name) && !user.bot; // TODO: add !user.bot
            };
            
            botMsg.awaitReactions(filter, { max: playerNb, time: 10000, errors: ['time'] })
                .then(collected => {
                    const reaction = collected.first();
                    const participants = reaction.users.cache.mapValues(user => user).filter((user) => !user.bot);
                    if (!participants.get(msg.author.id)) participants.set(msg.author.id, msg.author);
                    const game = new CadavreExquis(msg.author, [...participants.values()], msg, roundNb);
                    participants.each(user => console.log(`${user.username}`))
                    game.start();
                })
                .catch((collected: Discord.Collection<string, Discord.MessageReaction>) => {
                    const reaction = collected.first();
                    if (!reaction) return botMsg.reply('Not enough players, the game has been cancelled.');
                    
                    const participants = reaction.users.cache.mapValues(user => user).filter((user) => !user.bot);
                    if (!participants.get(msg.author.id)) participants.set(msg.author.id, msg.author);
                    
                    // For some reason the reactions doesn't trigger the first .then when we react by clicking an
                    // already existing reaction, so you have to manually look through
                    reaction.users.fetch().then((users) => {
                        users.each(user => {if (!user.bot) participants.set(user.id, user)});
                        participants.each(user => console.log(`${user.username}`))
                        
                        if (participants.size == 1) botMsg.reply(`You can't play alone ${participants.first().username}, go get some friends first.`)
                        else {
                            const game = new CadavreExquis(msg.author, [...participants.values()], msg, roundNb);
                            game.start();
                        }
                    });
                });
        })
	},
};