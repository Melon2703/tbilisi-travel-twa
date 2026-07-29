import { describe, it, expect } from 'vitest';
import { matchRoute, sortRoutesByProximity, calculateDistance } from '../lib/engine/matcher';
import { ROUTES, getRouteById, getAllRoutes } from '../lib/data/routes';
import { Route, MatchCriteria, AttractionStop, VenueStop } from '../lib/types/route';

const MOCK_ROUTES: Route[] = [
  {
    id: 'sololaki-courtyards',
    title: 'Sololaki Secret Courtyards',
    subtitle: 'Stained glass, carved balconies, and hidden residential gems',
    durationCategory: '1-2h',
    accessibility: 'stroller-friendly',
    vibes: ['courtyards', 'insta-locations'],
    heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f',
    introCopy: 'Discover hidden 19th-century Italianate courtyards of Sololaki.',
    stops: [
      {
        id: 'stop-1',
        order: 1,
        stopType: 'attraction',
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
    durationCategory: '3-4h',
    accessibility: 'steep-stairs',
    vibes: ['cultural', 'hiking'],
    heroImage: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c',
    introCopy: 'Climb the historic cobblestone hills of Old Kala.',
    stops: [
      {
        id: 'stop-2',
        order: 1,
        stopType: 'attraction',
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
    durationCategory: '3-4h',
    accessibility: 'moderate',
    vibes: ['food-wine', 'courtyards'],
    heroImage: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
    introCopy: 'Taste natural Georgian wines and modern cuisine.',
    stops: [
      {
        id: 'stop-3',
        order: 1,
        stopType: 'venue',
        isOptional: true,
        venueDetails: {
          category: 'wine_bar',
          cuisines: ['georgian'],
          isVegetarianFriendly: true,
          recommendedDishes: ['Qvevri Amber wine', 'Artisan cheeses'],
          bookingAdvice: 'Reserve in advance for evening tastings.',
        },
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
      durationCategory: '3-4h',
      accessibility: 'stroller-friendly',
      vibe: 'cultural',
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
      durationCategory: 'full-day',
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

  it('matches routes with new duration options (3-4h, full-day) and new vibe categories (cultural, insta-locations, hiking)', () => {
    const criteria: MatchCriteria = {
      durationCategory: '3-4h',
      accessibility: 'steep-stairs',
      vibe: 'hiking',
    };

    const result = matchRoute(MOCK_ROUTES, criteria);
    expect(result).not.toBeNull();
    expect(result?.route.id).toBe('old-tbilisi-steep');
    expect(result?.relaxed).toBe(false);
  });
});

describe('Geo-Proximity Sorting Engine', () => {
  it('calculates distance between two geographical coordinates in km', () => {
    // Freedom Square (41.6934, 44.8015) to Rustaveli Metro (41.7042, 44.7905)
    const dist = calculateDistance(41.6934, 44.8015, 41.7042, 44.7905);
    expect(dist).toBeGreaterThan(1.0);
    expect(dist).toBeLessThan(2.0);
  });

  it('sorts routes by distance relative to current user coordinates', () => {
    // User is at Freedom Square (41.6934, 44.8015)
    const userPos = { lat: 41.6934, lng: 44.8015 };
    const sorted = sortRoutesByProximity(MOCK_ROUTES, userPos);

    // Machabeli St (sololaki-courtyards) is closest to Freedom Square
    expect(sorted[0].id).toBe('sololaki-courtyards');
    // Agmashenebeli (chugureti-food-wine) is furthest across the river (41.7082)
    expect(sorted[sorted.length - 1].id).toBe('chugureti-food-wine');
  });

  it('supports userLocation in latitude/longitude key format', () => {
    const userPos = { latitude: 41.7080, longitude: 44.8020 };
    const sorted = sortRoutesByProximity(MOCK_ROUTES, userPos);

    // Chugureti is closest to 41.7080, 44.8020
    expect(sorted[0].id).toBe('chugureti-food-wine');
  });
});

describe('Static Tbilisi Route Dataset with Polymorphic Stops', () => {
  it('contains valid routes with stops, coordinates, and tips', () => {
    const all = getAllRoutes();
    expect(all.length).toBeGreaterThanOrEqual(4);

    all.forEach((route) => {
      expect(route.id).toBeDefined();
      expect(route.title).toBeDefined();
      expect(route.stops.length).toBeGreaterThan(0);
      route.stops.forEach((stop) => {
        expect(stop.stopType).toBeDefined();
        expect(['attraction', 'venue']).toContain(stop.stopType);
        expect(stop.coordinates.lat).toBeGreaterThan(40);
        expect(stop.coordinates.lng).toBeGreaterThan(40);
        expect(stop.olyaTips.length).toBeGreaterThan(5);

        if (stop.stopType === 'venue') {
          const venue = stop as VenueStop;
          expect(venue.isOptional).toBe(true);
          expect(venue.venueDetails).toBeDefined();
          expect(venue.venueDetails.category).toBeDefined();
          expect(Array.isArray(venue.venueDetails.cuisines)).toBe(true);
          expect(typeof venue.venueDetails.isVegetarianFriendly).toBe('boolean');
          expect(Array.isArray(venue.venueDetails.recommendedDishes)).toBe(true);
        }
      });
    });
  });

  it('retrieves routes by ID', () => {
    const route = getRouteById('sololaki-courtyards');
    expect(route).toBeDefined();
    expect(route?.id).toBe('sololaki-courtyards');
  });

  it('contains the full 19-stop Old Tbilisi Heartbeat master dataset with complete polymorphic metadata', () => {
    const heartbeat = getRouteById('old-tbilisi-heartbeat');
    expect(heartbeat).toBeDefined();
    expect(heartbeat?.title).toContain('Old Tbilisi Heartbeat');
    expect(heartbeat?.stops).toHaveLength(19);

    heartbeat?.stops.forEach((stop, index) => {
      expect(stop.order).toBe(index + 1);
      expect(stop.id).toBeDefined();
      expect(stop.name).toBeDefined();
      expect(stop.neighborhood).toBeDefined();
      expect(stop.coordinates.lat).toBeGreaterThan(41.6);
      expect(stop.coordinates.lng).toBeGreaterThan(44.7);
      expect(stop.estimatedMinutes).toBeGreaterThan(0);
      expect(stop.imageUrl).toBeDefined();
      expect(stop.olyaTips.length).toBeGreaterThan(10);
    });

    // Check specific venue stops
    const cafeMinda = heartbeat?.stops.find((s) => s.order === 2) as VenueStop;
    expect(cafeMinda.stopType).toBe('venue');
    expect(cafeMinda.venueDetails.category).toBe('cafe');
    expect(cafeMinda.isOptional).toBe(true);

    const lunchStop = heartbeat?.stops.find((s) => s.order === 13) as VenueStop;
    expect(lunchStop.stopType).toBe('venue');
    expect(lunchStop.venueDetails.category).toBe('restaurant');
    expect(lunchStop.venueDetails.recommendedDishes.length).toBeGreaterThan(0);

    // Check attraction stop with transit badge
    const cableCarStop = heartbeat?.stops.find((s) => s.order === 11) as AttractionStop;
    expect(cableCarStop.stopType).toBe('attraction');
    expect(cableCarStop.transitBadge).toBeDefined();
  });

  it('contains sub-route derivatives for duration, accessibility, and vibe matching', () => {
    const all = getAllRoutes();
    const subRoutes = all.filter((r) => r.id.startsWith('heartbeat-'));
    expect(subRoutes.length).toBeGreaterThanOrEqual(2);

    subRoutes.forEach((route) => {
      expect(route.stops.length).toBeGreaterThan(0);
      expect(route.stops.length).toBeLessThan(19);
    });
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


