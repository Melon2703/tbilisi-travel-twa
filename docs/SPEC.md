# UI Refactor Specification: Stories-Style Horizontal Carousel Route Guide

## Problem Statement

Travelers using the Tbilisi Travel Telegram WebApp currently view routes as a heavy, single-page vertical scrolling feed. On mobile devices, this scroll-heavy layout lacks visual immersion, does not provide persistent progress tracking as users move from stop to stop, and fails to deliver the fast, modern "Stories UX" touch experience expected in Telegram WebApps.

## Solution

Refactor the Next.js TWA route interface into a 60fps horizontal swipe carousel powered by Swiper.js. The interface presents:
- **Slide 0 (Route Intro Card):** A cover page displaying route metadata, terrain overview, description, and a prominent sticky bottom `[ START ROUTE ➔ ]` CTA button.
- **Slide 1..N (Stop Cards):** Individual stop cards featuring timing recommendations, Olya's local tips, photo spot recommendations, terrain warning alerts, and map app deep links.
- **Sticky Bottom Navigation Bar:** An auto-centering scrollable timeline bar with numbered node indicators (`1`..`N`), active ring highlight, green checkmark fill for visited stops, and a circular 56x56px Visited `[ ✓ ]` FAB that updates `localStorage` and triggers auto-swiping to the next stop card.
- **Rich 19-Stop Dataset:** Full 19-stop "Old Tbilisi Heartbeat" route dataset with tailored sub-route derivative matching.

## User Stories

1. As a traveler opening a route in Telegram WebApp, I want to see a Route Intro Card with cover photo, tags, and summary, so that I can quickly preview the route overview before starting.
2. As a traveler on the Route Intro Card, I want a sticky "START ROUTE ➔" CTA button, so that I can immediately begin navigating the first stop.
3. As a traveler exploring a route, I want to swipe horizontally left and right between slides with 60fps mobile touch performance, so that navigation feels smooth and natural like Telegram Stories.
4. As a traveler reading a long stop description, I want vertical scrolling inside the stop card body to be isolated from horizontal swiping, so that scrolling text does not accidentally switch cards.
5. As a traveler at a designated stop, I want to see Google Maps and Yandex Maps universal deep-link buttons, so that I can launch turn-by-turn navigation in my preferred map app.
6. As a traveler at a stop, I want to read Olya's Local Tip in a styled callout box, so that I get authentic local insider recommendations.
7. As a traveler navigating a stop, I want to see clear logistics and terrain warnings, so that I am prepared for steep inclines or cobblestone paving.
8. As a traveler at a stop, I want to view designated photo spot highlights and best time-of-day tips, so that I can take the best photos.
9. As a traveler, I want a sticky bottom timeline bar showing numbered nodes for all stops on the route, so that I can see my exact progress through the route.
10. As a traveler on a route with many stops (up to 19), I want the bottom timeline bar to automatically scroll and center on my current active stop node, so that nodes remain clearly readable on small screens.
11. As a traveler, I want to tap any numbered node on the bottom timeline bar, so that I can jump directly to that specific stop card.
12. As a traveler visiting a stop, I want to tap the circular Visited FAB [ ✓ ], so that I can mark the stop completed and automatically advance to the next stop card.
13. As a traveler completing the final stop of a route, I want tapping the Visited FAB [ ✓ ] to mark the stop visited and display a completion message without attempting to auto-swipe past the end.
14. As a traveler, I want my visited stops to persist in localStorage per route, so that my checked-off progress is remembered when I close and re-open the Telegram WebApp.
15. As a Telegram WebApp user, I want the WebApp viewport to expand automatically on load, so that I have maximum screen real estate for the card carousel.
16. As a traveler matching routes via Telegram Bot filter choices, I want the matching engine to support both the master 19-stop route and tailored sub-routes, so that I receive recommendations tailored to my preferred duration, accessibility, and vibe.

## Implementation Decisions

- **Domain Language Alignment:** Canonical terminology updated in [CONTEXT.md](file:///Users/danilaalexeev/Desktop/Projects/tbilisi-travel-twa/CONTEXT.md) (`Route Intro Card`, `Stop Card`, `Visited State`, `Card`).
- **Carousel Engine:** Swiper.js (`swiper` React component) selected for horizontal gesture isolation, touch acceleration, and programmatic navigation control (`slideTo`, `slideNext`). Recorded in [ADR 0004](file:///Users/danilaalexeev/Desktop/Projects/tbilisi-travel-twa/docs/adr/0004-swiper-js-horizontal-carousel.md).
- **State Management & Persistence:** Visited stop IDs per route stored in browser `localStorage` using key format `tbilisi_visited_[routeId]`.
- **Bottom Navigation Component:** Auto-centering scrollable timeline container holding node buttons (`1`..`N`) with active ring styles, visited checkmark badges, and sticky Visited `[ ✓ ]` FAB button.
- **Dataset Expansion:** 19-stop master dataset ("Old Tbilisi Heartbeat") added to `lib/data/routes.ts` with complete coordinates, timing, Olya's tips, photo spots, and terrain notes, along with sub-route definitions for constraint matching.
- **Gesture Isolation:** Body overflow and touch actions configured (`touch-action: pan-y` on card body scroll area) to prevent webview drag conflicts.

## Testing Decisions

- **Testing Principles:** Tests evaluate external user-visible behavior (slide transition, active node highlighting, localStorage state persistence, button interactions) rather than internal implementation details.
- **Target Modules:**
  - `app/twa/[routeId]/page.tsx` (Integration tests for carousel rendering, slide jumping, visited FAB toggles, and intro card CTA).
  - `lib/engine/matcher.ts` (Unit tests for 19-stop route dataset matching across duration, accessibility, and vibe constraints).
- **Prior Art:** `__tests__/timeline.test.tsx` and `__tests__/matcher.test.tsx` using `Vitest` and `@testing-library/react`.

## Out of Scope

- Native device GPS live tracking inside the webview (universal map deep-links used per ADR 0001).
- Server database synchronization for user visited states (client-side `localStorage` used per offline design principles).
- Custom video playback inside cards.

## Further Notes

- Bundle size impact of `swiper` dependency is ~38KB gzipped, keeping total application JS bundle well under the 150KB constraint for fast mobile loading.
