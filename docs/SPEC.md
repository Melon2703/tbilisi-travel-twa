# Product Specification: Curated Travel Route Guide & Establishment Integration

## Problem Statement

Travelers using the Tbilisi Travel Telegram Web App (TWA) lack granular, curated details about food and beverage establishments along walking routes, such as cuisine types, dish recommendations, and personal booking tips from local curator Olya. Furthermore, non-food stops (viewpoints, monuments, cable cars) risk being cluttered by empty dining fields if a uniform schema is used, while general route discovery lacks clear duration filtering (`1-2h`, `3-4h`, `half-day`, `full-day`), vibe tags (`cultural`, `insta-locations`, `hiking`), geo-proximity matching, multi-photo swipe lightboxes, and stop-level deep-link sharing.

## Solution

A refined polymorphic data architecture for walking route **Stops** (`AttractionStop` vs `VenueStop`) paired with an upgraded **Route Intro Card** (Slide 0) overview and continuous scrollable **Stop Cards** (Slides 1..N). Venues are integrated as optional **Pitstops** on the timeline, featuring Olya's personal tips, recommended dish pills, category badges (`☕ Cafe`, `🍷 Bar`, `🍽️ Restaurant`), and veggie indicators (`🌱 Veggie Friendly`). The UI features dynamic geo-proximity sorting, a full-screen multi-photo swipe lightbox, high-contrast light theme support, and native Telegram startapp deep links (`t.me/bot?startapp=route_X_stop_Y`) for stop-level sharing.

## User Stories

1. As a traveler browsing walking routes, I want to see a visual overview map and stop timeline on the initial landing slide (Route Intro Card), so that I can evaluate the entire walk before starting.
2. As a traveler with limited time, I want to filter routes by explicit duration options (`1-2 Hours`, `3-4 Hours`, `Half-Day`, `Full-Day`), so that I can pick an itinerary matching my schedule.
3. As a photography enthusiast, I want to filter routes by the `Insta-Locations` vibe tag, so that I can quickly find visually stunning viewpoints and courtyards.
4. As a traveler interested in architecture and museums, I want to filter routes by the `Cultural` vibe tag, so that I can explore historical monuments.
5. As an outdoor walker, I want to filter routes by the `Hiking` vibe tag, so that I can find scenic trails and hillside paths.
6. As a traveler seeking an easy walk, I want to filter routes by the `Easy Route` accessibility level, so that I can avoid steep stairs and severe inclines.
7. As a traveler standing in Old Tbilisi, I want routes to be sorted relative to my current geo-location, so that I can immediately start the nearest available route.
8. As a traveler viewing a Stop Card, I want to tap any photo to open a full-screen swipeable lightbox modal, so that I can view high-resolution photography for that stop.
9. As a traveler visiting a coffee shop or restaurant along a route, I want to see Olya's recommended dishes as interactive pills, so that I know what signature items to order.
10. As a diner with dietary preferences, I want to see a clear `🌱 Veggie Friendly` badge on venue cards, so that I can quickly identify vegetarian-friendly stops.
11. As a traveler planning a lunch or dinner stop, I want to see Olya's venue booking advice, so that I know whether to reserve a table in advance.
12. As a traveler following a route, I want food and drink spots to be styled as optional "Pitstops", so that I can bypass them when I am not hungry without breaking route momentum.
13. As a traveler navigating sequential stops, I want transit steps (such as the Cable Car from Rike Park to Mother of Georgia) to be clearly separated into distinct sequential nodes with transit duration badges, so that logistics remain clear.
14. As a traveler exploring in bright sunlight, I want a high-contrast light theme option, so that screens are easy to read outdoors.
15. As a traveler meeting friends on a route, I want to tap a "Share Stop" button to generate a Telegram deep link, so that my friends can open the TWA directly on that specific stop.
16. As a traveler checking navigation, I want direct Map Links to Google Maps and Yandex Maps below the rating score, so that I can launch external directions in one tap.
17. As a traveler scrolling a Stop Card, I want all details (Olya's tips, fun facts, dish picks, map links) to be rendered on a single continuous scrolling page, so that I do not have to toggle collapsible accordions.

## Implementation Decisions

### Schema & Data Architecture
- **Polymorphic Stop Model (`lib/types/route.ts`):** Defined a discriminated union `Stop = AttractionStop | VenueStop` with `stopType: 'attraction' | 'venue'`.
- **Venue Details Block:** `VenueStop` includes an optional `venueDetails` object:
  ```typescript
  export interface VenueDetails {
    category: 'cafe' | 'restaurant' | 'bar' | 'wine_bar';
    cuisines: ('georgian' | 'european' | 'asian')[];
    isVegetarianFriendly: boolean;
    recommendedDishes: string[];
    bookingAdvice?: string;
  }
  ```
- **Pitstop Flag:** `VenueStop` items carry `isOptional: true` and are styled as optional Refuel Pitstops on the route timeline.
- **Transit Node Metadata:** `AttractionStop` items support an optional `transitBadge?: string` (e.g. `" Cable Car Ride (~5 min)"`) to represent transit transitions.

### UI & Layout Hierarchy
- **Route Intro Card (Slide 0):** Upgraded to render an interactive route map line + step-by-step preview list.
- **Stop Card Surface:** Uses Swiper.js for horizontal card navigation while allowing vertical scrolling inside each card.
  - Header: Image Gallery Carousel + Title + Neighborhood + Duration Tag.
  - Badges: Category & Cuisine pills for venues (`☕ Cafe • Georgian`).
  - Olya's Tip Block: Highlighted warm accent container with Olya's personal advice.
  - Story & Must-Try Dishes: Concise 2-sentence background / `💡 Fun Fact` for attractions; dish pills & booking advice for venues.
  - Action Bar: `📍 Open Map` deep-link button + `↗️ Share Stop` button.
- **Lightbox Modal:** Full-screen modal component with touch swipe gestures and photo index indicator (`1/N`).
- **Telegram Startapp Deep Linking:** Uses Telegram WebApp start parameter encoding (`t.me/bot?startapp=route_<id>_stop_<id>`).

## Testing Decisions

### Good Test Principles
- Test external domain behavior and user interactions, not internal state setters or implementation details.
- Verify matching algorithms against hard and soft constraint rules across edge-case combinations.
- Test component rendering under both `AttractionStop` and `VenueStop` schemas.

### Tested Modules
- `lib/engine/matcher.ts`: Route matching with updated `DurationCategory` (`1-2h`, `3-4h`, `half-day`, `full-day`), `VibeCategory` (`cultural`, `insta-locations`, `hiking`), and geo-proximity distance calculations.
- `components/timeline/TimelineSlide.tsx`: Continuous scrollable card rendering for both attraction and venue stops.
- `components/timeline/LightboxModal.tsx`: Image gallery popup and swipe navigation.
- `lib/utils/telegram.ts`: Startapp deep-link generation and payload decoding.

### Prior Art
- Existing Vitest suite in `__tests__/matcher.test.ts` and `__tests__/timeline.test.tsx`.

## Out of Scope
- Direct in-app table reservation forms or third-party booking API integrations (outsource to Instagram/Website links).
- In-app food ordering or payment processing.
- Live GPS turn-by-turn navigation (outsource to Google Maps & Yandex Maps universal links).

## Further Notes
- All venue recommendations maintain Olya's warm, personal tone.
- Static data files (`lib/data/routes.ts`) will be populated with Tbilisi route data matching this updated schema.
