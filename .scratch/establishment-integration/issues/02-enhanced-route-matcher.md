# 02 — Enhanced Route Matching Engine (Duration, Vibe & Geo-Proximity)

**What to build:** End-to-end filtering and geo-proximity sorting in the route matching engine so travelers can filter itineraries by updated duration options (`1-2h`, `3-4h`, `half-day`, `full-day`), vibe tags (`cultural`, `insta-locations`, `hiking`), accessibility (`easy`), and sort routes by nearest starting stop.

**Blocked by:** 01 — Polymorphic Stop Schema & Route Data Prefactoring

**Status:** ready-for-agent

- [ ] Update `DurationCategory`, `VibeCategory`, and `AccessibilityLevel` enums in `lib/types/route.ts`.
- [ ] Implement distance calculation and geo-sorting relative to traveler's current coordinates in `lib/engine/matcher.ts`.
- [ ] Update matching rules to preserve Hard Constraint (Logistics/Accessibility) and Soft Constraint (Duration & Vibe) relaxation.
- [ ] Add unit test coverage in `__tests__/matcher.test.ts` verifying geo-sorting and updated filter categories.
