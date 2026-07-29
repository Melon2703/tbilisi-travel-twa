# 01 — Polymorphic Stop Schema & Route Data Prefactoring

**What to build:** End-to-end support in domain types and route data for `AttractionStop` and `VenueStop` (`stopType: 'attraction' | 'venue'`, `venueDetails`, `isOptional`, `transitBadge`), allowing food/drink establishments and transit points to be represented cleanly without breaking existing route rendering.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Define `AttractionStop` and `VenueStop` polymorphic interfaces in `lib/types/route.ts` with `stopType` discriminator.
- [ ] Add `VenueDetails` interface containing `category`, `cuisines`, `isVegetarianFriendly`, `recommendedDishes`, and `bookingAdvice`.
- [ ] Update static route data in `lib/data/routes.ts` to conform to the polymorphic schema.
- [ ] Ensure existing tests pass without breakage under the updated schema.
