import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locales } from './locales';

export type Language = 'fa' | 'en';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRtl: boolean;
  dir: 'rtl' | 'ltr';
  locale: Record<string, string>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'tankhor_lang';

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return (saved === 'en' || saved === 'fa') ? saved : 'fa';
    } catch {
      return 'fa';
    }
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch (e) {
      console.warn("Could not save language to localStorage:", e);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    const isFa = lang === 'fa';
    root.setAttribute('dir', isFa ? 'rtl' : 'ltr');
    root.setAttribute('lang', lang);
    root.style.fontFamily = isFa 
      ? '"Vazirmatn", "Inter", system-ui, sans-serif'
      : '"Inter", system-ui, sans-serif';
    document.title = isFa ? "تن‌خور" : "Tankhor";
  }, [lang]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = locales[lang] || locales.fa;
    let text = dict[key] || locales.fa[key] || key;

    if (params) {
      Object.entries(params).forEach(([pKey, pValue]) => {
        text = text.replace(new RegExp(`\\{\\{${pKey}\\}\\}|\\{${pKey}\\}`, 'g'), String(pValue));
      });
    }

    return text;
  };

  const isRtl = lang === 'fa';
  const dir = isRtl ? 'rtl' : 'ltr';
  const locale = locales[lang] || locales.fa;

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRtl, dir, locale }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    const defaultLang: Language = 'fa';
    const dict = locales.fa;
    return {
      lang: defaultLang,
      setLang: () => {},
      t: (key: string, params?: Record<string, string | number>) => {
        let text = dict[key] || key;
        if (params) {
          Object.entries(params).forEach(([pKey, pValue]) => {
            text = text.replace(new RegExp(`\\{\\{${pKey}\\}\\}|\\{${pKey}\\}`, 'g'), String(pValue));
          });
        }
        return text;
      },
      isRtl: true,
      dir: 'rtl',
      locale: dict,
    };
  }
  return context;
};

// Simple Language Switcher Component
export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useTranslation();

  return (
    <div className={`inline-flex items-center bg-neutral-900/80 p-1 rounded-xl border border-neutral-800 text-xs font-bold ${className}`}>
      <button
        type="button"
        onClick={() => setLang('fa')}
        className={`px-2.5 py-1 rounded-lg transition-all ${
          lang === 'fa' 
            ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        فارسی
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 rounded-lg transition-all ${
          lang === 'en' 
            ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        English
      </button>
    </div>
  );
};
