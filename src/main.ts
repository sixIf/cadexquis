import { Bot } from "./bot/bot";
import { prefix, token } from "./config/config.json"

const bot = new Bot(prefix, token);

if (Bot.commands.size) bot.start();
else console.log('There is no commands.')
