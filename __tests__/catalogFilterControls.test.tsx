import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RouteCatalog from '@/components/RouteCatalog';
import { ROUTES } from '@/lib/data/routes';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { offeredDurations, offeredVibes } from '@/lib/engine/catalogFilters';
import type { Route, Stop, DurationCategory, VibeCategory, LogisticsConstraint } from '@/lib/types/route';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ back: vi.fn(), push: vi.fn() })),
}));

const stop: Stop = {
  id: 'stop-1',
  order: 1,
  name: 'Stop One',
  neighborhood: 'Sololaki',
  coordinates: { lat: 41.69, lng: 44.79 },
  estimatedMinutes: 15,
  imageUrl: '/images/stop-1.jpg',
  olyaTips: 'Look up.',
  stopType: 'attraction',
};

function route(
  id: string,
  durationCategory: DurationCategory,
  accessibility: LogisticsConstraint,
  vibes: VibeCategory[]
): Route {
  return {
    id,
    title: `Route ${id}`,
    subtitle: 'A walk',
    durationCategory,
    accessibility,
    vibes,
    heroImage: '/images/hero.jpg',
    introCopy: 'Welcome.',
    stops: [stop],
  };
}

function renderCatalog(routes: Route[]) {
  return render(
    <LanguageProvider initialLanguage="en">
      <RouteCatalog initialRoutes={routes} families={[]} />
    </LanguageProvider>
  );
}

const cards = () => screen.queryAllByTestId(/^route-card-/);

describe('Catalog filter controls tell the truth', () => {
  it('1. Every duration option offered returns at least one Route', () => {
    renderCatalog(ROUTES);

    const offered = offeredDurations(ROUTES);
    expect(offered.length).toBeGreaterThan(0);

    for (const duration of offered) {
      fireEvent.click(screen.getByTestId(`duration-filter-${duration}`));
      expect(cards().length).toBeGreaterThan(0);
    }
  });

  it('2. A duration no Route carries is not offered as a chip', () => {
    renderCatalog([route('a', '1-2h', 'moderate', ['cultural'])]);

    expect(screen.getByTestId('duration-filter-1-2h')).toBeInTheDocument();
    expect(screen.queryByTestId('duration-filter-full-day')).toBeNull();
    expect(screen.queryByTestId('duration-filter-half-day')).toBeNull();
  });

  it('3. The Vibe matching nearly every Route is removed from the filter controls', () => {
    renderCatalog(ROUTES);

    expect(offeredVibes(ROUTES)).not.toContain('photo-spots');
    expect(screen.queryByTestId('vibe-filter-photo-spots')).toBeNull();

    // ...while the selective Vibes are still offered.
    for (const vibe of offeredVibes(ROUTES)) {
      expect(screen.getByTestId(`vibe-filter-${vibe}`)).toBeInTheDocument();
    }
  });

  it('4. The panel offers no terrain filter at all', () => {
    const catalog = [
      route('flat', '1-2h', 'stroller-friendly', ['cultural']),
      route('cobbles', '1-2h', 'moderate', ['cultural']),
      route('stairs', '1-2h', 'steep-stairs', ['cultural']),
    ];
    renderCatalog(catalog);

    expect(screen.queryByTestId('logistics-filter-group')).toBeNull();
    expect(screen.queryByTestId('hard-constraint-note')).toBeNull();
    for (const constraint of ['stroller-friendly', 'moderate', 'steep-stairs', 'all']) {
      expect(screen.queryByTestId(`logistics-filter-${constraint}`)).toBeNull();
    }
  });

  it('5. No terrain constraint narrows the catalog — every accessibility level stays on screen', () => {
    const catalog = [
      route('flat', '1-2h', 'stroller-friendly', ['cultural']),
      route('cobbles', '1-2h', 'moderate', ['cultural']),
      route('stairs', '1-2h', 'steep-stairs', ['cultural']),
      route('elsewhere', 'half-day', 'moderate', ['hiking']),
    ];
    renderCatalog(catalog);

    expect(cards()).toHaveLength(4);

    fireEvent.click(screen.getByTestId('duration-filter-1-2h'));
    fireEvent.click(screen.getByTestId('vibe-filter-cultural'));

    // Every accessibility level survives the tightest the panel can be set.
    expect(cards().map((c) => c.getAttribute('data-testid'))).toEqual([
      'route-card-flat',
      'route-card-cobbles',
      'route-card-stairs',
    ]);
  });

  it('6. The surviving filter groups are the Soft Constraints, in panel order', () => {
    renderCatalog(ROUTES);

    const groups = screen
      .getAllByTestId(/-filter-group$/)
      .map((g) => g.getAttribute('data-testid'));

    expect(groups).toEqual(['duration-filter-group', 'vibe-filter-group']);
  });

  it('7. Filters combine, and the match count reflects the filtered total', () => {
    const catalog = [
      route('a', '1-2h', 'stroller-friendly', ['cultural']),
      route('b', '1-2h', 'steep-stairs', ['hiking']),
      route('c', 'half-day', 'stroller-friendly', ['cultural']),
      route('d', '1-2h', 'stroller-friendly', ['hiking']),
    ];
    renderCatalog(catalog);

    fireEvent.click(screen.getByTestId('duration-filter-1-2h'));
    fireEvent.click(screen.getByTestId('vibe-filter-cultural'));

    expect(cards().map((c) => c.getAttribute('data-testid'))).toEqual(['route-card-a']);
    expect(screen.getByTestId('filter-match-count')).toHaveTextContent('1 / 4');
  });

  it('8. The empty-results state appears and its reset action clears every filter', () => {
    const catalog = [
      route('a', '1-2h', 'stroller-friendly', ['cultural']),
      route('b', 'half-day', 'steep-stairs', ['hiking']),
    ];
    renderCatalog(catalog);

    fireEvent.click(screen.getByTestId('duration-filter-1-2h'));
    fireEvent.click(screen.getByTestId('vibe-filter-hiking'));

    expect(cards()).toHaveLength(0);
    expect(screen.getByText('No matching routes found')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('reset-filters'));

    expect(cards()).toHaveLength(2);
    expect(screen.queryByTestId('filter-match-count')).toBeNull();
  });

  it('9. Renders in Russian without leaking raw translation keys', () => {
    render(
      <LanguageProvider initialLanguage="ru">
        <RouteCatalog initialRoutes={ROUTES} families={[]} />
      </LanguageProvider>
    );

    const panel = screen.getByTestId('filter-controls-panel');
    expect(panel.textContent).not.toMatch(/allDurations|allVibes|useMyLocation/);
    expect(screen.getByTestId('duration-filter-all').textContent?.trim()).toBeTruthy();
  });
});
