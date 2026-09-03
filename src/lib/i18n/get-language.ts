import { cookies } from 'next/headers';

export type Language = 'en' | 'mr';

/**
 * Reads the current language preference from the 'lang' cookie.
 * Defaults to 'mr' (Marathi) if not set.
 */
export function getLanguage(): Language {
  const cookieStore = cookies();
  const langCookie = cookieStore.get('lang');
  const lang = langCookie?.value;
  if (lang === 'en') return 'en';
  return 'mr'; // Default to Marathi
}
