'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Language } from './types';
import {
  DEFAULT_LANGUAGE,
  getStoredLanguage,
  readTelegramLocale,
  readUrlLanguage,
  resolveLanguage,
  storeLanguage,
  writeUrlLanguage,
} from './languagePreference';
import { TRANSLATIONS, TranslationKey } from './translations';
import { Route, RouteFamily, Stop } from '@/lib/types/route';

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
  /** The `lang` URL parameter as the server read it, or null when the URL names none. */
  initialLanguage?: Language | null;
}

export function getLocalizedStop(stop: Stop, lang: Language): Stop {
  if (lang === 'ru') {
    const localized: Stop = {
      ...stop,
      name: stop.nameRu || stop.name,
      neighborhood: stop.neighborhoodRu || stop.neighborhood,
      historicalSummary: stop.historicalSummaryRu || stop.historicalSummary,
      funFact: stop.funFactRu || stop.funFact,
      workingHours: stop.workingHoursRu || stop.workingHours,
      olyaTips: stop.olyaTipsRu || stop.olyaTips,
      stopDirective: stop.stopDirectiveRu || stop.stopDirective,
      logisticsWarning: stop.logisticsWarningRu || stop.logisticsWarning,
      photoSpot: stop.photoSpotRu || stop.photoSpot,
      bestTimeOfDay: stop.bestTimeOfDayRu || stop.bestTimeOfDay,
    };
    if (stop.stopType === 'attraction' && stop.transitBadgeRu) {
      (localized as any).transitBadge = stop.transitBadgeRu;
    }
    if (stop.stopType === 'venue' && stop.venueDetails) {
      (localized as any).venueDetails = {
        ...stop.venueDetails,
        bookingAdvice: stop.venueDetails.bookingAdviceRu || stop.venueDetails.bookingAdvice,
      };
    }
    return localized;
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

export function getLocalizedFamilyName(family: RouteFamily, lang: Language): string {
  return lang === 'ru' ? family.nameRu || family.name : family.name;
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLanguage || DEFAULT_LANGUAGE);

  /*
    `initialLanguage` is the URL parameter as the server already read it — the top of
    the resolution order, so there is nothing left to resolve. Without one, the rest of
    the order is only knowable in the browser: storage and the Telegram client locale.
  */
  useEffect(() => {
    if (initialLanguage) {
      setLanguageState(initialLanguage);
      return;
    }
    setLanguageState(
      resolveLanguage({
        url: readUrlLanguage(),
        stored: getStoredLanguage(),
        telegramLocale: readTelegramLocale(),
      })
    );
  }, [initialLanguage]);

  /*
    A deliberate choice is written to both places it has to survive: the URL, so a
    reload and any link carried out of the client keep it, and storage, so a cold start
    with no parameter opens in it rather than back in the Telegram client's locale.
  */
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    storeLanguage(lang);
    writeUrlLanguage(lang);
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
