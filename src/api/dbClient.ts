import { injectable } from "tsyringe";
import Datastore from "nedb";
import path from 'path'
import { ApplicationContainer } from "../di";
import { LoggerService } from "../services/loggerService";
import { ChannelInfo } from "../config/literals/channelInfos";


export interface IDbClient {
    connect(): Promise<boolean>;
    setChannel(channel: ChannelInfo): Promise<ChannelInfo>;
    getChannel(channelID: string): Promise<ChannelInfo>;
    removeGuildChannels(guildID: string): Promise<boolean>;
}

@injectable()
export class DbClient implements IDbClient {
    logger = ApplicationContainer.resolve(LoggerService);
    static db: Datastore<ChannelInfo>;

    connect(): Promise<boolean> {
        DbClient.db = new Datastore({ filename: path.join(__dirname, '..', 'store', 'channels') });
        return new Promise((resolve, reject) => {
            DbClient.db.loadDatabase((err) => {
                if (err) {
                    reject(err);
                } else {
                    this.logger.logInfo('Db successfuly connected');
                    resolve(true);
                }
            });
        })
    }

    setChannel(channel: ChannelInfo): Promise<ChannelInfo> {
        return new Promise((resolve, reject) => {
            DbClient.db.update({ _id: channel._id } , channel, { upsert: true }, (err, numAffected, affectedDocuments: ChannelInfo, upsert: boolean) => {
                if (err) {
                    reject(err);
                } else {
                    this.logger.logInfo(`Channel ${channel._id} persisted`);
                    resolve(affectedDocuments);
                }
            });
        });
    }

    getChannel(channelID: string): Promise<ChannelInfo> {
        return new Promise((resolve, reject) => {
            DbClient.db.findOne({ _id: channelID }, (err: Error, channel: any) => {
                if (err) {
                    reject(err);
                } else {
                    this.logger.logInfo(`Channel ${channel._id} found`);
                    resolve(channel);
                }
            });
        });
    }
    
    removeGuildChannels(guildID: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            DbClient.db.remove({ guildID: guildID }, { multi: true }, (err, numRemoved) => {
                if (err) {
                    reject(err);
                } else {
                    this.logger.logInfo(`${numRemoved} channels from guild ${guildID} deleted`);
                    resolve(true);
                }
            });
        });
    }

}