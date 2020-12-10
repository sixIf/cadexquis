import { inject, injectable } from "tsyringe";
import { ILocaleClient } from "../api/localeClient";

export interface ILocaleService {
  getCurrentLocale(): string;
  getLocales(): Array<string>;
  setLocale(locale: string): void;
  translate(phrase: string|phraseInfo, args?: any): string;
  translatePlurals(phrase: string|phraseInfo, count: number): string;
}

interface phraseInfo {
  locale: string;
  phrase: string;
}

/**
 * LocaleService
 */
@injectable()
export class LocaleService implements ILocaleService {
    /**
     *
     * @param localeClient The i18n provider
     */
    constructor(@inject("ILocaleClient") private localeClient: ILocaleClient) { }

    /**
     *
     * @returns {string} The current locale code
     */
    getCurrentLocale(): string {
      return this.localeClient.getCurrentLocale();
    }
    /**
     *
     * @returns string[] The list of available locale codes
     */
    getLocales(): Array<string> {
      return this.localeClient.getLocales();
    }
    /**
     *
     * @param locale The locale to set. Must be from the list of available locales.
     */
    setLocale(locale: string): void {
      if (this.getLocales().indexOf(locale) !== -1) {
        this.localeClient.setLocale(locale)
      }
    }
    /**
     *
     * @param string String to translate
     * @param args Extra parameters
     * @returns {string} Translated string
     */
    translate(phrase: string|phraseInfo, args = undefined): string {
      return this.localeClient.translate(phrase, args)
    }
    /**
     *
     * @param phrase Object to translate
     * @param count The plural number
     * @returns {string} Translated string
     */
    translatePlurals(phrase: string, count: number): string {
      return this.localeClient.translatePlurals(phrase, count)
    }
  }