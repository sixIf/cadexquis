import Discord from "discord.js"
import { ApplicationContainer } from "../di";
import { LocaleService } from "../services/localeService";
import { logger } from "../utils/logger";

export interface IGame {
    start(): void;
    stop(): void;
    send(msg: Discord.Message): void;
    skip(): void;
    recap(): void;
    isUserInGame(userId: string): boolean;
}

export interface StoryMessage {
    msg: Discord.Message;
    hint: string;
}


export abstract class Game implements IGame {
    private _id: string;
    private _msgOrigin: Discord.Message;
    private _author: Discord.User;
    private _participants: Array<Discord.User>;
    private _round: number;
    private _story: Discord.Collection<StoryMessage, Discord.User>;
    static activeGames: Array<Game> = [];
    private _done: boolean;
    private _locale: string;
    localeService = ApplicationContainer.resolve(LocaleService);

    constructor(author: Discord.User, participants: Array<Discord.User>, msgOrigin: Discord.Message, round: number, locale: string){
        this._id = this.generateId();
        this._author = author;
        this._msgOrigin = msgOrigin;
        this._participants = participants;
        this._round = round;
        this._story = new Discord.Collection<StoryMessage, Discord.User>();
        this._done = false;
        this._locale = locale;
        Game.activeGames.push(this);
    }

    static isUserInActiveGames(userId: string): boolean {
        for(let i = 0; i < Game.activeGames.length; i++){
            if (Game.activeGames[i].isUserInGame(userId)) return true;
        }
        return false;
    }

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

    translate(phrase: string, args?: any): string{
        return this.localeService.translate({phrase: phrase, locale: this.locale}, args);
    }

    stop() {
        const gameIndex = Game.activeGames.findIndex(game => game.id == this.id);
        if (gameIndex != -1) {
            this.recap();
            Game.activeGames.splice(gameIndex);
        }
    }

    isUserInGame(userId: string): boolean {
        return this.participants.findIndex(user => user.id == userId) != -1;
    }

    /**
     * Abstract methods
     */    
    
    abstract start(): void;
    
    abstract send(msg: Discord.Message): void;
    
    abstract skip(): void;
    
    abstract recap(): void;

    abstract askToPlay(user: Discord.User, storyMsg?: StoryMessage): void;

    /**
     * Getters
     */

    get participantsName(): string{
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
    
    get locale() {
        return this._locale;
    }
    
    get done() {
        return this._done;
    }

    set done(value: boolean){
        this._done = value;
    }
}