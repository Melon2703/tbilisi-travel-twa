/**
 * Where the traveler's language comes from, and where a deliberate choice goes.
 *
 * Resolution order: explicit URL parameter → stored preference → Telegram client
 * locale → English. A deliberate choice outranks the client locale, and a URL
 * parameter outranks everything, which is what keeps the bot's links authoritative.
 *
 * Reading is pure (`resolveLanguage`) so every step of the fallback can be exercised
 * without a browser; the window-bound helpers only fetch the sources and write back.
 */

import type { Language } from './types';

export const LANGUAGE_STORAGE_KEY = 'tbilisi_language';
export const LANGUAGE_URL_PARAM = 'lang';
export const DEFAULT_LANGUAGE: Language = 'en';

const SUPPORTED_LANGUAGES: Language[] = ['en', 'ru'];

/** A language the app supports, named exactly — anything else is not a choice we can honour. */
export function parseLanguage(value: string | null | undefined): Language | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return SUPPORTED_LANGUAGES.find((lang) => lang === normalized) ?? null;
}

/**
 * A BCP-47-ish client locale (`ru`, `ru-RU`, `en_GB`) reduced to a language we support.
 * An unsupported locale — `de`, `ka` — resolves to nothing and falls through.
 */
export function parseLocale(locale: string | null | undefined): Language | null {
  if (typeof locale !== 'string') return null;
  return parseLanguage(locale.split(/[-_]/)[0]);
}

export interface LanguageSources {
  /** The `lang` URL parameter, if the current URL carries one. */
  url?: string | null;
  /** The traveler's stored preference, if they have ever chosen. */
  stored?: string | null;
  /** The Telegram client's locale, if the app is running inside Telegram. */
  telegramLocale?: string | null;
}

export function resolveLanguage({ url, stored, telegramLocale }: LanguageSources): Language {
  return (
    parseLanguage(url) ?? parseLanguage(stored) ?? parseLocale(telegramLocale) ?? DEFAULT_LANGUAGE
  );
}

export function getStoredLanguage(): Language | null {
  if (typeof window === 'undefined') return null;
  try {
    return parseLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch (error) {
    console.error('Error reading language preference from localStorage:', error);
    return null;
  }
}

export function storeLanguage(language: Language): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Error writing language preference to localStorage:', error);
  }
}

export function readUrlLanguage(): Language | null {
  if (typeof window === 'undefined') return null;
  return parseLanguage(new URLSearchParams(window.location.search).get(LANGUAGE_URL_PARAM));
}

/**
 * Put the choice in the URL so a reload carries it, and so the top of the resolution
 * order agrees with what is on screen. Replaces the current entry rather than pushing
 * a new one: a language switch is not a place the Back button should return to.
 */
export function writeUrlLanguage(language: Language): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (url.searchParams.get(LANGUAGE_URL_PARAM) === language) return;
  url.searchParams.set(LANGUAGE_URL_PARAM, language);
  window.history.replaceState(window.history.state, '', url.toString());
}

export function readTelegramLocale(): string | null {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code ?? null;
}
