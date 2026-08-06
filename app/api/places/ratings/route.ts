import { NextResponse } from 'next/server';
import { ProviderRating } from '@/lib/types/route';

/**
 * One day. The outbound request carries this window, which opts it into the
 * framework's Data Cache — the only rating cache this app has (see ADR 0007).
 */
const REVALIDATE_SECONDS = 86400;

async function fetchGoogleRating(placeId: string, apiKey: string): Promise<ProviderRating | null> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
        placeId
      )}&fields=rating,user_ratings_total&key=${apiKey}`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const rating = data.result?.rating;
    const count = data.result?.user_ratings_total;

    // Anything Google does not answer with two numbers is an absent rating.
    if (typeof rating !== 'number' || typeof count !== 'number') return null;

    return { rating, count };
  } catch (e) {
    console.error('Failed to fetch Google Place rating:', e);
    return null;
  }
}

/**
 * Google Rating for a place identity. Responds with `{ google: null }` whenever
 * the rating cannot be resolved — the caller renders nothing rather than a
 * fabricated score.
 */
export async function GET(request: Request) {
  const googleId = new URL(request.url).searchParams.get('googleId');
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  const google = googleId && apiKey ? await fetchGoogleRating(googleId, apiKey) : null;

  return NextResponse.json(
    { google },
    {
      headers: {
        'Cache-Control': `public, max-age=3600, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=${REVALIDATE_SECONDS}`,
      },
    }
  );
}
