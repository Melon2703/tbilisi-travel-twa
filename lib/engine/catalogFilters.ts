import {
  Route,
  DurationCategory,
  VibeCategory,
  LogisticsConstraint,
} from '../types/route';
import { isAccessibilitySatisfied } from './matcher';

/**
 * The absence of a constraint on one axis. Not a filter value the traveler picks
 * against the data — the axis is simply not asked about.
 */
export const NO_CONSTRAINT = 'all' as const;
export type NoConstraint = typeof NO_CONSTRAINT;

export interface CatalogFilters {
  /** Soft Constraint. */
  duration: DurationCategory | NoConstraint;
  /** Soft Constraint. */
  vibe: VibeCategory | NoConstraint;
  /** Hard Constraint — never relaxed, here or in the matching engine. */
  logistics: LogisticsConstraint | NoConstraint;
}

export const NO_FILTERS: CatalogFilters = {
  duration: NO_CONSTRAINT,
  vibe: NO_CONSTRAINT,
  logistics: NO_CONSTRAINT,
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

/** Strictest first: the option that disqualifies the most Routes leads. */
const LOGISTICS_ORDER: LogisticsConstraint[] = [
  'stroller-friendly',
  'moderate',
  'steep-stairs',
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
 * returns everything is a lie about being a filter (ADR 0008). These three functions are
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
 * Logistics Constraints worth offering. The loosest one admits every Route by
 * definition, so it is indistinguishable from asking for nothing and is not offered.
 */
export function offeredLogisticsConstraints(routes: Route[]): LogisticsConstraint[] {
  return LOGISTICS_ORDER.filter((constraint) => {
    const matched = routes.filter((route) =>
      isAccessibilitySatisfied(route.accessibility, constraint)
    ).length;
    return matched > 0 && matched < routes.length;
  });
}

/**
 * Narrows the catalog on all three axes at once. The Logistics Constraint is applied with
 * the same Hard Constraint rule the matching engine uses — a traveler who asks for
 * stroller-friendly is never shown steep stairs, whatever the other two axes say.
 */
export function filterRoutes(routes: Route[], filters: CatalogFilters): Route[] {
  return routes.filter((route) => {
    if (filters.duration !== NO_CONSTRAINT && route.durationCategory !== filters.duration) {
      return false;
    }
    if (filters.vibe !== NO_CONSTRAINT && !route.vibes.includes(filters.vibe)) {
      return false;
    }
    if (
      filters.logistics !== NO_CONSTRAINT &&
      !isAccessibilitySatisfied(route.accessibility, filters.logistics)
    ) {
      return false;
    }
    return true;
  });
}
