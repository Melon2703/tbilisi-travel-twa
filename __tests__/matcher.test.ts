import { describe, it, expect } from 'vitest';
import { matchRoute } from '../lib/engine/matcher';
import { ROUTES, getRouteById, getAllRoutes } from '../lib/data/routes';
import { Route, MatchCriteria } from '../lib/types/route';

const MOCK_ROUTES: Route[] = [
  {
    id: 'sololaki-courtyards',
    title: 'Sololaki Secret Courtyards',
    subtitle: 'Stained glass, carved balconies, and hidden residential gems',
    durationCategory: '1-2h',
    accessibility: 'stroller-friendly',
    vibes: ['courtyards', 'photo-spots'],
    heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f',
    introCopy: 'Discover hidden 19th-century Italianate courtyards of Sololaki.',
    stops: [
      {
        id: 'stop-1',
        order: 1,
        name: 'Machabeli St Balcony House',
        neighborhood: 'Sololaki',
        coordinates: { lat: 41.6912, lng: 44.7981 },
        estimatedMinutes: 20,
        imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f',
        olyaTips: 'Look up at the stained glass in the entryway before taking photos.',
      },
    ],
  },
  {
    id: 'old-tbilisi-steep',
    title: 'Old Town & Narikala Ridge Walk',
    subtitle: 'Panoramic views and ancient fortress walls',
    durationCategory: '2-4h',
    accessibility: 'steep-stairs',
    vibes: ['photo-spots', 'architecture'],
    heroImage: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c',
    introCopy: 'Climb the historic cobblestone hills of Old Kala.',
    stops: [
      {
        id: 'stop-2',
        order: 1,
        name: 'Narikala Fortress Steps',
        neighborhood: 'Old Kala',
        coordinates: { lat: 41.6881, lng: 44.8085 },
        estimatedMinutes: 45,
        imageUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c',
        olyaTips: 'Wear sturdy shoes! The stone steps are steep.',
        logisticsWarning: '30° steep incline with uneven stone staircases.',
      },
    ],
  },
  {
    id: 'chugureti-food-wine',
    title: 'Fabrika & Chugureti Culinary Stroll',
    subtitle: 'Polyphonic dining and natural wine bars',
    durationCategory: '2-4h',
    accessibility: 'moderate',
    vibes: ['food-wine', 'courtyards'],
    heroImage: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
    introCopy: 'Taste natural Georgian wines and modern cuisine.',
    stops: [
      {
        id: 'stop-3',
        order: 1,
        name: 'Agmashenebeli Wine Cellar',
        neighborhood: 'Chugureti',
        coordinates: { lat: 41.7082, lng: 44.8021 },
        estimatedMinutes: 30,
        imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
        olyaTips: 'Ask for the Qvevri Amber wine paired with local cheeses.',
      },
    ],
  },
];

describe('matchRoute matcher engine', () => {
  it('returns exact match when duration, accessibility, and vibe align', () => {
    const criteria: MatchCriteria = {
      durationCategory: '1-2h',
      accessibility: 'stroller-friendly',
      vibe: 'courtyards',
    };

    const result = matchRoute(MOCK_ROUTES, criteria);

    expect(result).not.toBeNull();
    expect(result?.route.id).toBe('sololaki-courtyards');
    expect(result?.relaxed).toBe(false);
    expect(result?.explanationNote).toBeUndefined();
  });

  it('strictly enforces hard accessibility constraint and excludes inaccessible routes', () => {
    const criteria: MatchCriteria = {
      durationCategory: '2-4h',
      accessibility: 'stroller-friendly',
      vibe: 'photo-spots',
    };

    const result = matchRoute(MOCK_ROUTES, criteria);

    expect(result).not.toBeNull();
    expect(result?.route.id).toBe('sololaki-courtyards');
    expect(result?.route.accessibility).toBe('stroller-friendly');
    expect(result?.relaxed).toBe(true);
    expect(result?.explanationNote).toBeDefined();
    expect(result?.explanationNote).toContain('stroller');
  });

  it('relaxes soft constraints (duration/vibe) while maintaining hard accessibility constraint', () => {
    const criteria: MatchCriteria = {
      durationCategory: 'half-day',
      accessibility: 'stroller-friendly',
      vibe: 'food-wine',
    };

    const result = matchRoute(MOCK_ROUTES, criteria);

    expect(result).not.toBeNull();
    expect(result?.route.accessibility).toBe('stroller-friendly');
    expect(result?.relaxed).toBe(true);
    expect(typeof result?.explanationNote).toBe('string');
  });

  it('returns null if no route meets the hard accessibility constraint', () => {
    const criteria: MatchCriteria = {
      durationCategory: '1-2h',
      accessibility: 'stroller-friendly',
      vibe: 'courtyards',
    };

    const steepOnlyRoutes: Route[] = [MOCK_ROUTES[1]];
    const result = matchRoute(steepOnlyRoutes, criteria);

    expect(result).toBeNull();
  });
});

describe('Static Tbilisi Route Dataset', () => {
  it('contains valid routes with stops, coordinates, and tips', () => {
    const all = getAllRoutes();
    expect(all.length).toBeGreaterThanOrEqual(4);

    all.forEach((route) => {
      expect(route.id).toBeDefined();
      expect(route.title).toBeDefined();
      expect(route.stops.length).toBeGreaterThan(0);
      route.stops.forEach((stop) => {
        expect(stop.coordinates.lat).toBeGreaterThan(40);
        expect(stop.coordinates.lng).toBeGreaterThan(40);
        expect(stop.olyaTips.length).toBeGreaterThan(5);
      });
    });
  });

  it('retrieves routes by ID', () => {
    const route = getRouteById('sololaki-courtyards');
    expect(route).toBeDefined();
    expect(route?.id).toBe('sololaki-courtyards');
  });

  it('matches stroller-friendly routes from real dataset without returning steep routes', () => {
    const criteria: MatchCriteria = {
      durationCategory: 'half-day',
      accessibility: 'stroller-friendly',
      vibe: 'food-wine',
    };

    const result = matchRoute(ROUTES, criteria);
    expect(result).not.toBeNull();
    expect(result?.route.accessibility).toBe('stroller-friendly');
    expect(result?.route.id).not.toBe('old-tbilisi-fortress-ridge');
    expect(result?.route.id).not.toBe('mtatsminda-panoramic-trail');
  });
});
