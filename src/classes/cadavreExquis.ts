import { Game } from "./game"
import Discord from "discord.js"
import { created, lastEntry } from "../config/tips.json"
import { spoiler } from "../config/config.json"

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
        user.createDM()
            .then((channel: Discord.DMChannel) => {
                if (this.round * this.participants.length == (this.story.size - 1))
                    channel.send(lastEntry);
                else if (this.story.size > 0) channel.send(`Here is how ${msg.author} ended his part: ` + this.getHint(msg));
                else channel.send(created);
                channel.send(`Use this command to continue the story: \n\`?send ${this.id} ||Your story to hide that next player won't see|| and some words to let him continue\``);
            })
            .catch((err: Error) => {
                console.error(err);
                this.msgOrigin.channel.send(`Couldn\'t send a DM to ${user}, we skip your turn.`)
                this.skip();
            });
    }      
    
    send(msg: Discord.Message) {
        const isSpoilerPresent = (msg.content.indexOf(spoiler) != -1) && (msg.content.lastIndexOf(spoiler) != -1);
        const isDoubleSpoiler = msg.content.indexOf(spoiler) != msg.content.lastIndexOf(spoiler);

        if (isSpoilerPresent && isDoubleSpoiler){
            const nextParticipant = this.getNextParticipant();
            this.story.set(msg, msg.author);
            if (this.round * this.participants.length == this.story.size)
                this.stop();
            else
                this.askToPlay(nextParticipant, msg);            
        }
        else
            msg.reply('You forgot to hide a part of your text. Encapsulate with the symbol \'||\' at the beginning and end.')        

    }
    
    skip() {
        const nextParticipant = this.getNextParticipant();
        this.askToPlay(nextParticipant, this.story.lastKey());
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
        const reduceStory = (story: string, user: Discord.User, msg: Discord.Message ) => `${story + '\n' + user.username.concat(': ', this.getFullText(msg))}`;
        this.msgOrigin.channel.send(`Here is your masterpiece ${this.participants.reduce(reduceParticipants, '')} :\n`);
        this.msgOrigin.channel.send(this.story.reduce(reduceStory, ''));
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