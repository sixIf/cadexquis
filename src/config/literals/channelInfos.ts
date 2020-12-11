import { locales } from '../../utils/i18n'

export interface ChannelInfo {
    _id: string;
    guildID: string;
    lastUpdate: string;
    lang: locales;
}