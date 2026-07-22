# UI Refactor & Minimalist 2-Color Design System Spec

## Problem Statement

The current Telegram Web App (TWA) route details and stop card UI layout significantly deviates from the architectural wireframes in `/docs/update.md`. The design features redundant vertical timeline lines on individual stop cards alongside the bottom timeline bar, buries external map provider links inside a bottom sheet modal, clutters text over hero images, and relies on an overly noisy multi-color scheme (emerald, amber, terracotta, slate, warm stone), causing an inconsistent and unpolished user experience for travelers in Tbilisi.

## Solution

Refactor the Next.js TWA route carousel components ([`RouteIntroCard.tsx`](file:///Users/danilaalexeev/Desktop/Projects/tbilisi-travel-twa/components/RouteIntroCard.tsx), [`StopCard.tsx`](file:///Users/danilaalexeev/Desktop/Projects/tbilisi-travel-twa/components/StopCard.tsx), [`TimelineBar.tsx`](file:///Users/danilaalexeev/Desktop/Projects/tbilisi-travel-twa/components/TimelineBar.tsx), and [`globals.css`](file:///Users/danilaalexeev/Desktop/Projects/tbilisi-travel-twa/app/globals.css)) to strictly align with `/docs/update.md` wireframe layouts and establish a 2-color minimalist design system:
- **Color Palette**: 2-Color Accent system using Off-White warm stone (`#FAFAF7`) / Charcoal Slate (`#1F2421`) base with a single Terracotta accent (`#E07A5F`). Uniform 1px bordered cards for callout blocks (Olya's Tips, Photo Spot, Logistics Warning) instead of multi-color fills.
- **Route Intro Card (Slide 0)**: Uncluttered top hero cover photo, with pill tags, title, subtitle, Olya's Welcome quote card, Route At A Glance summary line, and sticky `[ START ROUTE ➔ ]` CTA button arranged sequentially below the photo.
- **Stop Card (Slide 1..N)**: Full-width card layout without vertical timeline spine, embedding direct map deep link pills (`📍 Google Maps | 📍 Yandex Maps`) directly underneath the location head photo, followed by timing, Olya's Tip quote, Photo Spot, and Logistics & Terrain callout blocks.
- **Sticky Timeline Bar**: Frosted backdrop navigation bar with line-connected progress nodes (`●━━━━━━━○━━━━━━━○`), terracotta active ring, checkmarks for visited stops, and a 56x56px circular Terracotta FAB `[ ✓ ]` with auto-swipe behavior.

## User Stories

1. As a Tbilisi traveler opening a TWA route, I want to see a clean, minimalist 2-color UI design system so that the interface feels calm, high-end, and easy to read on mobile devices.
2. As a traveler viewing the Route Intro Card (Slide 0), I want an unobstructed top Hero Cover photo so that I can immediately visualize the landscape of the route without text overlapping the photo.
3. As a traveler on the Route Intro Card, I want to see clear pill badges (duration, accessibility, vibes) positioned directly below the hero photo so that I can evaluate key route details at a glance.
4. As a traveler on the Route Intro Card, I want a dedicated "Route Welcome" callout card containing Olya's warm local intro text so that I understand the thematic context of the route before starting.
5. As a traveler on the Route Intro Card, I want a "Route At A Glance" summary bar highlighting the number of curated stops, total walking distance, and transit modes (e.g. Cable Car / Funicular) so that I know what to expect.
6. As a traveler on the Route Intro Card, I want a sticky bottom CTA button ("START ROUTE ➔") that moves me to Slide 1 upon tapping or swiping left.
7. As a traveler viewing a Stop Card (Slide 1..N), I want a full-width card layout without vertical spine lines on the left side so that card content is clutter-free and easy to digest.
8. As a traveler on a Stop Card, I want map provider deep links (`📍 Google Maps | 📍 Yandex Maps`) placed directly beneath the location head photo so that I can instantly open my preferred mapping app without opening extra modals.
9. As a traveler on a Stop Card, I want a clear header showing the stop sequence index (`STOP X OF N`), location name, and recommended timing window so that I stay on schedule.
10. As a traveler on a Stop Card, I want an "Olya's Tip" callout box styled with a minimal terracotta accent line so that local expert recommendations stand out cleanly.
11. As a traveler on a Stop Card, I want a dedicated "Photo Spot" callout section highlighting exact photo angles and lighting recommendations.
12. As a traveler on a Stop Card, I want a "Logistics & Terrain" warning callout alerting me to steep cobblestone inclines or stairways.
13. As a traveler navigating between stops, I want a sticky bottom timeline bar displaying connected progress nodes so that I can see my position along the route.
14. As a traveler navigating between stops, I want tapping any progress node in the timeline bar to jump directly to that Stop Card slide.
15. As a traveler at a stop, I want a 56x56px circular floating action button (FAB) marked `[ ✓ ]` so that I can toggle the Visited State for the current stop.
16. As a traveler marking a stop as visited via the FAB, I want the carousel to automatically swipe to the next Stop Card slide so that navigation feels smooth and continuous.
17. As a traveler completing all stops along a route, I want a route completion banner displayed on the bottom bar acknowledging that all stops have been visited.
18. As a traveler returning to the TWA across sessions, I want my Visited State preserved in local storage so that my progress is retained.

## Implementation Decisions

- **Design System & Tokens**: Update `app/globals.css` to define the 2-color minimalist CSS variables (`--twa-bg-color`, `--twa-text-color`, `--terracotta`, `--tbilisi-slate`, neutral borders).
- **RouteIntroCard component**: Refactor structure to place `heroImage` clean at top, followed by tags row, title/subtitle block, `introCopy` callout box, `ROUTE AT A GLANCE` section, and sticky bottom `START ROUTE` CTA container.
- **StopCard component**: Remove the vertical timeline line/node from the left side of individual stop cards. Place direct map link pills right below the head photo. Style `olyaTips`, `photoSpot`, and `logisticsWarning` blocks with clean white/off-white backgrounds, subtle 1px border lines, and crisp iconography.
- **TimelineBar component**: Style progress nodes with a connecting line asset, active terracotta ring (`ring-2 ring-[var(--terracotta)]`), checkmarks for visited stops, and a 56x56px Terracotta FAB button (`[ ✓ ]`).
- **RouteCarousel component**: Coordinate horizontal Swiper slide transitions, timeline bar visibility on `activeIndex > 0`, FAB toggle actions, and local storage state persistence.

## Testing Decisions

- **Testing Seam**: Component Integration Seam in `__tests__/timeline.test.tsx` using Vitest and `@testing-library/react`.
- **Test Criteria**: Tests verify external behavior, DOM elements, aria attributes, user click events, local storage state persistence, and slide navigation. Implementation details (such as CSS class names or internal component state setters) are excluded from assertions.

## Out of Scope

- Backend API route changes (`/app/api/bot/route.ts`).
- Server database schema mutations (Visited State is kept in client `localStorage` per spec).
- Adding new map providers beyond Google Maps and Yandex Maps.

## Further Notes

- Follows the project domain glossary in [`CONTEXT.md`](file:///Users/danilaalexeev/Desktop/Projects/tbilisi-travel-twa/CONTEXT.md) (`Route`, `Route Intro Card`, `Stop Card`, `Visited State`, `Stop`, `Map Provider`, `Olya's Tips`, `Logistics Warning`).
