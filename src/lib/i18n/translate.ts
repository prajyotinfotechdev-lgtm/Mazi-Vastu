import type { Language } from './get-language';
import en from './translations/en.json';
import mr from './translations/mr.json';

const dictionaries: Record<Language, Record<string, string>> = { en, mr };

/**
 * Translate a key for the given language.
 * Falls back to English if the key is missing in the target language.
 * Falls back to the key itself if missing in both.
 */
export function t(key: string, lang: Language): string {
  return dictionaries[lang]?.[key] ?? dictionaries['en']?.[key] ?? key;
}
