import Discord from "discord.js"
import { created, lastEntry } from "../tips.json"

export interface UserText {
    author: Discord.User;
    message: Discord.Message;
}

export interface IGame {
    start(): void;
    stop();
    send(msg: Discord.Message, text: string);
    skip();
}

export class Game implements IGame {
    private _id: string;
    private _msgOrigin: Discord.Message;
    private _author: Discord.User;
    private _participants: Array<Discord.User>;
    private _round: number;
    private _message: Array<Discord.Message>;
    static activeGames: Array<Game> = [];

    constructor(author: Discord.User, participants: Array<Discord.User>, msgOrigin: Discord.Message, round: number){
        this._id = this.generateId();
        this._author = author;
        this._msgOrigin = msgOrigin;
        this._participants = participants;
        this._round = round;
        this._message = [];
        Game.activeGames.push(this);
    }
    
    start(): void {
        this._msgOrigin.channel.send(`let the game begin, check your DMs ${this._msgOrigin.author}`);
        this.askToPlay(this._msgOrigin.author, created);
    }
    
    send(msg: Discord.Message, text: string) {
        const nextParticipant = this.getNextParticipant();
        this._message.push(msg);
        this.askToPlay(nextParticipant, text);
    }
    
    skip() {
        const nextParticipant = this.getNextParticipant();
        const lastMsg = this._message[this._message.length].content;
        const lastMsgHint = lastMsg.slice(lastMsg.lastIndexOf('||'))
        this.askToPlay(nextParticipant, lastMsgHint);
    }

    stop() {
        const gameIndex = Game.activeGames.findIndex(game => game.id == this.id);
        if (gameIndex != -1) {
            Game.activeGames[gameIndex].recap();
            Game.activeGames.splice(gameIndex)
        }
    }

    recap() {
        throw new Error("Method not implemented.");
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

    private askToPlay(user: Discord.User, previousText: string): void {        
        user.createDM()
            .then((channel: Discord.DMChannel) => {
                if (this.round * this.participants.length == this.message.length -1)
                    channel.send(lastEntry);
                channel.send(previousText);
                channel.send(`?${this._id} send ||Your story to hide|| and some hints`);
            })
            .catch((err: Error) => {
                console.error(err);
            })
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

    get message() {
        return this._message;
    }

    get msgOrigin() {
        return this._msgOrigin;
    }
}