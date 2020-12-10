import { container } from 'tsyringe'
import { LocaleService } from '../services/localeService'
import { LocaleClient } from '../api/localeClient'

container.register("ILocaleService", { useClass: LocaleService });
container.register("ILocaleClient", { useClass: LocaleClient });

export { container as ApplicationContainer };