import { Game, StoryMessage } from "./game"
import Discord from "discord.js"
import { sendStoryWaitTime, visibleWords } from "../config/literals/discordCommand"
import { spoiler, prefix } from "../config/config.json"
import { Bot } from "../bot/bot"
import { locales } from "../utils/i18n"


export class CadavreExquis extends Game {
    constructor(author: Discord.User, participants: Array<Discord.User>, msgOrigin: Discord.Message, round: number, locale: locales = 'en'){
        super(author, participants, msgOrigin, round, locale);
        Game.activeGames.push(this);
    }

    start(): void {
        this.askToPlay(this.participants[0]);
    }

    askToPlay(user: Discord.User, storyMsg?: StoryMessage): void { 
        let botMsg = ''.concat('\n', this.story.size > 0 ? 
                                            this.translate("Hint", {author: storyMsg.msg.author.tag, hint: storyMsg.hint}) : 
                                            this.translate("Created"),
                                '\n\n', this.translate("Play-tip"),
                                '\n\n', this.translate("Tip visible word"),
                                this.remainingMsgNb == 1 ? `\n**` + this.translate("Info last round") +'**': '');

        const embedMsg = Bot.embedMsg.setTitle(this.translate("Your turn"))
            .setDescription(botMsg);
        user.createDM()
            .then((channel: Discord.DMChannel) => {
                const filter = (response: Discord.Message) => {
                    const msgIsValid = !response.content.startsWith(prefix) && !response.author.bot;
                    const msgIsTooShort = response.content.trim().split(' ').length < (visibleWords);
                    if(!msgIsValid) return false;
                    else if (msgIsTooShort) {
                        response.reply(this.translate("Not enough words"))
                        return false;
                    } 
                    else return true;
                }

                channel.send(embedMsg).then(() => {
                    channel.awaitMessages(filter, { max: 1, time: sendStoryWaitTime, errors: ['time']})
                        .then(collected => {
                            const userMsg = collected.first();
                            this.send(userMsg);
                        })
                        .catch(collected => {
                            if(!this.done) {
                                channel.send(this.translate("Skip"));
                                this.skip();
                            };
                        })
                })
            })
            .catch((err: Error) => {
                console.error(err);
                this.msgOrigin.channel.send(this.translate("DM error", {user: user.tag}))
                this.skip();
            });
    }  
    
    send(msg: Discord.Message) {
        const msgContent = msg.content;
        let hintIndex = msgContent.lastIndexOf(spoiler);
        let hint = '';
        const pattern = this.escapeSpoiler();
        var regex = new RegExp(pattern, "g");

        // Get last {{visibleWords}} word if no spoiler explicitly set
        if(hintIndex == -1){
            const splitSpaceMsg = msg.content.trim().split(' ');
            const firstHintWord = splitSpaceMsg[splitSpaceMsg.length-visibleWords];
            hintIndex = msg.content.lastIndexOf(firstHintWord);
        } else hintIndex = hintIndex + spoiler.length;
        
        hint = msgContent.slice(hintIndex);
        msg.content = msg.content.replace(regex, '');

        this.story.set({msg: msg, hint: hint}, msg.author);
        
        if (this.remainingMsgNb == 0) return this.stop();
        else {
            const nextParticipant = this.getNextParticipant();
            msg.reply(this.translate("Next user will receive", 
                                        {nextUser: nextParticipant.username, hint: this.story.lastKey().hint}));            
            this.askToPlay(nextParticipant, this.story.lastKey());
        }
    }
    
    skip() {
        const nextParticipant = this.getNextParticipant();
        const lastMsg = this.story.lastKey();
        if (!lastMsg || (lastMsg.msg.author.id != nextParticipant.id)) this.askToPlay(nextParticipant, lastMsg);
        else this.skip();
    }

    stop() {
        this.done = true;
        const gameIndex = Game.activeGames.findIndex(game => game.id == this.id);
        if (gameIndex != -1) {
            this.recap();
            Game.activeGames.splice(gameIndex);
        }
    }

    recap() {
        const reduceParticipants = (authors: string, author: Discord.User, index: number, array: Array<Discord.User>) => `${authors + author.username.concat(index != array.length-1 ? ', ' : '')}`;
        const reduceStory = (story: string, user: Discord.User, storyMsg: StoryMessage ) => `${story + '\n' + storyMsg.msg.content}`;
        const formattedStory = this.story.reduce(reduceStory, '');
        if (formattedStory.length > 0){
            const embedMsg = Bot.embedMsg.setTitle(this.translate("Masterpiece"))
                .setDescription(formattedStory)
                .addField(this.translate('Players'), this.participants.reduce(reduceParticipants, ''));
            this.msgOrigin.channel.send(embedMsg);
        }
    }
    
    get remainingMsgNb(): number {
        return this.round * this.participants.length - this.story.size;
    }

    private getNextParticipant(): Discord.User{
        this.participants.push(this.participants.shift());
        return this.participants[0];
    }

    private escapeSpoiler(): string {
        let arr = spoiler.split('');
        for(let i=0; i<arr.length; i++){
            arr[i] = '\\' + arr[i];
        }
        return arr.join('');
    }


}