import { NextResponse } from 'next/server';
import { getCachedRating, setCachedRating } from '@/lib/utils/ratingsCache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const googleId = searchParams.get('googleId');

  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;

  let googleRating: { rating: number; count: number } | null = null;

  if (googleId) {
    const cached = getCachedRating(googleId);
    if (cached) {
      googleRating = {
        rating: cached.rating,
        count: cached.count,
      };
    } else if (googleApiKey) {
      try {
        const googleRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
            googleId
          )}&fields=rating,user_ratings_total&key=${googleApiKey}`,
          {
            headers: {
              'X-Goog-FieldMask': 'rating,user_ratings_total',
            },
            next: { revalidate: 86400 },
          }
        );

        if (googleRes.ok) {
          const data = await googleRes.json();
          const ratingVal = data.result?.rating ?? data.rating;
          const countVal =
            data.result?.user_ratings_total ?? data.userRatingCount ?? data.user_ratings_total;

          if (ratingVal != null && countVal != null) {
            googleRating = {
              rating: ratingVal,
              count: countVal,
            };
            setCachedRating(googleId, googleRating);
          }
        }
      } catch (e) {
        console.error('Failed to fetch Google Place rating:', e);
      }
    }
  }

  return NextResponse.json(
    {
      google: googleRating,
      status: googleRating || googleApiKey ? 'ok' : 'fallback_mode',
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
      },
    }
  );
}
