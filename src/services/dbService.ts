import { inject, injectable } from "tsyringe";
import { IDbClient } from "../api/dbClient";
import { ChannelInfo } from "../config/literals/channelInfos";

export interface IDbService {
    connect(): Promise<boolean>;
    setChannel(channel: ChannelInfo): Promise<ChannelInfo>;
    getChannel(channel: string): Promise<ChannelInfo>;
    removeGuildChannels(guildID: string): Promise<boolean>;
}

@injectable()
export class DbService implements IDbService {
    constructor(@inject("IDbClient") private dbClient: IDbClient) { }
    connect(): Promise<boolean> {
        const response = this.dbClient.connect();
        return response;
    }

    setChannel(channel: ChannelInfo): Promise<ChannelInfo> {
        const response = this.dbClient.setChannel(channel);
        return response;
    }
    
    getChannel(channelID: string): Promise<ChannelInfo> {
        const response =  this.dbClient.getChannel(channelID);
        return response;
    }
    
    removeGuildChannels(guildID: string): Promise<boolean> {
        const response =  this.dbClient.removeGuildChannels(guildID);
        return response;
    }

}