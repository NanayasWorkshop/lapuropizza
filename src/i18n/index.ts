import type { Language } from '../types';
import de from './de.json';
import en from './en.json';

type TranslationData = typeof de;

const translations: Record<Language, TranslationData> = { de, en };

class I18n {
  private currentLanguage: Language = 'de';
  private listeners: Set<() => void> = new Set();

  constructor() {
    const saved = localStorage.getItem('language') as Language | null;
    if (saved && (saved === 'de' || saved === 'en')) {
      this.currentLanguage = saved;
    }
    document.documentElement.lang = this.currentLanguage;
  }

  get language(): Language {
    return this.currentLanguage;
  }

  setLanguage(lang: Language): void {
    if (lang !== this.currentLanguage) {
      this.currentLanguage = lang;
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
      this.notifyListeners();
    }
  }

  toggleLanguage(): void {
    this.setLanguage(this.currentLanguage === 'de' ? 'en' : 'de');
  }

  t(key: string): string {
    const keys = key.split('.');
    let result: unknown = translations[this.currentLanguage];

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = (result as Record<string, unknown>)[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof result === 'string' ? result : key;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const i18n = new I18n();
export const t = (key: string): string => i18n.t(key);
