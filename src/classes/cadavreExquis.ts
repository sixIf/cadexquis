import { Game } from "./game"
import Discord from "discord.js"
import { sendStoryWaitTime, visibleWords } from "../config/literals/command"
import { created, lastEntry } from "../config/tips.json"
import { spoiler, prefix } from "../config/config.json"
import { Bot } from "../bot/bot"


export class CadavreExquis extends Game {
    constructor(author: Discord.User, participants: Array<Discord.User>, msgOrigin: Discord.Message, round: number){
        super(author, participants, msgOrigin, round);
        Game.activeGames.push(this);
    }
    
    start(): void {
        this.askToPlay(this.participants[0]);
    }

    askToPlay(user: Discord.User, msg?: Discord.Message): void { 
        let botMsg = ''.concat('\n', `Your phrase will be sent to the next participant with only the last ${visibleWords} word visible.`,
                                '\n\n', `\`Pro tip: you can choose what to hide by putting the text this way: ||This story is hidden|| and this part is not\``,
                                '\n\n', this.story.size > 0 ? `Here is how ${msg.author} ended his part: **` + this.getHint(msg) + '**' : created,
                                this.remainingMsgNb == 1 ? `\n` + lastEntry: '');

        const embedMsg = Bot.embedMsg.setTitle('It\'s your turn !')
            .setDescription(botMsg);
        user.createDM()
            .then((channel: Discord.DMChannel) => {
                const filter = (response: Discord.Message) => {
                    const msgIsValid = !response.content.startsWith(prefix) && !response.author.bot;
                    const msgIsTooShort = response.content.trim().split(' ').length < (visibleWords + 2);
                    if(!msgIsValid) return false;
                    else if (msgIsTooShort) {
                        response.reply(`Don\'t be so shy, write a least ${visibleWords} words.`)
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
                                channel.send('You are sleeping, we skipped your turn !');
                                this.skip();
                            };
                        })
                })
            })
            .catch((err: Error) => {
                console.error(err);
                this.msgOrigin.channel.send(`Couldn\'t send a DM to ${user}, we skip your turn.`)
                this.skip();
            });
    }  
    
    send(msg: Discord.Message) {
        const msgContent = msg.content;
        const splitSpoilerMsg = msgContent.split('||');

        // Spoilers are missing
        if (splitSpoilerMsg.length < 3) {
            const splitSpaceMsg = msg.content.trim().split(' ');
            const hintIndex = msg.content.indexOf(splitSpaceMsg[splitSpaceMsg.length-3]);
            msg.content = '||' + msg.content.slice(0, hintIndex) + '|| ' + msg.content.slice(hintIndex);
        };
        
        this.story.set(msg, msg.author);
        
        if (this.remainingMsgNb == 0) return this.stop();
        else {
            const nextParticipant = this.getNextParticipant();
            msg.reply(`Here is the hint ${nextParticipant.username} will receive: ${this.getHint(msg)}`);            
            this.askToPlay(nextParticipant, msg);
        }
    }
    
    skip() {
        console.log(`participants`)
        console.log(this.participants);
        const nextParticipant = this.getNextParticipant();
        const lastMsg = this.story.lastKey();
        if (!lastMsg || (lastMsg.author.id != nextParticipant.id)) this.askToPlay(nextParticipant, lastMsg);
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
        const reduceStory = (story: string, user: Discord.User, msg: Discord.Message ) => `${story + '\n' + this.getFullText(msg)}`;
        const formattedStory = this.story.reduce(reduceStory, '');
        if (formattedStory.length > 0){
            const embedMsg = Bot.embedMsg.setTitle('Here is your masterpiece')
                .setDescription(formattedStory)
                .addField('Players', this.participants.reduce(reduceParticipants, ''));
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

    private getHint(msg: Discord.Message): string {
        return msg.content.slice(msg.content.lastIndexOf(spoiler) + 2);
    }    

    private getFullText(msg: Discord.Message): string {
        return msg.content.slice(msg.content.indexOf(spoiler));
    }    
}