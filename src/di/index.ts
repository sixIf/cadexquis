import { container } from 'tsyringe'
import { LocaleService } from '../services/localeService'
import { DbService } from '../services/dbService'
import { LoggerService } from '../services/loggerService'
import { DbClient } from '../api/dbClient';

container.register("ILocaleService", { useClass: LocaleService });
container.register("IDbClient", { useClass: DbClient });
container.register("IDbService", { useClass: DbService });
container.register("ILoggerService", { useClass: LoggerService });

export { container as ApplicationContainer };