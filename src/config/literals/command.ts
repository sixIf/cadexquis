import Discord from "discord.js"

export interface DiscordCommand extends NodeModule {
    name: string;
    args?: boolean;
    aliases?: Array<string>;
    usage?: string;
    guildOnly?: string;
    cooldown: number;
    description: string;
    execute(msg: Discord.Message, args: Array<any>): void;
}