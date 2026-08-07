/**
 * Route Family standing: what a Route card can say about the group it belongs to.
 *
 * Membership is read from the Route's own `family` field — never inferred from id
 * prefixes or title matching — and the Stop counts are read from the Routes
 * themselves, so a Variant that gains or loses Stops needs no bookkeeping here.
 *
 * The family line is a label, not a comparison: it names the group and the Variant's
 * size relative to the Full Version, and nothing about what a traveler gave up
 * (ADR 0005, street-first posture).
 */

import type { Route, RouteFamily, RouteFamilyRole } from '@/lib/types/route';

export interface RouteFamilyStanding {
  family: RouteFamily;
  role: RouteFamilyRole;
  stopCount: number;
  /** The size of the shared Stop pool, which the Full Version holds in full. */
  fullVersionStopCount: number;
}

/**
 * What `route` can say about its Route Family, or null when it has nothing to say:
 * a standalone Route, a family whose name is unknown, a Route that turns out to be
 * the family's only member, or a Variant with no Full Version to measure against.
 */
export function describeRouteFamily(
  route: Route,
  catalog: Route[],
  families: RouteFamily[]
): RouteFamilyStanding | null {
  const membership = route.family;
  if (!membership) return null;

  const family = families.find((f) => f.id === membership.familyId);
  if (!family) return null;

  const members = catalog.filter((r) => r.family?.familyId === membership.familyId);
  if (members.length < 2) return null;

  const fullVersion = members.find((r) => r.family?.role === 'full-version');
  if (!fullVersion) return null;

  return {
    family,
    role: membership.role,
    stopCount: route.stops.length,
    fullVersionStopCount: fullVersion.stops.length,
  };
}
