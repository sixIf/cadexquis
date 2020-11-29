import Discord from "discord.js"

export interface IGame {
    start(): void;
    stop(): void;
    send(msg: Discord.Message): void;
    skip(): void;
    recap(): void;
}


export abstract class Game implements IGame {
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

    static isUserInActiveGames(userId: string): boolean {
        for(let i = 0; i < Game.activeGames.length; i++){
            if (Game.activeGames[i].isUserInGame(userId)) return true;
        }
        console.log('nb active games ' + Game.activeGames.length)
        console.log('userToTest: ' + userId)
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

    abstract askToPlay(user: Discord.User, msg?: Discord.Message): void;

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

}