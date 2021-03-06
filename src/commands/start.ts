import Discord, { User } from "discord.js"
import { startEmoji, joinEmoji } from "../config/config.json"
import { CadavreExquis } from "../classes/cadavreExquis"
import { Game } from "../classes/game";
import { Bot } from "../bot/bot";
import { defaultRound, joinWaitTime } from "../config/literals/discordCommand";
import { ApplicationContainer } from "../di";
import { LocaleService } from "../services/localeService";

const localeService = ApplicationContainer.resolve(LocaleService);

module.exports = {
	name: 'start',
	description: localeService.translate("start.shortDescription", {defaultRound: defaultRound}),
    args: false,
    usage: '[roundNb]',
	guildOnly: true,
	aliases: ['go'],
	execute(msg: Discord.Message, args: Array<string>) {
        const roundNb = parseInt(args[1]) || defaultRound;
        const waitTime = process.env.NODE_ENV == 'development' ? 10000 : joinWaitTime;
        const embedMsg = Bot.embedMsg.setTitle(localeService.translate("start.title"))
            .setDescription(localeService.translate("start.joinInstruction", {joinEmoji: joinEmoji, startEmoji: startEmoji, author: msg.author}));

        if (Game.isUserInActiveGames(msg.author.id)) return msg.reply(localeService.translate("start.rejectCreation", {creator: msg.author}));


        msg.channel.send(embedMsg).then((botMsg) => {
            setTimeout(() => {
                botMsg.react(`${joinEmoji}`)
                botMsg.react(`${startEmoji}`)
                .then()
                .catch(console.error);                
            }, 1000);
            // Await reaction to subscribe user
            const filter = async (reaction: Discord.MessageReaction, user: Discord.User) => {
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
            collector.on('collect', async (reaction, user) => {
                if (emojiStartReceived) return;
                else if (reaction.emoji.name === startEmoji && user.id == msg.author.id) {
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
            if(allowedParticipants.size < 2) return startMsg.reply(localeService.translate("start.notEnoughPlayers"));
            const game = new CadavreExquis(startMsg.author, [...allowedParticipants.values()], startMsg, roundNb);
            const startedMsg = Bot.embedMsg.setTitle(localeService.translate("start.gameBegin"))
            .setDescription(game.participantsName.concat(' ', 
            localeService.translate("start.areIn"), 
            participants.size != allowedParticipants.size ? localeService.translate("start.explainWhoGotRejected") : '',
            '\n', `${game.participants[0]} ${localeService.translate("start.notifyWhoFirst")}`)
            );
            startMsg.channel.send(startedMsg);
            game.start();
        }
    },
};