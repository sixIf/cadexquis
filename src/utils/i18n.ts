import i18n from 'i18n'
import path from 'path'

export const localesInfos = {
  en: {
    name: "English",
    emoji: "🇺🇸"
  },
  fr: {
    name: "Français",
    emoji: "🇫🇷"
  },
  pt: {
    name: "Português",
    emoji: "🇧🇷"
  }
}

export type locales = keyof typeof localesInfos;
export const availableLocales: Array<locales> = ["en", "fr", "pt"];

i18n.configure({
  locales: availableLocales,
  directory: path.join(__dirname, '..', 'locales'),
  objectNotation : true,
  updateFiles: false,
  api: {
    '__': 'translate',  
    '__n': 'translateN' 
  },
});

export default i18n;