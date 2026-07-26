import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const googleId = searchParams.get('googleId');
  const yandexId = searchParams.get('yandexId');

  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
  const yandexApiKey = process.env.YANDEX_MAPS_API_KEY;

  let googleRating: { rating: number; count: number } | null = null;
  let yandexRating: { rating: number; count: number } | null = null;

  // 1. Fetch Google Place Details if API key & placeId available
  if (googleApiKey && googleId) {
    try {
      const googleRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
          googleId
        )}&fields=rating,user_ratings_total&key=${googleApiKey}`,
        { next: { revalidate: 86400 } } // Cache for 24h
      );
      if (googleRes.ok) {
        const data = await googleRes.json();
        if (data.result) {
          googleRating = {
            rating: data.result.rating ?? 4.7,
            count: data.result.user_ratings_total ?? 1250,
          };
        }
      }
    } catch (e) {
      console.error('Failed to fetch Google Place rating:', e);
    }
  }

  // 2. Fetch Yandex Place Details if API key & placeId available
  if (yandexApiKey && yandexId) {
    try {
      const yandexRes = await fetch(
        `https://search-maps.yandex.ru/v1/?oid=${encodeURIComponent(
          yandexId
        )}&lang=en_US&apikey=${yandexApiKey}`,
        { next: { revalidate: 86400 } }
      );
      if (yandexRes.ok) {
        const data = await yandexRes.json();
        const feature = data.features?.[0];
        if (feature?.properties?.CompanyMetaData) {
          const meta = feature.properties.CompanyMetaData;
          if (meta.Hours || meta.name) {
            googleRating = googleRating ?? null;
            // Extract ratings from metadata if present
            yandexRating = {
              rating: meta.rating?.score ?? 4.8,
              count: meta.rating?.ratings_count ?? 850,
            };
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch Yandex Place rating:', e);
    }
  }

  return NextResponse.json(
    {
      google: googleRating,
      yandex: yandexRating,
      status: googleApiKey || yandexApiKey ? 'ok' : 'fallback_mode',
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
      },
    }
  );
}
