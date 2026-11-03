'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Language = 'ta' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (ta: string, en: string) => string;
  isTamil: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ta',
  setLang: () => {},
  toggleLang: () => {},
  t: (ta, en) => ta,
  isTamil: true,
});

const STORAGE_KEY = 'tnpsc_preferred_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('ta');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 1. Check localStorage first
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'ta' || stored === 'en') {
        setLangState(stored);
        return;
      }
    } catch (e) {
      // ignore localStorage errors
    }

    // 2. Fallback to profile preferred_language if available
    async function loadUserPref() {
      try {
        const res = await fetch('/api/learner/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile?.preferred_language === 'ta' || data.profile?.preferred_language === 'en') {
            setLangState(data.profile.preferred_language);
            localStorage.setItem(STORAGE_KEY, data.profile.preferred_language);
          }
        }
      } catch (err) {
        // Silently continue with 'ta' default
      }
    }
    loadUserPref();
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      // Dispatch storage event so tabs/components sync immediately
      window.dispatchEvent(new Event('language-change'));
    } catch (e) {}

    // Save to user profile in background
    fetch('/api/learner/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferred_language: newLang }),
    }).catch(() => {});
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'ta' ? 'en' : 'ta');
  }, [lang, setLang]);

  const t = useCallback(
    (ta: string, en: string) => {
      return lang === 'ta' ? ta : en;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t,
        isTamil: lang === 'ta',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

