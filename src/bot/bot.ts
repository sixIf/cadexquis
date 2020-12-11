import Discord from "discord.js"
import { defaultCooldown, DiscordCommand } from "../config/literals/discordCommand";
import { Game } from "../classes/game";
import commands from "../utils/commands";
import { ApplicationContainer } from "../di";
import { LocaleService } from "../services/localeService";
import { LoggerService } from "../services/loggerService";
import { DbService } from "../services/dbService";
import { locales } from "../utils/i18n";


export class Bot {
    client: Discord.Client;
    prefix: string;
    token: string;
    static commands = commands;
    logger = ApplicationContainer.resolve(LoggerService);;
    cooldowns: Discord.Collection<string, Discord.Collection<string, number>> = new Discord.Collection();
    localeService = ApplicationContainer.resolve(LocaleService);
    dbService = ApplicationContainer.resolve(DbService)

    constructor(prefix: string, token: string){
        this.client = new Discord.Client();
        this.prefix = prefix;
        this.token = token;
        this._init();
    }

    start(){
        this.client.login(this.token);
    }

    static get embedMsg(){
        return new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor('Cadavre Exquis', 'https://upload.wikimedia.org/wikipedia/commons/8/85/Exquisite_Corpses_example.jpg', 'http://cadexquis.site/')
        .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/8/85/Exquisite_Corpses_example.jpg');
    }

    private async _init() {
        try {
            await this.dbService.connect();
            this._onClientReady();
            this._onClientMessage();

        } catch (err) {
            this.logger.logError(err);
        }
    }

    private _onClientReady() {
        this.client.on('ready', () => {
            this.logger.logInfo(`Logged in as ${this.client.user.tag}`);
        })
    }

    private _onClientMessage() {
        this.client.on('message', async msg => {
            if(!msg.content.startsWith(this.prefix) || msg.author.bot) return;

            let currentLocale: locales = "en";

            try {
                const channel = await this.dbService.getChannel(msg.channel.id);
                currentLocale = channel.lang;
            } catch (err) {
                this.logger.logError(err);
            }
            
            const args = msg.content.slice(this.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
        
            const command = Bot.commands.get(commandName)
                || Bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        
            if (!command) return;
            
            // Verify required arguments
            if (command.args && !args.length) {
                let reply = this.localeService.translate("command.argMissing", currentLocale, {author: msg.author});
        
                if(command.usage) {
                    reply += this.localeService.translate("command.correctUsage", currentLocale, {usage: `${this.prefix}${command.name} ${command.usage}`});
                }
                return msg.channel.send(reply);
            }
        
            if (command.guildOnly && msg.channel.type === 'dm') {
                return msg.reply(this.localeService.translate("command.dmForbidden", currentLocale));
            }
        
            // Handle Cooldowns 
            if (!this.cooldowns.has(command.name)) {
                this.cooldowns.set(command.name, new Discord.Collection());
            }
        
            const now = Date.now();
            const timestamps = this.cooldowns.get(command.name);
            const cooldownAmount = (command.cooldown || defaultCooldown) * 1000;
            
            if (timestamps.has(msg.author.id)){
                const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;
        
                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return msg.reply(this.localeService.translate("command.waitCooldown", currentLocale, {time: timeLeft.toFixed(1), name: command.name}));
                }        
            } else {
                timestamps.set(msg.author.id, now);
                setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
            }
            
            // Find game if needed
            let game: Game;
            if (command.needGame) {
                game = Game.activeGames.find(game => game.isUserInGame(msg.author.id));
                if (!game) return;
                else args[0] = game.id;
            }
        
            try {
                command.execute(msg, args, currentLocale);
            } catch (error) {
                this.logger.logError(`Error trying to execute ${commandName}`);
                msg.reply(this.localeService.translate("command.error", currentLocale));
            }    
        })
    }
}