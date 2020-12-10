import { injectable } from 'tsyringe';
import i18n from '../utils/i18n'

export interface ILocaleClient {
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

@injectable()
export class LocaleClient implements ILocaleClient {
    i18n = i18n;

    getCurrentLocale(): string {
        return i18n.getLocale();
    }

    getLocales(): string[] {
        return i18n.getLocales();
    }

    setLocale(locale: string): void {
        i18n.setLocale(locale);
    }

    translate(phrase: string | phraseInfo, args?: any): string {
        return i18n.__(phrase, args);
    }

    translatePlurals(phrase: string, count: number): string {
        return i18n.__n(phrase, count);
    }

}
  