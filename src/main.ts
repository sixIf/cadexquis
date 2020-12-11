import "reflect-metadata"
import { Bot } from "./bot/bot";
import { prefix, token } from "./config/config.json"
import { ApplicationContainer } from "./di";
import { LocaleService } from "./services/localeService";
import { LoggerService } from "./services/loggerService";

const logger = ApplicationContainer.resolve(LoggerService);
const bot = new Bot(prefix, token);

const locale = ApplicationContainer.resolve(LocaleService);
logger.logInfo(locale.translate("help.description", "fr"))

// Start Bot 
if (Bot.commands.size) bot.start();
else logger.logError('There is no commands.');