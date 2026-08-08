import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RoutePage from '../app/twa/[routeId]/page';
import RouteIntroCard from '../components/RouteIntroCard';
import StopCard from '../components/StopCard';
import { LanguageProvider, getLocalizedRoute, getLocalizedStop } from '../lib/i18n/LanguageContext';
import { TRANSLATIONS } from '../lib/i18n/translations';
import { EMOJI } from './support/emojiPattern';
import { ROUTES } from '../lib/data/routes';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  useRouter: vi.fn(() => ({
    back: vi.fn(),
    push: vi.fn(),
  })),
}));

/**
 * Translators handle words, never pictures: a glyph is chosen at the render site from
 * the icon vocabulary, so no string carries one through i18n in either language.
 */
describe('Translated copy is plain text', () => {
  it.each(['en', 'ru'] as const)('carries no emoji character in any %s value', (language) => {
    const offenders = Object.entries(TRANSLATIONS[language])
      .filter(([, value]) => EMOJI.test(value))
      .map(([key, value]) => `${key}: ${value}`);

    expect(offenders).toEqual([]);
  });
});

describe('TWA Internationalization (Russian Support)', () => {
  const sampleRoute = ROUTES[0]; // 'old-tbilisi-heartbeat'

  it('localizes route title, subtitle, and intro copy when language is Russian', () => {
    const localized = getLocalizedRoute(sampleRoute, 'ru');
    expect(localized.title).toBe('Сердце Старого Тбилиси: Главный маршрут');
    expect(localized.subtitle).toBe('От Площади Свободы до фуникулёра Мтацминда — 19 отобранных остановок по Старому Тбилиси');
    expect(localized.introCopy).toContain('Привет! Готовы исследовать легендарный центр Тбилиси?');
  });

  it('localizes stop names, neighborhood, tips, photo spots, and logistics warnings in Russian', () => {
    const stop4 = sampleRoute.stops[3]; // Gabriadze
    const localizedStop = getLocalizedStop(stop4, 'ru');
    expect(localizedStop.name).toBe('Театр кукол Габриадзе и Часы');
    expect(localizedStop.neighborhood).toBe('Старая Кала');
    expect(localizedStop.olyaTips).toContain('Будьте здесь к 11:50!');
    expect(localizedStop.photoSpot).toContain('Встаньте на брусчатку');
    expect(localizedStop.logisticsWarning).toContain('Ровное покрытие на ул. Шавтели');
  });

  it('renders RouteIntroCard with Russian UI elements when wrapped in LanguageProvider with initialLanguage=ru', () => {
    const localizedRoute = getLocalizedRoute(sampleRoute, 'ru');
    render(
      <LanguageProvider initialLanguage="ru">
        <RouteIntroCard route={localizedRoute} showStartButton={true} />
      </LanguageProvider>
    );

    expect(screen.getByRole('heading', { name: 'Сердце Старого Тбилиси: Главный маршрут' })).toBeInTheDocument();
    expect(screen.getByText('НАЧАТЬ МАРШРУТ')).toBeInTheDocument();
    expect(screen.getByText('Приветствие от Оли')).toBeInTheDocument();
    expect(screen.getByText('Маршрут в деталях')).toBeInTheDocument();
    expect(screen.getByText('Рельеф и логистика')).toBeInTheDocument();
  });

  it('renders StopCard with Russian headers and labels', () => {
    const stop = sampleRoute.stops[3];
    const localizedStop = getLocalizedStop(stop, 'ru');
    render(
      <LanguageProvider initialLanguage="ru">
        <StopCard stop={localizedStop} totalStops={19} isVisited={true} />
      </LanguageProvider>
    );

    expect(screen.getByText('ОСТАНОВКА 4 ИЗ 19')).toBeInTheDocument();
    expect(screen.getByText('Посещено')).toBeInTheDocument();
    expect(screen.getByText('Совет от Оли')).toBeInTheDocument();
    expect(screen.getByText('Лучшее место для фото')).toBeInTheDocument();
    expect(screen.getByText('Предупреждение о рельефе')).toBeInTheDocument();
  });

  it('switches TWA language dynamically when clicking top RU / EN toggle buttons', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <RouteIntroCard route={sampleRoute} showStartButton={true} />
      </LanguageProvider>
    );

    expect(screen.getByText(/Start Route/i)).toBeInTheDocument();

    const ruButton = screen.getByLabelText('Переключить на русский');
    fireEvent.click(ruButton);

    expect(screen.getByText('НАЧАТЬ МАРШРУТ')).toBeInTheDocument();

    const enButton = screen.getByLabelText('Switch to English');
    fireEvent.click(enButton);

    expect(screen.getByText(/Start Route/i)).toBeInTheDocument();
  });

  it('renders RoutePage with searchParams lang=ru in Russian', async () => {
    const pageComponent = await RoutePage({
      params: Promise.resolve({ routeId: 'old-tbilisi-heartbeat' }),
      searchParams: Promise.resolve({ lang: 'ru' }),
    });

    render(pageComponent);

    expect(screen.getByRole('heading', { name: 'Сердце Старого Тбилиси: Главный маршрут' })).toBeInTheDocument();
  });
});


