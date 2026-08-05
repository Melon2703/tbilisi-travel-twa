import { describe, it, expect } from 'vitest';
import {
  buildGoogleMapLink,
  buildYandexMapLink,
  getPlaceIdentity,
  PlaceIdentity,
} from '@/lib/utils/mapLinks';
import { Stop } from '@/lib/types/route';

const coordinates = { lat: 41.6918, lng: 44.7972 };

function makeStop(overrides: Partial<Stop> = {}): Stop {
  return {
    id: 'stop-1',
    order: 1,
    stopType: 'attraction',
    name: 'Liberty Square',
    neighborhood: 'Old Town',
    coordinates,
    estimatedMinutes: 20,
    imageUrl: 'https://example.com/liberty.jpg',
    olyaTips: 'Start here.',
    ...overrides,
  } as Stop;
}

describe('Place Identity seam', () => {
  it('derives a Place Identity of coordinates plus google place_id from a Stop', () => {
    const identity = getPlaceIdentity(
      makeStop({ placeIds: { google: 'ChIJde6a4L4XREARZ6pL-v6Hw8U' } })
    );

    expect(identity).toEqual({
      coordinates,
      googlePlaceId: 'ChIJde6a4L4XREARZ6pL-v6Hw8U',
    });
  });

  it('derives a Place Identity with no place_id when the Stop has none', () => {
    expect(getPlaceIdentity(makeStop())).toEqual({ coordinates });
  });

  it('treats a blank place_id as absent', () => {
    const identity = getPlaceIdentity(makeStop({ placeIds: { google: '   ' } }));
    expect(identity.googlePlaceId).toBeUndefined();
  });

  it('carries no display name into the Place Identity', () => {
    const identity = getPlaceIdentity(makeStop({ name: 'Площадь Свободы' }));
    expect(JSON.stringify(identity)).not.toContain('Площадь');
  });
});

describe('buildGoogleMapLink', () => {
  it('anchors on coordinates and carries the place identity when present', () => {
    const identity: PlaceIdentity = {
      coordinates,
      googlePlaceId: 'ChIJde6a4L4XREARZ6pL-v6Hw8U',
    };

    expect(buildGoogleMapLink(identity)).toBe(
      'https://www.google.com/maps/search/?api=1&query=41.6918,44.7972&query_place_id=ChIJde6a4L4XREARZ6pL-v6Hw8U'
    );
  });

  it('pins the correct coordinates when the identity has no place_id', () => {
    expect(buildGoogleMapLink({ coordinates })).toBe(
      'https://www.google.com/maps/search/?api=1&query=41.6918,44.7972'
    );
  });

  it('still pins the correct coordinates for an unresolvable placeholder place_id', () => {
    const url = buildGoogleMapLink({ coordinates, googlePlaceId: 'ChIJPardag_SioniAlley_TB' });

    expect(url).toContain('query=41.6918,44.7972');
    expect(url).toContain('query_place_id=ChIJPardag_SioniAlley_TB');
  });

  it('percent-encodes a place_id containing URL-significant characters', () => {
    const url = buildGoogleMapLink({ coordinates, googlePlaceId: 'abc&def=ghi' });
    expect(url).toContain('query_place_id=abc%26def%3Dghi');
  });

  it('omits an empty place_id rather than emitting a dangling parameter', () => {
    expect(buildGoogleMapLink({ coordinates, googlePlaceId: '' })).toBe(
      'https://www.google.com/maps/search/?api=1&query=41.6918,44.7972'
    );
  });

  it('never resolves by display name, for non-Latin or generic names alike', () => {
    for (const name of ['Площадь Свободы', 'ღვინის ბარი', 'Cafe']) {
      const url = buildGoogleMapLink(getPlaceIdentity(makeStop({ name })));
      expect(url).not.toContain(encodeURIComponent(name));
      expect(url).not.toContain(name);
      expect(url).toBe('https://www.google.com/maps/search/?api=1&query=41.6918,44.7972');
    }
  });
});

describe('buildYandexMapLink', () => {
  it('builds from coordinates only, in lng,lat order', () => {
    expect(buildYandexMapLink({ coordinates })).toBe(
      'https://yandex.com/maps/?pt=44.7972,41.6918&z=17'
    );
  });

  it('ignores the place identity, which Yandex cannot resolve', () => {
    expect(
      buildYandexMapLink({ coordinates, googlePlaceId: 'ChIJde6a4L4XREARZ6pL-v6Hw8U' })
    ).toBe('https://yandex.com/maps/?pt=44.7972,41.6918&z=17');
  });

  it('never resolves by display name, for non-Latin or generic names alike', () => {
    for (const name of ['Площадь Свободы', 'ღვინის ბარი', 'Cafe']) {
      const url = buildYandexMapLink(getPlaceIdentity(makeStop({ name })));
      expect(url).not.toContain(encodeURIComponent(name));
      expect(url).not.toContain(name);
    }
  });
});
