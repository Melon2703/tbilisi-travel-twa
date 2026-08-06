import { ProviderRating } from '../types/route';
import { PlaceIdentity } from '../utils/mapLinks';

/**
 * Resolves the live Google Rating for a Place Identity, or `null` when it
 * cannot be resolved — no identity, no key on the server, no rating on the
 * place, or a failed request. A place with no identity is never requested.
 */
export async function fetchPlaceRating(
  { googlePlaceId }: PlaceIdentity,
  fetchImpl: typeof fetch = globalThis.fetch
): Promise<ProviderRating | null> {
  if (!googlePlaceId) return null;

  try {
    const params = new URLSearchParams({ googleId: googlePlaceId });
    const res = await fetchImpl(`/api/places/ratings?${params.toString()}`);
    if (!res.ok) return null;

    const data = await res.json();
    return data.google ?? null;
  } catch {
    // An unresolvable rating is an absent rating, never a fabricated one.
    return null;
  }
}
