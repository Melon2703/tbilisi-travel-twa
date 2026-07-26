import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getStopRatings, fetchPlaceRatingsFromAPI } from '../lib/services/places';
import { Stop } from '../lib/types/route';
import { GET } from '../app/api/places/ratings/route';

describe('Places Ratings Service', () => {
  const mockStop: Stop = {
    id: 'test-stop-1',
    order: 1,
    name: 'Fabrika Tbilisi',
    neighborhood: 'Marjanishvili',
    coordinates: { lat: 41.7096, lng: 44.8058 },
    estimatedMinutes: 45,
    imageUrl: '/images/fabrika.jpg',
    olyaTips: 'Great atmosphere',
    ratings: {
      google: { rating: 4.7, count: 3200 },
      yandex: { rating: 4.8, count: 1400 },
    },
    placeIds: {
      google: 'ChIJx5mG_r8XREARaZ2b_test',
      yandex: 'yandex_place_123',
    },
  };

  it('returns distinct provider ratings when defined on Stop object', () => {
    const ratings = getStopRatings(mockStop);
    expect(ratings.google).toEqual({ rating: 4.7, count: 3200 });
    expect(ratings.yandex).toEqual({ rating: 4.8, count: 1400 });
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
    expect(ratings.yandex).toEqual({ rating: 4.6, count: 800 });
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
    expect(ratings.yandex).toEqual({ rating: 4.7, count: 1250 });
  });

  it('returns fallback data when API keys are not present', async () => {
    const result = await fetchPlaceRatingsFromAPI(mockStop);
    expect(result.google).toEqual({ rating: 4.7, count: 3200 });
    expect(result.yandex).toEqual({ rating: 4.8, count: 1400 });
  });
});

describe('Places Ratings API Route GET /api/places/ratings', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns fallback_mode status when no API keys are set', async () => {
    delete process.env.GOOGLE_PLACES_API_KEY;
    delete process.env.YANDEX_MAPS_API_KEY;

    const request = new Request('http://localhost/api/places/ratings?googleId=abc&yandexId=xyz');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('fallback_mode');
    expect(data.google).toBeNull();
    expect(data.yandex).toBeNull();
  });

  it('fetches real Google rating when GOOGLE_PLACES_API_KEY is configured', async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'mock_google_key';

    const globalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('maps.googleapis.com')) {
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

    try {
      const request = new Request('http://localhost/api/places/ratings?googleId=place_123');
      const response = await GET(request);
      const data = await response.json();

      expect(data.status).toBe('ok');
      expect(data.google).toEqual({ rating: 4.9, count: 4500 });
    } finally {
      globalThis.fetch = globalFetch;
    }
  });
});
