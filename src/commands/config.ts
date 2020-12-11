import Discord from "discord.js"
import { Bot } from "../bot/bot";
import { Game } from "../classes/game"
import { ChannelInfo } from "../config/literals/channelInfos";
import { ApplicationContainer } from "../di";
import { DbService } from "../services/dbService";
import { LocaleService } from "../services/localeService";
import { LoggerService } from "../services/loggerService";
import { localesInfos, availableLocales, locales } from "../utils/i18n"

const localeService = ApplicationContainer.resolve(LocaleService);
const dbService = ApplicationContainer.resolve(DbService);
const loggerService = ApplicationContainer.resolve(LoggerService);

module.exports = {
	name: 'config',
    description: "config.shortDescription",
    args: false,
    needGame: false,
	guildOnly: false,
	aliases: ['done'],
	async execute(msg: Discord.Message, args: Array<string>, locale: locales) {
        try {
            const localesName = Object.values(localesInfos).reduce((acc, curr) => {
                return acc + `\n${curr.emoji}: ${curr.name}`;
            }, "");
            const embedMsg = Bot.embedMsg.setTitle(localeService.translate("config.title", locale))
            .setDescription(localeService.translate("config.instructions", locale, {locales: localesName, author: msg.author.username}));
            
            msg.channel.send(embedMsg).then((botMsg) => {
                setTimeout(() => {
                    for (const [key, value] of Object.entries(localesInfos)) {
                        botMsg.react(`${value.emoji}`)
                        .then()
                        .catch(err => loggerService.logError(err))
                    }
                }, 500)
            
            
                // Await reaction to set channel locale
                const filter = async (reaction: Discord.MessageReaction, user: Discord.User) => {
                    const acceptedEmojis = Object.values(localesInfos).map((locale) => {
                        return locale.emoji;
                    })
                    return acceptedEmojis.includes(reaction.emoji.name)
                        && !user.bot
                        && user.id == msg.author.id;
                };

                const collector = botMsg.createReactionCollector(filter, { max: 1, time: 60000});
                let emojiReceived = false;

                collector.on('collect', (reaction, user) => {
                    emojiReceived = true;
                    const chosenLocale = Object.entries(localesInfos).find((locale) => {
                        return locale[1].emoji === reaction.emoji.name;
                    })[0];

                    const castedLocale = availableLocales.find((locale) => {return locale.toString() == chosenLocale})
                    this.setChannelConfig(msg, 
                        {
                            _id: msg.channel.id,
                            guildID: msg.guild ? msg.guild.id : "",
                            lang: castedLocale,
                            lastUpdate: Date()
                        },
                        locale
                    )

                })
                collector.on('end', collected => {
                    if(!emojiReceived) botMsg.reply(localeService.translate("config.noResponse", locale, {author: msg.author.username}));
                });
            })
        } catch (err) {
            throw new Error(err);
        }
    },
    
    async setChannelConfig(msgOrigin: Discord.Message, channel: ChannelInfo, locale: locales){
        try{
            const updatedChannel = await dbService.setChannel(channel)
            msgOrigin.channel.send(localeService.translate("config.success", locale));
        } catch (err) {
            throw new Error(err);
        }
    }
};