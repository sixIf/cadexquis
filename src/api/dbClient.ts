import { injectable } from "tsyringe";
import Datastore from "nedb";
import path from 'path'
import { ApplicationContainer } from "../di";
import { LoggerService } from "../services/loggerService";


export interface IDbClient {
    connect(): Promise<any>;
    setChannel(channelID: string, guildID: string, options: any): Promise<any>;
    getChannel(channelID: string): Promise<any>;
    removeGuildChannels(guildID: string): Promise<any>;
}

@injectable()
export class DbClient implements IDbClient {
    logger = ApplicationContainer.resolve(LoggerService);

    connect(): Promise<boolean> {
        this.logger.logInfo('DB connect se lance')
        const db = new Datastore({ filename: path.join(__dirname, '..', 'store', 'channels') });
        return new Promise((resolve, reject) => {
            db.loadDatabase((err) => {
                if (err) {
                    reject(err);
                } else {
                    this.logger.logInfo('Db successfuly connected');
                    resolve();
                }
            });
        })
    }

    setChannel(channelID: string, guildID: string, options: any): Promise<any> {
        throw new Error("Method not implemented.");
    }

    getChannel(channelID: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    
    removeGuildChannels(guildID: string): Promise<any> {
        throw new Error("Method not implemented.");
    }

}