import Discord from "discord.js"
import { created } from "../tips.json"

export interface UserText {
    author: Discord.User;
    message: Discord.Message;
}

export interface IGame {
    start(): void;
    stop(msg: Discord.Message);
    recap(msg: Discord.Message);
    send(msg: Discord.Message, args: Array<string>);
}

export class Game implements IGame {
    private _id: string;
    private _msgOrigin: Discord.Message;
    private _author: Discord.User;
    private _participants: Array<Discord.User>;
    private _round: number;
    private _message: Array<Discord.Message>;

    constructor(author: Discord.User, participants: Array<Discord.User>, msgOrigin: Discord.Message, round: number){
        this._id = this.generateId();
        this._author = author;
        this._msgOrigin = msgOrigin;
        this._participants = participants;
        this._round = round;
        this._message = [];
    }

    start() {
        this._msgOrigin.channel.send(`let the game begin, check your DMs ${this._msgOrigin.author}`)
        this._msgOrigin.author.createDM()
            .then((channel: Discord.DMChannel) => {
                channel.send(created);
                channel.send(`?${this._id} send ||Your story to hide|| and some hints`);
            })
            .catch((err: Error) => {
                console.error(err);
            })
    }
    stop(msg: any) {
        throw new Error("Method not implemented.");
    }
    recap(msg: Discord.Message) {
        throw new Error("Method not implemented.");
    }
    send(msg: Discord.Message, args: string[]) {
        throw new Error("Method not implemented.");
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

}