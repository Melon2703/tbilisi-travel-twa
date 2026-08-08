import { describe, it, expect } from 'vitest';
import {
  offeredDurations,
  offeredVibes,
  filterRoutes,
  NO_CONSTRAINT,
} from '@/lib/engine/catalogFilters';
import { ROUTES } from '@/lib/data/routes';
import type { Route, DurationCategory, VibeCategory, LogisticsConstraint } from '@/lib/types/route';

function route(
  id: string,
  durationCategory: DurationCategory,
  accessibility: LogisticsConstraint,
  vibes: VibeCategory[]
): Route {
  return {
    id,
    title: id,
    subtitle: id,
    durationCategory,
    accessibility,
    vibes,
    heroImage: '/x.jpg',
    introCopy: '',
    stops: [],
  };
}

describe('offeredDurations', () => {
  it('offers only durations that at least one Route actually carries', () => {
    const catalog = [
      route('a', '1-2h', 'moderate', ['cultural']),
      route('b', 'half-day', 'moderate', ['cultural']),
    ];

    expect(offeredDurations(catalog)).toEqual(['1-2h', 'half-day']);
  });

  it('offers no empty duration over the real catalog', () => {
    for (const duration of offeredDurations(ROUTES)) {
      expect(
        ROUTES.filter((r) => r.durationCategory === duration).length
      ).toBeGreaterThan(0);
    }
  });

  it('keeps the canonical shortest-first order regardless of catalog order', () => {
    const catalog = [
      route('a', 'full-day', 'moderate', []),
      route('b', '1-2h', 'moderate', []),
      route('c', '3-4h', 'moderate', []),
    ];

    expect(offeredDurations(catalog)).toEqual(['1-2h', '3-4h', 'full-day']);
  });
});

describe('offeredVibes', () => {
  it('drops a Vibe carried by nearly every Route — it narrows nothing', () => {
    const catalog = [
      route('a', '1-2h', 'moderate', ['photo-spots', 'cultural']),
      route('b', '1-2h', 'moderate', ['photo-spots', 'cultural']),
      route('c', '1-2h', 'moderate', ['photo-spots', 'cultural']),
      route('d', '1-2h', 'moderate', ['photo-spots', 'hiking']),
      route('e', '1-2h', 'moderate', ['hiking']),
    ];

    // photo-spots: 4/5 = 80%+ of the catalog. cultural: 3/5. hiking: 2/5.
    expect(offeredVibes(catalog)).not.toContain('photo-spots');
    expect(offeredVibes(catalog)).toEqual(expect.arrayContaining(['cultural', 'hiking']));
  });

  it('drops a Vibe no Route carries', () => {
    const catalog = [route('a', '1-2h', 'moderate', ['cultural'])];

    expect(offeredVibes(catalog)).not.toContain('food-wine');
  });

  it('every offered Vibe narrows the real catalog to a strict, non-empty subset', () => {
    for (const vibe of offeredVibes(ROUTES)) {
      const matched = ROUTES.filter((r) => r.vibes.includes(vibe));
      expect(matched.length).toBeGreaterThan(0);
      expect(matched.length).toBeLessThan(ROUTES.length);
    }
  });

  it('leaves the dropped Vibe on the Route as a descriptive attribute', () => {
    expect(offeredVibes(ROUTES)).not.toContain('photo-spots');
    expect(ROUTES.some((r) => r.vibes.includes('photo-spots'))).toBe(true);
  });
});

describe('filterRoutes', () => {
  const catalog = [
    route('easy-short', '1-2h', 'stroller-friendly', ['cultural']),
    route('easy-long', 'half-day', 'stroller-friendly', ['food-wine']),
    route('rough-short', '1-2h', 'steep-stairs', ['cultural']),
    route('mid-short', '1-2h', 'moderate', ['cultural']),
  ];

  it('returns the whole catalog when nothing is constrained', () => {
    expect(
      filterRoutes(catalog, {
        duration: NO_CONSTRAINT,
        vibe: NO_CONSTRAINT,
      })
    ).toHaveLength(4);
  });

  it('narrows by duration', () => {
    const ids = filterRoutes(catalog, {
      duration: 'half-day',
      vibe: NO_CONSTRAINT,
    }).map((r) => r.id);

    expect(ids).toEqual(['easy-long']);
  });

  it('narrows by Vibe', () => {
    const ids = filterRoutes(catalog, {
      duration: NO_CONSTRAINT,
      vibe: 'food-wine',
    }).map((r) => r.id);

    expect(ids).toEqual(['easy-long']);
  });

  it('never narrows on terrain — steep stairs survive the tightest filter pair', () => {
    const ids = filterRoutes(catalog, {
      duration: '1-2h',
      vibe: 'cultural',
    }).map((r) => r.id);

    expect(ids).toEqual(['easy-short', 'rough-short', 'mid-short']);
  });

  it('combines both constraints', () => {
    const ids = filterRoutes(catalog, {
      duration: 'half-day',
      vibe: 'food-wine',
    }).map((r) => r.id);

    expect(ids).toEqual(['easy-long']);
  });

  it('can combine into an empty result', () => {
    expect(
      filterRoutes(catalog, {
        duration: 'half-day',
        vibe: 'cultural',
      })
    ).toEqual([]);
  });

  it('leaves the input catalog untouched', () => {
    const before = [...catalog];
    filterRoutes(catalog, { duration: '1-2h', vibe: NO_CONSTRAINT });
    expect(catalog).toEqual(before);
  });
});
