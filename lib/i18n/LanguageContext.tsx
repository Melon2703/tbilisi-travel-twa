'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Language } from './types';
import { TRANSLATIONS, TranslationKey } from './translations';
import { Route, Stop } from '@/lib/types/route';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  getLocalizedStop: (stop: Stop) => Stop;
  getLocalizedRoute: (route: Route) => Route;
}

function formatTemplate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return Object.entries(params).reduce<string>((acc, [paramKey, val]) => {
    return acc.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
  }, template);
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: (key, params) => formatTemplate(TRANSLATIONS.en[key] || key, params),
  getLocalizedStop: (stop) => stop,
  getLocalizedRoute: (route) => route,
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLanguage?: Language;
}

export function getLocalizedStop(stop: Stop, lang: Language): Stop {
  if (lang === 'ru') {
    return {
      ...stop,
      name: stop.nameRu || stop.name,
      neighborhood: stop.neighborhoodRu || stop.neighborhood,
      olyaTips: stop.olyaTipsRu || stop.olyaTips,
      logisticsWarning: stop.logisticsWarningRu || stop.logisticsWarning,
      photoSpot: stop.photoSpotRu || stop.photoSpot,
      bestTimeOfDay: stop.bestTimeOfDayRu || stop.bestTimeOfDay,
    };
  }
  return stop;
}

export function getLocalizedRoute(route: Route, lang: Language): Route {
  if (lang === 'ru') {
    return {
      ...route,
      title: route.titleRu || route.title,
      subtitle: route.subtitleRu || route.subtitle,
      introCopy: route.introCopyRu || route.introCopy,
      stops: route.stops.map((stop) => getLocalizedStop(stop, 'ru')),
    };
  }
  return route;
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLanguage || 'en');

  useEffect(() => {
    if (initialLanguage) {
      setLanguageState(initialLanguage);
      return;
    }
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang === 'ru' || urlLang === 'en') {
        setLanguageState(urlLang as Language);
        return;
      }
      if (window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code) {
        const tgLang = window.Telegram.WebApp.initDataUnsafe.user.language_code.toLowerCase();
        if (tgLang.startsWith('ru')) {
          setLanguageState('ru');
        }
      }
    }
  }, [initialLanguage]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const template = TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
      return formatTemplate(template, params);
    },
    [language]
  );

  const localizedStop = useCallback(
    (stop: Stop) => getLocalizedStop(stop, language),
    [language]
  );

  const localizedRoute = useCallback(
    (route: Route) => getLocalizedRoute(route, language),
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      getLocalizedStop: localizedStop,
      getLocalizedRoute: localizedRoute,
    }),
    [language, setLanguage, t, localizedStop, localizedRoute]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
