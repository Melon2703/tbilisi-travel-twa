import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Home from '@/app/page';
import RouteIntroCard from '@/components/RouteIntroCard';
import { LanguageProvider, useLanguage } from '@/lib/i18n/LanguageContext';
import {
  LANGUAGE_STORAGE_KEY,
  LANGUAGE_URL_PARAM,
  getStoredLanguage,
  resolveLanguage,
  storeLanguage,
} from '@/lib/i18n/languagePreference';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { ROUTES } from '@/lib/data/routes';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ back: vi.fn(), push: vi.fn() })),
  notFound: vi.fn(),
}));

function setTelegramLocale(locale: string | null) {
  if (locale === null) {
    delete (window as unknown as { Telegram?: unknown }).Telegram;
    return;
  }
  (window as unknown as { Telegram: unknown }).Telegram = {
    WebApp: { initDataUnsafe: { user: { language_code: locale } } },
  };
}

function setUrl(search: string) {
  window.history.replaceState({}, '', `/${search}`);
}

/** Shows the resolved language and lets a test change it, the way a toggle would. */
function LanguageProbe() {
  const { language, setLanguage } = useLanguage();
  return (
    <div>
      <span data-testid="resolved-language">{language}</span>
      <button type="button" onClick={() => setLanguage('ru')}>
        to ru
      </button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  setUrl('');
  setTelegramLocale(null);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Language resolution order', () => {
  it('lets an explicit URL parameter win over a stored preference and the Telegram locale', () => {
    expect(resolveLanguage({ url: 'en', stored: 'ru', telegramLocale: 'ru-RU' })).toBe('en');
  });

  it('lets a stored preference win over the Telegram locale', () => {
    expect(resolveLanguage({ url: null, stored: 'ru', telegramLocale: 'en-US' })).toBe('ru');
  });

  it('falls back to the Telegram locale when nothing is stored', () => {
    expect(resolveLanguage({ url: null, stored: null, telegramLocale: 'ru-RU' })).toBe('ru');
  });

  it('falls back to English for a Telegram locale the app does not support', () => {
    expect(resolveLanguage({ url: null, stored: null, telegramLocale: 'de' })).toBe('en');
  });

  it('falls through an unsupported URL parameter to the stored preference', () => {
    expect(resolveLanguage({ url: 'ka', stored: 'ru', telegramLocale: null })).toBe('ru');
  });

  it('falls back to English when no source names a language', () => {
    expect(resolveLanguage({ url: null, stored: null, telegramLocale: null })).toBe('en');
  });
});

describe('Changing language', () => {
  it('writes the URL parameter without adding a history entry', () => {
    const replaceState = vi.spyOn(window.history, 'replaceState');
    const pushState = vi.spyOn(window.history, 'pushState');

    render(
      <LanguageProvider>
        <LanguageProbe />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'to ru' }));

    expect(replaceState).toHaveBeenCalled();
    expect(pushState).not.toHaveBeenCalled();
    expect(new URLSearchParams(window.location.search).get(LANGUAGE_URL_PARAM)).toBe('ru');
  });

  it('writes a stored preference', () => {
    render(
      <LanguageProvider>
        <LanguageProbe />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'to ru' }));

    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ru');
    expect(getStoredLanguage()).toBe('ru');
  });

  it('keeps the chosen language across a reload', () => {
    const { unmount } = render(
      <LanguageProvider>
        <LanguageProbe />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'to ru' }));
    unmount();

    // A reload: same URL, same storage, a fresh provider.
    render(
      <LanguageProvider>
        <LanguageProbe />
      </LanguageProvider>
    );

    expect(screen.getByTestId('resolved-language')).toHaveTextContent('ru');
  });
});

describe('Cold start', () => {
  it('opens in the stored preference, overriding the Telegram locale', () => {
    storeLanguage('ru');
    setTelegramLocale('en-US');

    render(
      <LanguageProvider>
        <LanguageProbe />
      </LanguageProvider>
    );

    expect(screen.getByTestId('resolved-language')).toHaveTextContent('ru');
  });

  it('opens in the Telegram client locale when the traveler has never chosen', () => {
    setTelegramLocale('ru-RU');

    render(
      <LanguageProvider>
        <LanguageProbe />
      </LanguageProvider>
    );

    expect(screen.getByTestId('resolved-language')).toHaveTextContent('ru');
  });

  it('opens in English for a Telegram client locale the app does not support', () => {
    setTelegramLocale('ka-GE');

    render(
      <LanguageProvider>
        <LanguageProbe />
      </LanguageProvider>
    );

    expect(screen.getByTestId('resolved-language')).toHaveTextContent('en');
  });

  it('opens in the language a bot link carries, overriding the stored preference', () => {
    storeLanguage('en');
    setUrl('?lang=ru');

    render(
      <LanguageProvider>
        <LanguageProbe />
      </LanguageProvider>
    );

    expect(screen.getByTestId('resolved-language')).toHaveTextContent('ru');
  });
});

describe('The catalog', () => {
  it('offers a language toggle that switches the catalog into Russian', async () => {
    render(await Home({}));

    fireEvent.click(screen.getByLabelText('Переключить на русский'));

    expect(screen.getByText(TRANSLATIONS.ru.catalogTitle)).toBeInTheDocument();
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ru');
  });

  it('opens in the stored preference on a cold start', async () => {
    storeLanguage('ru');

    render(await Home({}));

    expect(screen.getByText(TRANSLATIONS.ru.catalogTitle)).toBeInTheDocument();
  });

  it('renders in the language a link carries, before any browser resolution', async () => {
    render(await Home({ searchParams: Promise.resolve({ lang: 'ru' }) }));

    expect(screen.getByText(TRANSLATIONS.ru.catalogTitle)).toBeInTheDocument();
  });

  it('introduces no share affordance', async () => {
    render(await Home({}));

    expect(screen.queryByText(/share|поделиться/i)).toBeNull();
  });
});

describe('The Route Intro Card', () => {
  it('keeps its own language toggle and introduces no share affordance', () => {
    render(
      <LanguageProvider>
        <RouteIntroCard route={ROUTES[0]} showStartButton={true} />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByLabelText('Переключить на русский'));

    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ru');
    expect(screen.queryByText(/share|поделиться/i)).toBeNull();
  });
});
