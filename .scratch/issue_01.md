## Parent
#1

## What to build
The foundational domain model, static route dataset for Tbilisi (Sololaki courtyards, Vera architectural walks), and constraint-based route matching logic. When a user requests a route matching specific duration, accessibility, and vibe preferences, the matcher evaluates constraints (treating accessibility as a strict hard constraint and duration/vibe as soft constraints) and returns the optimal route recommendation alongside Olya's explanation note if preferences were relaxed.

## Acceptance criteria
- [ ] TypeScript interfaces defined for `Route`, `Stop`, `DurationCategory`, `AccessibilityLevel`, and `VibeCategory`.
- [ ] Static dataset populated with rich, authentic Tbilisi walking routes and stops containing exact GPS coordinates, timing, Olya's tips, and logistics warnings.
- [ ] `matchRoute()` function implemented with hard constraint filtering for accessibility and soft constraint relaxation for duration/vibe.
- [ ] Unit test suite covering exact matching, soft constraint relaxation, and hard accessibility enforcement.

## Blocked by
None — can start immediately.
