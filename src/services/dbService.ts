import { inject, injectable } from "tsyringe";
import { IDbClient } from "../api/dbClient";

export interface IDbService {
    connect(): Promise<any>;
    setChannel(channelID: string, guildID: string, options: any): Promise<any>;
    getChannel(channelID: string): Promise<any>;
    removeGuildChannels(guildID: string): Promise<any>;
}

@injectable()
export class DbService implements IDbService {
    constructor(@inject("IDbClient") private dbClient: IDbClient) { }
    connect(): Promise<any> {
        const response = this.dbClient.connect();
        return response;
    }

    setChannel(channelID: string, guildID: string, options: any): Promise<any> {
        this.dbClient.setChannel(channelID, guildID, options);
        throw new Error("Method not implemented.");
    }
    
    getChannel(channelID: string): Promise<any> {
        this.dbClient.getChannel(channelID);
        throw new Error("Method not implemented.");
    }
    
    removeGuildChannels(guildID: string): Promise<any> {
        this.dbClient.removeGuildChannels(guildID);
        throw new Error("Method not implemented.");
    }

}