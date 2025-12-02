// Import complete locale files
import { mn } from './locales/mn';
import { ko } from './locales/ko';
import { en } from './locales/en';

// Available locales
const localeModules = {
  ko,
  mn,
  en,
};

export type Language = keyof typeof localeModules;

export type TranslationKeys = keyof typeof mn;

export const translations = localeModules;

// Dynamically generate language list from available translations
export const languages = Object.keys(localeModules).map(code => {
  const languageNames = {
    ko: { name: '한국어', flag: '🇰🇷' },
    mn: { name: 'Монгол', flag: '🇲🇳' },
    en: { name: 'English', flag: '🇺🇸' },
  };
  
  return {
    code: code as Language,
    name: languageNames[code as keyof typeof languageNames]?.name || code.toUpperCase(),
    flag: languageNames[code as keyof typeof languageNames]?.flag || '🌐',
  };
});

export const defaultLanguage: Language = 'mn';

// Helper function to get nested translation
export function getNestedValue(obj: Record<string, any>, path: string): string {
  try {
    const value = path.split('.').reduce((current: any, key: string) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
    
    if (typeof value === 'string') return value;
    
    // Try fallback to Korean if Mongolian fails
    const fallbackValue = path.split('.').reduce((current: any, key: string) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, translations.ko);
    
    if (typeof fallbackValue === 'string') return fallbackValue;
    
    // Final fallback
    return path;
  } catch (error) {
    return path;
  }
}

// Browser language detection
export function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return defaultLanguage;
  
  const browserLang = navigator.language || navigator.languages?.[0];
  
  if (browserLang?.startsWith('ko')) return 'ko';
  if (browserLang?.startsWith('mn')) return 'mn';
  if (browserLang?.startsWith('en')) return 'en';
  return defaultLanguage; // Default to Mongolian for other languages
}

// Language persistence
export function saveLanguage(language: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferred-language', language);
  }
}

export function getSavedLanguage(): Language | null {
  if (typeof window === 'undefined') return null;
  
  const saved = localStorage.getItem('preferred-language');
  if (saved && ['ko', 'mn', 'en'].includes(saved)) {
    return saved as Language;
  }
  return null;
}