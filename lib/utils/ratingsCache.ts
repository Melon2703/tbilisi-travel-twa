import fs from 'fs';
import path from 'path';

export interface RatingCacheEntry {
  rating: number;
  count: number;
  fetchedAt: number;
}

export type RatingsCache = Record<string, RatingCacheEntry>;

const CACHE_FILE_PATH = path.join(process.cwd(), 'lib/data/ratings-cache.json');
export const TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days (1,209,600,000 ms)

export function readRatingsCache(): RatingsCache {
  try {
    if (!fs.existsSync(CACHE_FILE_PATH)) {
      return {};
    }
    const data = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
    return JSON.parse(data) as RatingsCache;
  } catch (error) {
    console.error('Failed to read ratings cache:', error);
    return {};
  }
}

export function writeRatingsCache(cache: RatingsCache): void {
  try {
    const dir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write ratings cache:', error);
  }
}

export function getCachedRating(googleId: string, now: number = Date.now()): RatingCacheEntry | null {
  const cache = readRatingsCache();
  const entry = cache[googleId];
  if (!entry) return null;

  if (now < entry.fetchedAt + TTL_MS) {
    return entry;
  }

  return null;
}

export function setCachedRating(
  googleId: string,
  rating: { rating: number; count: number },
  now: number = Date.now()
): void {
  const cache = readRatingsCache();
  cache[googleId] = {
    rating: rating.rating,
    count: rating.count,
    fetchedAt: now,
  };
  writeRatingsCache(cache);
}
