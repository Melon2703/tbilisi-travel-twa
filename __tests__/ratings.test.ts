import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchPlaceRating } from '../lib/services/places';
import { GET } from '../app/api/places/ratings/route';

describe('fetchPlaceRating', () => {
  it('resolves a rating for a Place Identity that carries a place_id', async () => {
    const fetchImpl = vi.fn(
      async () => new Response(JSON.stringify({ google: { rating: 4.4, count: 91 } }), { status: 200 })
    );

    const rating = await fetchPlaceRating(
      { coordinates: { lat: 41.6918, lng: 44.7972 }, googlePlaceId: 'ChIJplace' },
      fetchImpl as unknown as typeof fetch
    );

    expect(rating).toEqual({ rating: 4.4, count: 91 });
    expect(fetchImpl).toHaveBeenCalledWith('/api/places/ratings?googleId=ChIJplace');
  });

  it('resolves to no rating for a Place Identity without a place_id, without calling out', async () => {
    const fetchImpl = vi.fn();

    const rating = await fetchPlaceRating(
      { coordinates: { lat: 41.6918, lng: 44.7972 } },
      fetchImpl as unknown as typeof fetch
    );

    expect(rating).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('resolves to no rating when the request fails', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('offline');
    });

    const rating = await fetchPlaceRating(
      { coordinates: { lat: 41.6918, lng: 44.7972 }, googlePlaceId: 'ChIJplace' },
      fetchImpl as unknown as typeof fetch
    );

    expect(rating).toBeNull();
  });
});

describe('GET /api/places/ratings', () => {
  const originalEnv = process.env;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns no rating when no API key is configured', async () => {
    delete process.env.GOOGLE_PLACES_API_KEY;
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const response = await GET(new Request('http://localhost/api/places/ratings?googleId=abc'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ google: null });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns no rating when no place_id is given', async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'mock_google_key';
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const response = await GET(new Request('http://localhost/api/places/ratings'));

    await expect(response.json()).resolves.toEqual({ google: null });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns the real Google rating, leaving the outbound request to the framework data cache', async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'mock_google_key';

    const fetchSpy = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toContain('place_id=place_123');
      expect(init).toMatchObject({ next: { revalidate: 86400 } });
      expect(url).toContain('fields=rating,user_ratings_total');
      return new Response(
        JSON.stringify({ result: { rating: 4.9, user_ratings_total: 4500 } }),
        { status: 200 }
      );
    });
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const response = await GET(
      new Request('http://localhost/api/places/ratings?googleId=place_123')
    );

    await expect(response.json()).resolves.toEqual({ google: { rating: 4.9, count: 4500 } });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][1]).toMatchObject({ next: { revalidate: 86400 } });
  });

  it('returns no rating when Google has no rating for the place', async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'mock_google_key';
    globalThis.fetch = vi.fn(
      async () => new Response(JSON.stringify({ result: {} }), { status: 200 })
    ) as unknown as typeof fetch;

    const response = await GET(
      new Request('http://localhost/api/places/ratings?googleId=unresolvable_place')
    );

    await expect(response.json()).resolves.toEqual({ google: null });
  });

  it('returns no rating when the Google request fails', async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'mock_google_key';
    globalThis.fetch = vi.fn(async () => {
      throw new Error('network down');
    }) as unknown as typeof fetch;
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await GET(new Request('http://localhost/api/places/ratings?googleId=g_123'));

    await expect(response.json()).resolves.toEqual({ google: null });
  });

  it('ignores a yandexId and never calls Yandex', async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'mock_google_key';
    const fetchSpy = vi.fn(async (url: string) => {
      expect(url).not.toContain('yandex');
      return new Response(JSON.stringify({ result: { rating: 4.5, user_ratings_total: 100 } }), {
        status: 200,
      });
    });
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const response = await GET(
      new Request('http://localhost/api/places/ratings?googleId=g_123&yandexId=y_456')
    );

    await expect(response.json()).resolves.toEqual({ google: { rating: 4.5, count: 100 } });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
