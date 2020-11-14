import Discord from "discord.js"
import { created, lastEntry } from "../tips.json"
import { spoiler } from "../config.json"

export interface UserText {
    author: Discord.User;
    message: Discord.Message;
}

export interface IGame {
    start(): void;
    stop(): void;
    send(msg: Discord.Message): void;
    skip(): void;
}

export class Game implements IGame {
    private _id: string;
    private _msgOrigin: Discord.Message;
    private _author: Discord.User;
    private _participants: Array<Discord.User>;
    private _round: number;
    private _story: Discord.Collection<Discord.Message, Discord.User>;
    static activeGames: Array<Game> = [];

    constructor(author: Discord.User, participants: Array<Discord.User>, msgOrigin: Discord.Message, round: number){
        this._id = this.generateId();
        this._author = author;
        this._msgOrigin = msgOrigin;
        this._participants = participants;
        this._round = round;
        this._story = new Discord.Collection<Discord.Message, Discord.User>();
        Game.activeGames.push(this);
    }
    
    start(): void {
        this._msgOrigin.channel.send(`The brave are : \n${this.participantsName}`);
        this._msgOrigin.channel.send(`let the game begin, ${this.participants[0]} you go first, check your DMs`);
        this.askToPlay(this.participants[0]);
    }
    
    send(msg: Discord.Message) {
        const isSpoilerPresent = (msg.content.indexOf(spoiler) != -1) && (msg.content.lastIndexOf(spoiler) != -1);
        const isDoubleSpoiler = msg.content.indexOf(spoiler) != msg.content.lastIndexOf(spoiler);

        if (isSpoilerPresent && isDoubleSpoiler){
            const nextParticipant = this.getNextParticipant();
            console.log(nextParticipant)
            this._story.set(msg, msg.author);
            console.log(`round: ${this.round} - this.participants.length: ${this.participants.length} - this.story.size: ${this.story.size}`)
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
        this.askToPlay(nextParticipant, this._story.lastKey());
    }

    stop() {
        const gameIndex = Game.activeGames.findIndex(game => game.id == this.id);
        if (gameIndex != -1) {
            Game.activeGames[gameIndex].recap();
            Game.activeGames.splice(gameIndex);
        }
    }

    private recap() {
        const reduceParticipants = (authors: string, author: Discord.User) => `${authors + ', ' + author.username}`;
        const reduceStory = (story: string, user: Discord.User, msg: Discord.Message ) => `${story + '\n' + user.username.concat(': ', this.getFullText(msg))}`;
        this.msgOrigin.channel.send(`Here is your masterpiece ${this.participants.reduce(reduceParticipants, '')} :\n`);
        this.msgOrigin.channel.send(this.story.reduce(reduceStory, ''));
    }

    // Check wether ce ID already exist
    private generateId() {
        const availableChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const charLength = availableChars.length - 1;
        let code = '';

        for(let i = 0; i < 5; i++){
            const rand = Math.floor(Math.random() * charLength);
            code += availableChars.charAt(rand);
        }

        return code;
    }

    private getNextParticipant(): Discord.User{
        this._participants.push(this._participants.shift());
        return this._participants[0];
    }

    private getHint(msg: Discord.Message): string {
        return msg.content.slice(msg.content.lastIndexOf(spoiler) + 2);
    }    

    private getFullText(msg: Discord.Message): string {
        return msg.content.slice(msg.content.indexOf(spoiler));
    }    

    private askToPlay(user: Discord.User, msg?: Discord.Message): void {        
        user.createDM()
            .then((channel: Discord.DMChannel) => {
                if (this.round * this.participants.length == (this.story.size - 1))
                    channel.send(lastEntry);
                else if (this.story.size > 0) channel.send(`Here is how ${msg.author} ended his part: ` + this.getHint(msg));
                else channel.send(created);
                channel.send(`Use this command to continue the story: \n?send ${this._id} ||Your story to hide|| with a visible end`);
            })
            .catch((err: Error) => {
                console.error(err);
                this.msgOrigin.channel.send(`Couldn\'t send a DM to ${user}, we skip your turn.`)
                this.skip();
            });
    }

    get participantsName(){
        const reduce = (authors: string, author: Discord.User) => `${authors + '-' + author.username+ '\n' }`;
        return this.participants.reduce(reduce, '');
    }

    get id() {
        return this._id;
    }

    get author() {
        return this._author;
    }

    get participants() {
        return this._participants;
    }

    get round() {
        return this._round;
    }

    get msgOrigin() {
        return this._msgOrigin;
    }
    get story() {
        return this._story;
    }
}