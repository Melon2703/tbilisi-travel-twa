import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getStopRatings, fetchPlaceRatingsFromAPI } from '../lib/services/places';
import { Stop } from '../lib/types/route';
import { GET } from '../app/api/places/ratings/route';
import { readRatingsCache, writeRatingsCache, TTL_MS } from '../lib/utils/ratingsCache';

describe('Places Ratings Service', () => {
  const mockStop: Stop = {
    id: 'test-stop-1',
    order: 1,
    stopType: 'attraction',
    name: 'Fabrika Tbilisi',
    neighborhood: 'Marjanishvili',
    coordinates: { lat: 41.7096, lng: 44.8058 },
    estimatedMinutes: 45,
    imageUrl: '/images/fabrika.jpg',
    olyaTips: 'Great atmosphere',
    ratings: {
      google: { rating: 4.7, count: 3200 },
    },
    placeIds: {
      google: 'ChIJx5mG_r8XREARaZ2b_test',
    },
  };

  it('returns Google rating when defined on Stop object', () => {
    const ratings = getStopRatings(mockStop);
    expect(ratings.google).toEqual({ rating: 4.7, count: 3200 });
  });

  it('falls back to single rating when ratings object is missing', () => {
    const legacyStop: Stop = {
      ...mockStop,
      ratings: undefined,
      rating: 4.6,
      ratingCount: 800,
    };
    const ratings = getStopRatings(legacyStop);
    expect(ratings.google).toEqual({ rating: 4.6, count: 800 });
  });

  it('uses global default when no ratings are provided', () => {
    const emptyStop: Stop = {
      ...mockStop,
      ratings: undefined,
      rating: undefined,
      ratingCount: undefined,
    };
    const ratings = getStopRatings(emptyStop);
    expect(ratings.google).toEqual({ rating: 4.7, count: 1250 });
  });

  it('returns fallback data when API keys are not present', async () => {
    const result = await fetchPlaceRatingsFromAPI(mockStop);
    expect(result.google).toEqual({ rating: 4.7, count: 3200 });
  });
});

describe('Places Ratings API Route GET /api/places/ratings', () => {
  const originalEnv = process.env;
  let initialCacheState: Record<string, unknown> = {};

  beforeEach(() => {
    process.env = { ...originalEnv };
    initialCacheState = readRatingsCache();
    writeRatingsCache({});
  });

  afterEach(() => {
    process.env = originalEnv;
    writeRatingsCache(initialCacheState as any);
    vi.restoreAllMocks();
  });

  it('returns fallback_mode status when no API keys are set and cache is missing', async () => {
    delete process.env.GOOGLE_PLACES_API_KEY;

    const request = new Request('http://localhost/api/places/ratings?googleId=abc');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('fallback_mode');
    expect(data.google).toBeNull();
    expect(data.yandex).toBeUndefined();
  });

  it('fetches real Google rating, queries field masks, writes to cache, and resets 14-day TTL', async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'mock_google_key';

    const fetchSpy = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.includes('maps.googleapis.com')) {
        expect(url).toContain('fields=rating,user_ratings_total');
        expect(init?.headers).toMatchObject({
          'X-Goog-FieldMask': 'rating,user_ratings_total',
        });

        return new Response(
          JSON.stringify({
            result: {
              rating: 4.9,
              user_ratings_total: 4500,
            },
          }),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    globalThis.fetch = fetchSpy;

    const beforeTime = Date.now();
    const request = new Request('http://localhost/api/places/ratings?googleId=place_123');
    const response = await GET(request);
    const data = await response.json();

    expect(data.status).toBe('ok');
    expect(data.google).toEqual({ rating: 4.9, count: 4500 });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const cache = readRatingsCache();
    expect(cache['place_123']).toBeDefined();
    expect(cache['place_123'].rating).toBe(4.9);
    expect(cache['place_123'].count).toBe(4500);
    expect(cache['place_123'].fetchedAt).toBeGreaterThanOrEqual(beforeTime);
  });

  it('returns cached rating with 0 API calls when TTL is valid (< 14 days)', async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'mock_google_key';

    const now = Date.now();
    writeRatingsCache({
      cached_place_1: {
        rating: 4.8,
        count: 2100,
        fetchedAt: now - 10000,
      },
    });

    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    const request = new Request('http://localhost/api/places/ratings?googleId=cached_place_1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.google).toEqual({ rating: 4.8, count: 2100 });
    expect(fetchSpy).toHaveBeenCalledTimes(0);
  });

  it('refetches Google Places API when cache entry is expired (> 14 days)', async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'mock_google_key';

    const fifteenDaysAgo = Date.now() - (TTL_MS + 86400000);
    writeRatingsCache({
      expired_place: {
        rating: 4.0,
        count: 500,
        fetchedAt: fifteenDaysAgo,
      },
    });

    const fetchSpy = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('maps.googleapis.com')) {
        return new Response(
          JSON.stringify({
            result: {
              rating: 4.95,
              user_ratings_total: 6000,
            },
          }),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    globalThis.fetch = fetchSpy;

    const request = new Request('http://localhost/api/places/ratings?googleId=expired_place');
    const response = await GET(request);
    const data = await response.json();

    expect(data.status).toBe('ok');
    expect(data.google).toEqual({ rating: 4.95, count: 6000 });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const cache = readRatingsCache();
    expect(cache['expired_place'].rating).toBe(4.95);
    expect(cache['expired_place'].fetchedAt).toBeGreaterThan(fifteenDaysAgo);
  });

  it('completely ignores yandexId and does not make Yandex API calls', async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'mock_google_key';

    const fetchSpy = vi.fn().mockImplementation(async (url: string) => {
      return new Response(
        JSON.stringify({
          result: { rating: 4.5, user_ratings_total: 100 },
        }),
        { status: 200 }
      );
    });
    globalThis.fetch = fetchSpy;

    const request = new Request('http://localhost/api/places/ratings?googleId=g_123&yandexId=y_456');
    const response = await GET(request);
    const data = await response.json();

    expect(data.google).toEqual({ rating: 4.5, count: 100 });
    expect(data.yandex).toBeUndefined();

    for (const call of fetchSpy.mock.calls) {
      expect(call[0]).not.toContain('yandex');
    }
  });
});
