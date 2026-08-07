import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RouteCatalog from '@/components/RouteCatalog';
import { ROUTES } from '@/lib/data/routes';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import {
  offeredDurations,
  offeredVibes,
  offeredLogisticsConstraints,
} from '@/lib/engine/catalogFilters';
import { HARD_CHIP, SOFT_CHIP } from '@/components/ui/FilterChipGroup';
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

  it('4. A Logistics Constraint filter is present and narrows the results', () => {
    const catalog = [
      route('flat', '1-2h', 'stroller-friendly', ['cultural']),
      route('cobbles', '1-2h', 'moderate', ['cultural']),
      route('stairs', '1-2h', 'steep-stairs', ['cultural']),
    ];
    renderCatalog(catalog);

    expect(cards()).toHaveLength(3);

    fireEvent.click(screen.getByTestId('logistics-filter-stroller-friendly'));
    expect(cards().map((c) => c.getAttribute('data-testid'))).toEqual(['route-card-flat']);

    fireEvent.click(screen.getByTestId('logistics-filter-moderate'));
    expect(cards().map((c) => c.getAttribute('data-testid'))).toEqual([
      'route-card-flat',
      'route-card-cobbles',
    ]);

    fireEvent.click(screen.getByTestId('logistics-filter-all'));
    expect(cards()).toHaveLength(3);
  });

  it('5. Only Logistics Constraints that genuinely narrow the catalog are offered', () => {
    renderCatalog(ROUTES);

    expect(offeredLogisticsConstraints(ROUTES)).not.toContain('steep-stairs');
    expect(screen.queryByTestId('logistics-filter-steep-stairs')).toBeNull();
  });

  it('6. The Logistics Constraint filter is marked a Hard Constraint, visually distinct from the Soft Constraint filters', () => {
    renderCatalog(ROUTES);

    const hard = screen.getByTestId('logistics-filter-group');
    expect(hard).toHaveAttribute('data-constraint', 'hard');

    for (const testId of ['duration-filter-group', 'vibe-filter-group']) {
      expect(screen.getByTestId(testId)).toHaveAttribute('data-constraint', 'soft');
    }

    // It says outright that it is not a preference.
    expect(within(hard).getByTestId('hard-constraint-note')).toBeInTheDocument();

    // Soft chips are pills; the Hard Constraint chips are shaped differently. The two
    // styles are asserted through the exported constants, so a restyle moves one place.
    expect(HARD_CHIP).not.toEqual(SOFT_CHIP);
    expect(screen.getByTestId('logistics-filter-stroller-friendly').className).toContain(HARD_CHIP);
    expect(screen.getByTestId('duration-filter-1-2h').className).toContain(SOFT_CHIP);
  });

  it('7. Filters combine, and the match count reflects the filtered total', () => {
    const catalog = [
      route('a', '1-2h', 'stroller-friendly', ['cultural']),
      route('b', '1-2h', 'steep-stairs', ['cultural']),
      route('c', 'half-day', 'stroller-friendly', ['cultural']),
      route('d', '1-2h', 'stroller-friendly', ['hiking']),
    ];
    renderCatalog(catalog);

    fireEvent.click(screen.getByTestId('duration-filter-1-2h'));
    fireEvent.click(screen.getByTestId('vibe-filter-cultural'));
    fireEvent.click(screen.getByTestId('logistics-filter-stroller-friendly'));

    expect(cards().map((c) => c.getAttribute('data-testid'))).toEqual(['route-card-a']);
    expect(screen.getByTestId('filter-match-count')).toHaveTextContent('1 / 4');
  });

  it('8. The empty-results state appears and its reset action clears every filter, the Hard Constraint included', () => {
    const catalog = [
      route('a', '1-2h', 'stroller-friendly', ['cultural']),
      route('b', 'half-day', 'steep-stairs', ['hiking']),
    ];
    renderCatalog(catalog);

    fireEvent.click(screen.getByTestId('duration-filter-1-2h'));
    fireEvent.click(screen.getByTestId('vibe-filter-hiking'));
    fireEvent.click(screen.getByTestId('logistics-filter-stroller-friendly'));

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

    const hard = screen.getByTestId('logistics-filter-group');
    expect(hard.textContent).not.toMatch(/logistics[A-Z]|hardConstraintNote|anyLogistics/);
    expect(screen.getByTestId('logistics-filter-stroller-friendly').textContent?.trim()).toBeTruthy();
  });
});
