import { Game } from "./game"
import Discord, { Message } from "discord.js"
import { visibleWords } from "../config/literals/command"
import { created, lastEntry } from "../config/tips.json"
import { spoiler, prefix } from "../config/config.json"


export class CadavreExquis extends Game {
    constructor(author: Discord.User, participants: Array<Discord.User>, msgOrigin: Discord.Message, round: number){
        super(author, participants, msgOrigin, round);
        Game.activeGames.push(this);
    }
    
    start(): void {
        this.msgOrigin.channel.send(`The brave are : \n${this.participantsName}`);
        this.msgOrigin.channel.send(`let the game begin, ${this.participants[0]} you go first, check your DMs`);
        this.askToPlay(this.participants[0]);
    }

    askToPlay(user: Discord.User, msg?: Discord.Message): void { 
        let botMsg = ''.concat('\n', `\`Your phrase will be sent to the next participant with only the last ${visibleWords} word visible.\``,
                                '\n', `\`Pro tip: you can choose what to hide by putting the text this way: ||Hidden text||\``,
                                '\n', this.story.size > 0 ? `Here is how ${msg.author} ended his part: **` + this.getHint(msg) + '**' : created,
                                this.remainingMsgNb == 1 ? `\n` + lastEntry: '');

        user.createDM()
            .then((channel: Discord.DMChannel) => {
                const filter = (response: Discord.Message, sender: Discord.User) => {
                    return !response.content.startsWith(prefix) || !sender.bot;
                }

                channel.send(botMsg).then(() => {
                    channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time']})
                        .then(collected => {
                            const userMsg = collected.first();
                            this.send(userMsg);
                        })
                        .catch(collected => {
                            channel.send('You are sleeping, we skipped your turn !');
                            this.skip();
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
        const isSpoilerPresent = (msgContent.indexOf(spoiler) != -1) && (msgContent.lastIndexOf(spoiler) != -1);
        const isDoubleSpoiler = msgContent.indexOf(spoiler) != msgContent.lastIndexOf(spoiler);

        if (!isSpoilerPresent || !isDoubleSpoiler){
            // Set automatically the spoilers
            let msgArray = msgContent.split(' ');
            let hintIndex = 0;
            if (msgArray.length > 5) hintIndex = msgArray.length - visibleWords - 1;
            else hintIndex = msgArray.length - 2; // Only one word ? :'(

            const hiddenMsg = msgArray.slice(0, hintIndex);
            const visibleMsg = msgArray.slice(hintIndex);
            msg.content = '||' + hiddenMsg.join(' ') + '||' + visibleMsg.join(' ');
        }

        const nextParticipant = this.getNextParticipant();
        this.story.set(msg, msg.author);
        if (this.remainingMsgNb == 0) this.stop();
        else {
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
        const gameIndex = Game.activeGames.findIndex(game => game.id == this.id);
        if (gameIndex != -1) {
            this.recap();
            Game.activeGames.splice(gameIndex);
        }
    }

    recap() {
        const reduceParticipants = (authors: string, author: Discord.User) => `${authors + ', ' + author.username}`;
        const reduceStory = (story: string, user: Discord.User, msg: Discord.Message ) => `${story + '\n' + this.getFullText(msg)}`;
        const formattedStory = this.story.reduce(reduceStory, '');
        if (formattedStory.length > 0){
            this.msgOrigin.channel.send(`Here is your masterpiece ${this.participants.reduce(reduceParticipants, '')} :\n`);
            this.msgOrigin.channel.send(this.story.reduce(reduceStory, ''));
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