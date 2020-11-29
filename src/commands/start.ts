import Discord from "discord.js"
import { defaultPlayer } from "../config/literals/command";
import { start } from "../config/tips.json"
import { CadavreExquis } from "../classes/cadavreExquis"
import { Game } from "../classes/game";

module.exports = {
	name: 'start',
	description: 'Create a game',
    args: false,
	guildOnly: true,
	aliases: ['go'],
	execute(msg: Discord.Message, args: Array<string>) {
		const playerNb = parseInt(args[0]) || defaultPlayer;
        const roundNb = parseInt(args[1]) || defaultPlayer;

        if (Game.isUserInActiveGames(msg.author.id)) return msg.reply(`You already have an active game ${msg.author}`);
        if (playerNb < 2) return msg.reply('You have to be at least 2 players.');

        msg.channel.send(start).then((botMsg) => {
            setTimeout(() => {
                botMsg.react('👍')
                .then()
                .catch(console.error);                
            }, 1000);

            // Await reaction to subscribe user
            const filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
                return reaction.emoji.name === '👍';
            };
            
            botMsg.awaitReactions(filter, { maxUsers: playerNb + 1, time: 10000, errors: ['time'] }) // We add 1 to max to count the bot reaction
                .then(collected => {    
                    const reaction = collected.first();
                    const participants = reaction.users.cache.mapValues(user => user).filter((user) => !user.bot && !Game.isUserInActiveGames(user.id));
                    if (!participants.get(msg.author.id)) participants.set(msg.author.id, msg.author);
                    const game = new CadavreExquis(msg.author, [...participants.values()], msg, roundNb);
                    participants.each((user, index) => console.log(`Participant ${index}: ${user.username}`))
                    console.log('Users')
                    console.log(reaction.users.cache)
                    game.start();
                })
                .catch((collected: Discord.Collection<string, Discord.MessageReaction>) => {
                    const reaction = collected.first();                 
                    let participants = new Discord.Collection<string, Discord.User>();
                    console.log('Users')
                    console.log(reaction.users.cache)
                    // For some reason the reactions doesn't trigger the first .then when we react by clicking an
                    // already existing reaction, so you have to manually look through
                    // https://github.com/discordjs/discord.js/issues/4947#issuecomment-718487783 might be an IP thing
                    reaction.users.fetch().then((users) => {
                        users.each(user => {
                            if (!user.bot && !Game.isUserInActiveGames(user.id)) participants.set(user.id, user)
                        });
                        if (!participants.get(msg.author.id)) participants.set(msg.author.id, msg.author);
                        participants.each((user, index) => console.log(`Participant ${index}: ${user.username}`))
                        
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