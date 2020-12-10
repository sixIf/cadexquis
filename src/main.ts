import "reflect-metadata"
import { Bot } from "./bot/bot";
import { prefix, token } from "./config/config.json"
import { ApplicationContainer } from "./di";
import { LocaleService } from "./services/localeService";
import { logger } from "./utils/logger";

const bot = new Bot(prefix, token);

if (Bot.commands.size) bot.start();
else logger.log({
    level: 'error',
    message: `There is no commands.`
});

// const localeService = ApplicationContainer.resolve(LocaleService);
