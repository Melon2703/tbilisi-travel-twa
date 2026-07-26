import { describe, it, expect } from 'vitest';
import { ROUTES } from '../lib/data/routes';
import { getStopRatings } from '../lib/services/places';

describe('Stop Ratings Bug Repro', () => {
  it('ensures stops do not all return identical default rating (4.7 / 1250 reviews)', () => {
    const route = ROUTES[0];
    const stops = route.stops;
    expect(stops.length).toBeGreaterThan(1);

    const ratings = stops.map((stop) => getStopRatings(stop));

    const defaultRatingStops = ratings.filter(
      (r) => r.google.count === 1250 && r.google.rating === 4.7
    );

    // If every stop returns the default rating (1250 reviews), this test will fail.
    expect(defaultRatingStops.length).toBeLessThan(stops.length);
  });
});
