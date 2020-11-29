import { prefix, token } from "./config/config.json"
import Discord from "discord.js"
import fs from 'fs'
import { DiscordCommand, defaultCooldown } from './config/literals/command'
import { Game, IGame } from "./classes/game";


const client = new Discord.Client();
const commands: Discord.Collection<string, DiscordCommand> = new Discord.Collection();
const cooldowns: Discord.Collection<string, Discord.Collection<string, number>> = new Discord.Collection();
const commandFiles = fs.readdirSync(__dirname + '/commands/').filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.set(command.name, command);
}

export default commands;


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
})

client.on('message', msg => {
    if(!msg.content.startsWith(prefix) || msg.author.bot) return;
    
	const args = msg.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = commands.get(commandName)
		|| commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;
    
    // Verify required arguments
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${msg.author}`;

        if(command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return msg.channel.send(reply);
    }

    if (command.guildOnly && msg.channel.type === 'dm') {
        return msg.reply('I can\'t execute that command inside DMs!');
    }

    // Handle Cooldowns 

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
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
    
    // Find game
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
        msg.reply('there was an error trying to execute that command!');
    }    
})

client.login(token);

