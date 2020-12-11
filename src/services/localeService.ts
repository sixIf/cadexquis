import { injectable } from "tsyringe";
import i18n, { locales } from '../utils/i18n'

export interface ILocaleService {
  getCurrentLocale(): string;
  getLocales(): Array<string>;
  setLocale(locale: string): void;
  translate(phrase: string, locale: locales, args?: any): string;
}

// interface phraseInfo {
//   locale: string;
//   phrase: string;
// }

/**
 * LocaleService
 */
@injectable()
export class LocaleService implements ILocaleService {
    /**
     *
     * @param i18nProvider The i18n provider
     */
    private i18nProvider = i18n;

    /**
     *
     * @returns {string} The current locale code
     */
    getCurrentLocale(): string {
      return this.i18nProvider.getLocale();
    }
    /**
     *
     * @returns string[] The list of available locale codes
     */
    getLocales(): Array<string> {
      return this.i18nProvider.getLocales();
    }
    /**
     *
     * @param locale The locale to set. Must be from the list of available locales.
     */
    setLocale(locale: string): void {
      if (this.getLocales().indexOf(locale) !== -1) {
        this.i18nProvider.setLocale(locale)
      }
    }
    /**
     *
     * @param phrase String to translate
     * @param locale Targeted language
     * @param args Extra parameters
     * @returns {string} Translated string
     */
    translate(phrase: string, locale: locales, args = undefined): string {
      console.log(`phrase: ${phrase} et locale ${locale}`)
      return this.i18nProvider.__({phrase: phrase, locale: locale}, args)
    }
  }