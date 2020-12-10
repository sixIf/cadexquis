import { container } from 'tsyringe'
import { LocaleService } from '../services/localeService'

container.register("ILocaleService", { useClass: LocaleService });

export { container as ApplicationContainer };