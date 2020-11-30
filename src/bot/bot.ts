import Discord from "discord.js"
import { defaultCooldown, DiscordCommand } from "../config/literals/command";
import { Game } from "../classes/game";


export class Bot {
    client: Discord.Client;
    prefix: string;
    token: string;
    static commandFiles: string[];
    static commands: Discord.Collection<string, DiscordCommand> = new Discord.Collection();
    cooldowns: Discord.Collection<string, Discord.Collection<string, number>> = new Discord.Collection();

    constructor(prefix: string, token: string){
        this.client = new Discord.Client();
        this.prefix = prefix;
        this.token = token;
        this._init();
    }

    start(){
        this.client.login(this.token);
    }

    private _init() {
        this._onClientReady();
        this._onClientMessage();
    }

    private _onClientReady() {
        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user.tag}`);
        })
    }

    private _onClientMessage() {
        this.client.on('message', msg => {
            if(!msg.content.startsWith(this.prefix) || msg.author.bot) return;
            
            const args = msg.content.slice(this.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
        
            const command = Bot.commands.get(commandName)
                || Bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        
            if (!command) return;
            
            // Verify required arguments
            if (command.args && !args.length) {
                let reply = `You didn't provide any arguments, ${msg.author}`;
        
                if(command.usage) {
                    reply += `\nThe proper usage would be: \`${this.prefix}${command.name} ${command.usage}\``;
                }
        
                return msg.channel.send(reply);
            }
        
            if (command.guildOnly && msg.channel.type === 'dm') {
                return msg.reply('I can\'t execute that command inside DMs!');
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
                    return msg.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
                }        
            } else {
                timestamps.set(msg.author.id, now);
                setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
            }
            
            // Find game if needed
            let game: Game;
            if (command.needGame) {
                game = Game.activeGames.find(game => game.isUserInGame(msg.author.id));
                if (!game) return msg.reply(`We didn't find this game.`);
                else args[0] = game.id;
            }
        
            try {
                command.execute(msg, args);
            } catch (error) {
                console.error(error);
                msg.reply('There was an error trying to execute that command!');
            }    
        })
    }
}