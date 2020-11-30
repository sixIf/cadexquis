import fs from 'fs'
import { Bot } from "./bot/bot";
import { prefix, token } from "./config/config.json"

/**
 * Setup available commands found in
 * ./commands folder
 */
Bot.commandFiles = fs.readdirSync(__dirname + '/commands/').filter(file => file.endsWith('.ts'));
for (const file of Bot.commandFiles) {
    const command = require(`./commands/${file}`);
    Bot.commands.set(command.name, command);
}

const bot = new Bot(prefix, token);

if (Bot.commands.size) bot.start();
else console.log('There is no commands.')
