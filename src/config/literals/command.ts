import Discord from "discord.js"

export interface DiscordCommand extends NodeModule {
    name: string;
    args?: boolean;
    aliases?: Array<string>;
    needGame?: boolean;
    usage?: string;
    guildOnly?: string;
    cooldown: number;
    description: string;
    execute(msg: Discord.Message, args: Array<any>): void;
}

export const defaultCooldown = 3;
export const defaultPlayer = 3;
export const defaultRound = 3;