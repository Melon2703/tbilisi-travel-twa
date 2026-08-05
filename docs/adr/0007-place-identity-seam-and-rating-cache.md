# Place Identity as a Seam; No Hand-Rolled Rating Cache

Google `place_id` and coordinates are hand-authored per Stop, and the only Google call is Place Details keyed by that id requesting `rating,user_ratings_total`. There is no discovery call (Find Place / Text Search) whose response could be mined for identity — the identity is already local, and `getMapUrl` was discarding it in favour of a name query, which is what broke links for non-Latin and generic names.

We named **Place Identity** (`place_id` + coordinates) as a concept distinct from **Stop** (a place's appearance in one Route) and enforce it **only at the seam**: the map-link builder and the rating fetch take a Place Identity rather than a Stop or a name. The dataset stays denormalised for now — four physical places currently exist as two Stop records each, one pair with identical coordinates but two different names and two different place_ids — because the data file is about to be rewritten with real content and normalising it now would be churn.

Map links are **coordinate-anchored with `place_id` as an enhancement** (`query=<lat>,<lng>&query_place_id=<id>`), so a missing or unresolvable id degrades to a correct pin rather than a dead link. This matters concretely: most place_ids in the dataset are still readable placeholders that Google cannot resolve. Yandex links use coordinates only.

The filesystem rating cache (`lib/utils/ratingsCache.ts`) is removed. It wrote with `fs.writeFileSync` at request time into `lib/data/`, which is read-only on Vercel — every write threw and was swallowed, and each request paid a synchronous `readFileSync` for a permanently empty file. The underlying `fetch` already carries `next: { revalidate: 86400 }`, and with `cacheComponents` not enabled that opts into Next's Data Cache, which does work in production.

## Consequences

- A Stop with no resolvable rating renders **no rating at all**. The `DEFAULT_RATING` of 4.7 / 1,250 was an invented number displayed as "reviews on Google"; ratings are the one part of the app required to be real.
