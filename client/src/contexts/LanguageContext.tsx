import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { 
  Language, 
  translations, 
  defaultLanguage, 
  detectBrowserLanguage, 
  saveLanguage, 
  getSavedLanguage,
  getNestedValue 
} from '@/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    // For user pages, default to Mongolian
    return getSavedLanguage() || defaultLanguage;
  });

  const setLanguage = useCallback((lang: Language) => {
    console.log(`Changing language from ${language} to ${lang}`);
    setLanguageState(lang);
    saveLanguage(lang);
  }, [language]);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    try {
      // First try the current language
      let translation = getNestedValue(translations[language], key);
      
      // If not found, try fallback to default language
      if (!translation || translation === key) {
        translation = getNestedValue(translations[defaultLanguage], key);
      }
      
      // If still not found, return the key itself
      if (!translation || translation === key) {
        console.warn(`Translation missing for key: ${key} in language: ${language}`);
        return key;
      }

      // Replace parameters in translation
      if (params) {
        return Object.entries(params).reduce((text, [paramKey, value]) => {
          return text.replace(`{{${paramKey}}}`, String(value));
        }, translation);
      }

      return translation;
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      return key;
    }
  }, [language]);

  // Update document language attribute
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      console.log(`Document language updated to: ${language}`);
    }
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Convenience hook for translation only
export function useTranslation() {
  const { t } = useLanguage();
  return { t };
}