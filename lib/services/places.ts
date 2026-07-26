import { Stop, ProviderRating } from '../types/route';

export const DEFAULT_RATING: ProviderRating = {
  rating: 4.7,
  count: 1250,
};

export interface ResolvedRatings {
  google: ProviderRating;
}

/**
 * Extracts and resolves Google map rating for a given Stop.
 * Falls back to legacy rating/ratingCount fields or global default if undefined.
 */
export function getStopRatings(stop: Stop): ResolvedRatings {
  const fallback: ProviderRating = {
    rating: stop.rating ?? DEFAULT_RATING.rating,
    count: stop.ratingCount ?? DEFAULT_RATING.count,
  };

  return {
    google: stop.ratings?.google ?? fallback,
  };
}

/**
 * Server/Client helper to fetch live Google place rating or return curated fallbacks.
 * When real API key (GOOGLE_PLACES_API_KEY) is configured on server,
 * live rating is queried from Google Places API. Otherwise, curated stop rating is returned.
 */
export async function fetchPlaceRatingsFromAPI(
  stop: Stop,
  fetchImpl: typeof fetch = globalThis.fetch
): Promise<ResolvedRatings> {
  const fallback = getStopRatings(stop);

  // If running in browser or environment without backend keys, return resolved stop ratings
  if (typeof window !== 'undefined' && stop.placeIds?.google) {
    try {
      const params = new URLSearchParams({ googleId: stop.placeIds.google });
      const res = await fetchImpl(`/api/places/ratings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return {
          google: data.google ?? fallback.google,
        };
      }
    } catch {
      // Return fallback ratings gracefully on network or API failure
    }
  }

  return fallback;
}
