import Discord from "discord.js"
import { startEmoji, joinEmoji } from "../config/tips.json"
import { CadavreExquis } from "../classes/cadavreExquis"
import { Game } from "../classes/game";
import { Bot } from "../bot/bot";
import { defaultRound, joinWaitTime } from "../config/literals/command";

module.exports = {
	name: 'start',
	description: `Create a game. By default the game plays in ${defaultRound} rounds.`,
    args: false,
    usage: '[roundNb]',
	guildOnly: true,
	aliases: ['go'],
	execute(msg: Discord.Message, args: Array<string>) {
        const roundNb = parseInt(args[1]) || defaultRound;
        const waitTime = process.env.NODE_ENV == 'development' ? 10000 : joinWaitTime;
        const embedMsg = Bot.embedMsg.setTitle('Let\'s play !')
            .setDescription(`Join the game by reacting ${joinEmoji}`.concat('\n', `${msg.author} you can launch the game by reacting ${startEmoji}`));

        if (Game.isUserInActiveGames(msg.author.id)) return msg.reply(`You already have an active game ${msg.author}`);


        msg.channel.send(embedMsg).then((botMsg) => {
            setTimeout(() => {
                botMsg.react(`${joinEmoji}`)
                botMsg.react(`${startEmoji}`)
                .then()
                .catch(console.error);                
            }, 1000);

            // Await reaction to subscribe user
            const filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
                console.log(reaction.emoji.name + 'par luser' + user.username)
                console.log(( reaction.emoji.name === startEmoji
                    || reaction.emoji.name === joinEmoji )
                    && !user.bot)
                return ( reaction.emoji.name === startEmoji
                    || reaction.emoji.name === joinEmoji )
                    && !user.bot;
            };

            const collector = botMsg.createReactionCollector(filter, { time: waitTime });
            let emojiStartReceived = false;
            const participants = new Discord.Collection<string, Discord.User>();
            participants.set(msg.author.id, msg.author)
            
            // Bug when using same IP: https://github.com/discordjs/discord.js/issues/4947#issuecomment-718487783
            // So in development use 2 different devices
            collector.on('collect', (reaction, user) => {
                if(reaction.emoji.name === startEmoji && user.id == msg.author.id) {
                    emojiStartReceived = true;
                    startGame(participants, msg);
                } else {
                    participants.set(user.id, user)
                }
            });
            collector.on('end', collected => {
                if(!emojiStartReceived) startGame(participants, msg);
            });

        })

        function startGame(participants: Discord.Collection<string, Discord.User>, startMsg: Discord.Message){
            const allowedParticipants = participants.mapValues(user => user).filter((user) => !Game.isUserInActiveGames(user.id));
            participants.forEach((user) => console.log(`PArticipants ${user.username}`))
            allowedParticipants.forEach((user) => console.log(`Allowed ${user.username}`))
            if(allowedParticipants.size < 2) return startMsg.reply(`You can't play alone, go get some friends first.`);
            const game = new CadavreExquis(startMsg.author, [...allowedParticipants.values()], startMsg, roundNb);
            const startedMsg = Bot.embedMsg.setTitle('So the game begins')
                .setDescription(game.participantsName.concat(' ', 
                    'are in.', 
                    participants.size != allowedParticipants.size ? 'If you are not in, that mean you are currently in an active game' : '',
                    '\n', `${game.participants[0]} you go first, check your DMs`)
                );
            startMsg.channel.send(startedMsg);
            game.start();
        }
    },
};