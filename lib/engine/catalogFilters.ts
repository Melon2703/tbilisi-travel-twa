import { Route, DurationCategory, VibeCategory } from '../types/route';

/**
 * The absence of a constraint on one axis. Not a filter value the traveler picks
 * against the data — the axis is simply not asked about.
 */
export const NO_CONSTRAINT = 'all' as const;
export type NoConstraint = typeof NO_CONSTRAINT;

/**
 * Soft Constraints only. The catalog asks no Hard Constraint of its own: a Logistics
 * Constraint is still asked for in the bot conversation and still enforced by the
 * matching engine, but browsing the catalog is never narrowed by terrain.
 */
export interface CatalogFilters {
  duration: DurationCategory | NoConstraint;
  vibe: VibeCategory | NoConstraint;
}

export const NO_FILTERS: CatalogFilters = {
  duration: NO_CONSTRAINT,
  vibe: NO_CONSTRAINT,
};

/** Canonical shortest-first order. Offering order never depends on catalog order. */
const DURATION_ORDER: DurationCategory[] = ['1-2h', '3-4h', 'half-day', 'full-day'];

const VIBE_ORDER: VibeCategory[] = [
  'insta-locations',
  'cultural',
  'hiking',
  'food-wine',
  'courtyards',
  'photo-spots',
  'architecture',
];

/**
 * A Vibe carried by this share of the catalog or more is descriptive, not selective —
 * tapping it would leave the traveler roughly where they started. It stays on the Route
 * as an attribute; it just is not worth a chip. See ADR 0008.
 */
const VIBE_SELECTIVITY_CEILING = 0.8;

/**
 * Every option the catalog offers must do something: return at least one Route, and
 * exclude at least one. An option that returns nothing is a dead end; an option that
 * returns everything is a lie about being a filter (ADR 0008). These two functions are
 * the only source of offered options, so a chip cannot drift out of step with the data.
 */
export function offeredDurations(routes: Route[]): DurationCategory[] {
  return DURATION_ORDER.filter((duration) =>
    routes.some((route) => route.durationCategory === duration)
  );
}

export function offeredVibes(routes: Route[]): VibeCategory[] {
  return VIBE_ORDER.filter((vibe) => {
    const matched = routes.filter((route) => route.vibes.includes(vibe)).length;
    if (matched === 0) return false;
    return matched / routes.length < VIBE_SELECTIVITY_CEILING;
  });
}

/**
 * Narrows the catalog on both Soft Constraint axes at once. A Route's accessibility is
 * never consulted here — it stays on the card as a stated fact about the walk.
 */
export function filterRoutes(routes: Route[], filters: CatalogFilters): Route[] {
  return routes.filter((route) => {
    if (filters.duration !== NO_CONSTRAINT && route.durationCategory !== filters.duration) {
      return false;
    }
    if (filters.vibe !== NO_CONSTRAINT && !route.vibes.includes(filters.vibe)) {
      return false;
    }
    return true;
  });
}
