import { describe, it, expect } from 'vitest';
import { describeRouteFamily } from '@/lib/utils/family';
import { ROUTES, ROUTE_FAMILIES } from '@/lib/data/routes';
import type { Route, RouteFamily, Stop } from '@/lib/types/route';

const stop = (order: number): Stop => ({
  id: `stop-${order}`,
  order,
  name: `Stop ${order}`,
  neighborhood: 'Sololaki',
  coordinates: { lat: 41.69, lng: 44.79 },
  estimatedMinutes: 15,
  imageUrl: `/images/stop-${order}.jpg`,
  olyaTips: 'Take your time.',
  stopType: 'attraction',
});

const family: RouteFamily = { id: 'heartbeat', name: 'Old Tbilisi Heartbeat' };

const fullVersion: Route = {
  id: 'heartbeat-full',
  title: 'The Ultimate Old Tbilisi Heartbeat',
  subtitle: 'Everything',
  durationCategory: 'half-day',
  accessibility: 'steep-stairs',
  vibes: ['cultural'],
  heroImage: '/images/heartbeat.jpg',
  introCopy: 'Welcome.',
  stops: [stop(1), stop(2), stop(3), stop(4)],
  family: { familyId: 'heartbeat', role: 'full-version' },
};

const variant: Route = {
  ...fullVersion,
  id: 'heartbeat-express',
  title: 'Heartbeat Express',
  stops: [stop(1), stop(2)],
  family: { familyId: 'heartbeat', role: 'variant' },
};

const standalone: Route = {
  ...fullVersion,
  id: 'vera-architecture-walk',
  title: 'Vera Architecture Walk',
  stops: [stop(1), stop(2), stop(3)],
  family: undefined,
};

describe('describeRouteFamily', () => {
  const catalog = [fullVersion, variant, standalone];
  const families = [family];

  it('returns null for a Route that belongs to no Route Family', () => {
    expect(describeRouteFamily(standalone, catalog, families)).toBeNull();
  });

  it('describes a Variant by its Stop count relative to the Full Version', () => {
    expect(describeRouteFamily(variant, catalog, families)).toEqual({
      family,
      role: 'variant',
      stopCount: 2,
      fullVersionStopCount: 4,
    });
  });

  it('describes the Full Version as the complete walk', () => {
    expect(describeRouteFamily(fullVersion, catalog, families)).toEqual({
      family,
      role: 'full-version',
      stopCount: 4,
      fullVersionStopCount: 4,
    });
  });

  it('returns null for a Route whose Route Family has no siblings', () => {
    const lonely = [fullVersion, standalone];
    expect(describeRouteFamily(fullVersion, lonely, families)).toBeNull();
  });

  it('returns null when the named Route Family is unknown', () => {
    expect(describeRouteFamily(variant, catalog, [])).toBeNull();
  });

  it('returns null for a Variant whose Full Version is missing from the catalog', () => {
    const orphaned = [variant, { ...variant, id: 'heartbeat-other' }];
    expect(describeRouteFamily(variant, orphaned, families)).toBeNull();
  });
});

describe('Route Family data (Issue 56)', () => {
  const heartbeat = ROUTES.find((r) => r.id === 'old-tbilisi-heartbeat')!;
  const familyMembers = ROUTES.filter((r) => r.family?.familyId === heartbeat.family?.familyId);

  it('states family membership in the Route data rather than deriving it from ids or titles', () => {
    expect(heartbeat.family).toEqual({
      familyId: expect.any(String),
      role: 'full-version',
    });
    expect(familyMembers.map((r) => r.id).sort()).toEqual([
      'heartbeat-culinary-sunset',
      'heartbeat-express-1-2h',
      'heartbeat-old-kala-moderate',
      'old-tbilisi-heartbeat',
    ]);
  });

  it('names every Route Family referenced by a Route', () => {
    for (const route of ROUTES) {
      if (!route.family) continue;
      expect(ROUTE_FAMILIES.find((f) => f.id === route.family!.familyId)).toBeDefined();
    }
  });

  it('gives each Route Family exactly one Full Version', () => {
    for (const f of ROUTE_FAMILIES) {
      const fullVersions = ROUTES.filter(
        (r) => r.family?.familyId === f.id && r.family.role === 'full-version'
      );
      expect(fullVersions).toHaveLength(1);
    }
  });

  it('builds every Variant from the Full Version Stop pool without duplicating Stop data', () => {
    const poolIds = new Set(heartbeat.stops.map((s) => s.id));
    for (const member of familyMembers) {
      if (member.family?.role !== 'variant') continue;
      expect(member.stops.length).toBeLessThan(heartbeat.stops.length);
      for (const s of member.stops) {
        expect(poolIds.has(s.id)).toBe(true);
      }
    }
  });

  it('leaves Routes outside the family standalone', () => {
    const standaloneRoute = ROUTES.find((r) => r.id === 'vera-architecture-walk')!;
    expect(standaloneRoute.family).toBeUndefined();
    expect(describeRouteFamily(standaloneRoute, ROUTES, ROUTE_FAMILIES)).toBeNull();
  });
});
