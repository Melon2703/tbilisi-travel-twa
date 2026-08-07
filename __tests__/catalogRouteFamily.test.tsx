import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RouteCatalog from '@/components/RouteCatalog';
import { Route, Stop } from '@/lib/types/route';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import type { Language } from '@/lib/i18n/types';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ back: vi.fn(), push: vi.fn() })),
}));

const stop = (order: number): Stop => ({
  id: `hb-stop-${order}`,
  order,
  name: `Stop ${order}`,
  neighborhood: 'Old Tbilisi',
  coordinates: { lat: 41.69, lng: 44.79 },
  estimatedMinutes: 15,
  imageUrl: `/images/stop-${order}.jpg`,
  olyaTips: 'Take your time.',
  stopType: 'attraction',
});

const pool = [stop(1), stop(2), stop(3), stop(4)];

const fullVersion: Route = {
  id: 'heartbeat-full',
  title: 'The Ultimate Old Tbilisi Heartbeat',
  titleRu: 'Сердце Старого Тбилиси',
  subtitle: 'Every stop in the pool',
  durationCategory: 'half-day',
  accessibility: 'steep-stairs',
  vibes: ['cultural'],
  heroImage: '/images/heartbeat.jpg',
  introCopy: 'Welcome.',
  stops: pool,
  family: { familyId: 'heartbeat', role: 'full-version' },
};

const variant: Route = {
  ...fullVersion,
  id: 'heartbeat-express',
  title: 'Heartbeat Express',
  durationCategory: '1-2h',
  stops: [pool[0], pool[1]],
  family: { familyId: 'heartbeat', role: 'variant' },
};

const standalone: Route = {
  ...fullVersion,
  id: 'vera-walk',
  title: 'Vera Architecture Walk',
  stops: [stop(1), stop(2), stop(3)],
  family: undefined,
};

const ROUTES = [fullVersion, variant, standalone];

const FAMILIES = [
  { id: 'heartbeat', name: 'Old Tbilisi Heartbeat', nameRu: 'Сердце Старого Тбилиси' },
];

const renderCatalog = (language: Language = 'en', routes: Route[] = ROUTES) =>
  render(
    <LanguageProvider initialLanguage={language}>
      <RouteCatalog initialRoutes={routes} families={FAMILIES} />
    </LanguageProvider>
  );

const familyLine = (routeId: string) => screen.queryByTestId(`route-family-${routeId}`);

describe('Route Family line on the catalog card (Issue 56)', () => {
  it('states a Variant’s relationship to the Full Version and its Stop count relative to it', () => {
    renderCatalog();

    const line = familyLine('heartbeat-express');
    expect(line).toBeInTheDocument();
    expect(line?.textContent).toContain('shorter version');
    expect(line?.textContent).toContain('2 of 4 stops');
    expect(line?.textContent).toContain('Old Tbilisi Heartbeat');
  });

  it('identifies the Full Version as the complete walk', () => {
    renderCatalog();

    const line = familyLine('heartbeat-full');
    expect(line).toBeInTheDocument();
    expect(line?.textContent).toContain('complete walk');
    expect(line?.textContent).toContain('Old Tbilisi Heartbeat');
  });

  it('renders no family line on a Route with no siblings', () => {
    renderCatalog();
    expect(familyLine('vera-walk')).not.toBeInTheDocument();
  });

  it('keeps the family line when a filter hides the Full Version from view', () => {
    renderCatalog();

    fireEvent.click(screen.getByTestId('duration-filter-1-2h'));

    expect(familyLine('heartbeat-full')).not.toBeInTheDocument();
    expect(familyLine('heartbeat-express')).toBeInTheDocument();
  });

  it('localizes the family line into Russian', () => {
    renderCatalog('ru');

    const line = familyLine('heartbeat-express');
    expect(line?.textContent).toMatch(/[А-Яа-я]/);
    expect(line?.textContent).toContain('Сердце Старого Тбилиси');
  });

  it('adds no comparison affordance beside the family line', () => {
    renderCatalog();

    expect(screen.queryByTestId('route-family-compare')).not.toBeInTheDocument();
    expect(screen.queryByText(/compare/i)).not.toBeInTheDocument();
  });
});
