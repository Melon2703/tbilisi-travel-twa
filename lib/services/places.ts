import { Stop, ProviderRating } from '../types/route';

export const DEFAULT_RATING: ProviderRating = {
  rating: 4.7,
  count: 1250,
};

export interface ResolvedRatings {
  google: ProviderRating;
  yandex: ProviderRating;
}

/**
 * Extracts and resolves provider-specific map ratings for a given Stop.
 * Falls back to legacy rating/ratingCount fields or global default if undefined.
 */
export function getStopRatings(stop: Stop): ResolvedRatings {
  const fallback: ProviderRating = {
    rating: stop.rating ?? DEFAULT_RATING.rating,
    count: stop.ratingCount ?? DEFAULT_RATING.count,
  };

  return {
    google: stop.ratings?.google ?? fallback,
    yandex: stop.ratings?.yandex ?? fallback,
  };
}

/**
 * Server/Client helper to fetch live place ratings or return curated fallbacks.
 * When real API keys (GOOGLE_PLACES_API_KEY, YANDEX_MAPS_API_KEY) are configured on server,
 * live ratings are queried from the providers. Otherwise, curated stop ratings are returned.
 */
export async function fetchPlaceRatingsFromAPI(
  stop: Stop,
  fetchImpl: typeof fetch = globalThis.fetch
): Promise<ResolvedRatings> {
  const fallback = getStopRatings(stop);

  // If running in browser or environment without backend keys, return resolved stop ratings
  if (typeof window !== 'undefined' && stop.placeIds) {
    try {
      const params = new URLSearchParams();
      if (stop.placeIds.google) params.set('googleId', stop.placeIds.google);

      if (params.toString()) {
        const res = await fetchImpl(`/api/places/ratings?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          return {
            google: data.google ?? fallback.google,
            yandex: data.yandex ?? fallback.yandex,
          };
        }
      }
    } catch {
      // Return fallback ratings gracefully on network or API failure
    }
  }

  return fallback;
}
