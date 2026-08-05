import { Coordinates, Stop } from '../types/route';

/**
 * A real-world place, independent of any Route: coordinates plus the Google
 * `place_id` that names it. Map Links resolve on this, never on a display name.
 */
export interface PlaceIdentity {
  coordinates: Coordinates;
  googlePlaceId?: string;
}

/** A blank place_id is an absent one. */
function normalizePlaceId(googlePlaceId?: string): string | undefined {
  return googlePlaceId?.trim() || undefined;
}

/** Reads the Place Identity a Stop references. */
export function getPlaceIdentity(stop: Stop): PlaceIdentity {
  const googlePlaceId = normalizePlaceId(stop.placeIds?.google);

  return googlePlaceId
    ? { coordinates: stop.coordinates, googlePlaceId }
    : { coordinates: stop.coordinates };
}

/**
 * Google Maps link, anchored on coordinates with the place identity as an
 * enhancement: an absent or unresolvable `place_id` degrades to a correct pin.
 */
export function buildGoogleMapLink({ coordinates, googlePlaceId }: PlaceIdentity): string {
  const { lat, lng } = coordinates;
  const base = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const id = normalizePlaceId(googlePlaceId);

  return id ? `${base}&query_place_id=${encodeURIComponent(id)}` : base;
}

/** Yandex Maps link. Yandex cannot resolve a Google `place_id`, so coordinates only. */
export function buildYandexMapLink({ coordinates }: PlaceIdentity): string {
  const { lat, lng } = coordinates;
  return `https://yandex.com/maps/?pt=${lng},${lat}&z=17`;
}
