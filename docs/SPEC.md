# Product Specification: Radical UI Overhaul for Tbilisi Travel TWA

## Problem Statement

The Tbilisi Travel Telegram Web App (TWA) suffers from visual noise, nested borders ("frames inside frames"), badge overload across route cards, decorative ASCII strings ("--- ~~~ ---"), a wavy progress tracker line, serif typography font mixing (`Playfair Display` mixed with `Geist Sans`), and detached map action buttons. These elements clutter the interface, increase cognitive load for mobile travelers browsing routes outdoors, and detract from a sleek, native app experience.

## Solution

Perform a radical UI/UX refactoring across the entire application (both catalog/home pages and route step detail pages). Eliminate all inner nested borders in favor of whitespace and subtle background tinting (`#F3EFEA`). Cap route catalog tags to a maximum of 2 essential badges per card. Replace food item pill buttons with a clean, unbordered bulleted text list. Unify typography 100% under `Geist Sans` (`var(--font-sans)`), converting headings to standard Sentence case. Straighten the step tracker line in `TimelineBar.tsx`, replace decorative ornaments with ultra-thin 1px dividers with 10% opacity, and group map provider buttons directly underneath location titles for immediate accessibility.

## User Stories

1. As a traveler browsing walking routes on a mobile screen, I want route cards to display a maximum of 2 essential badges (duration and difficulty), so that I can evaluate options without tag clutter.
2. As a traveler viewing route summaries, I want long rows of hashtags (#Cultural, #Insta-Locations) removed from catalog cards, so that the card layout remains visually clean and lightweight.
3. As a traveler navigating a route step card, I want food recommendations to appear as a clean bulleted text list rather than clickable pill buttons, so that I can read menu recommendations effortlessly without border overload.
4. As a traveler reading curator callouts (Olya's recommendations, photo spots, logistics warnings, and route at a glance), I want inner borders ("frames inside frames") removed and replaced with soft background tinting (`#F3EFEA`), so that content sections are separated smoothly by whitespace.
5. As a traveler using the app in mobile webview, I want all headers and titles to use a single modern Sans-serif font (`Geist Sans`), so that the interface feels cohesive and natively integrated with Telegram.
6. As a traveler reading section headings, I want titles formatted in standard Sentence case ("Historical overview", "Olya's recommendation", "Route filters") rather than ALL CAPS, so that reading feels natural and less jarring.
7. As a traveler checking route progress, I want a straight, sleek horizontal step tracker line instead of a wavy/zigzag path, so that I can easily gauge my step location at a glance.
8. As a traveler navigating a stop card, I want Map links (Google Maps, Yandex Maps) positioned directly below the location title and address, so that I can launch directions immediately.
9. As a traveler reviewing a stop card, I want the "Share Stop" button and "Visited" status badge aligned into a single top header toolbar row, so that status actions are grouped logically.
10. As a traveler reading through cards, I want decorative ASCII strings ("--- ~~~ ---", "· ~~~ ·") replaced with ultra-thin 1px 10% opacity line dividers, so that visual noise is minimized.
11. As a traveler browsing secondary section headers, I want decorative emojis stripped from section titles, so that the editorial layout remains clean and uncluttered.
12. As a traveler using the TWA outdoors, I want high contrast and generous padding (`p-4` / `p-5`) around callout blocks, so that information is easily readable under bright sunlight.

## Implementation Decisions

### Typography & Formatting
- **100% Sans-Serif Unification**: Deprecate `Playfair Display` (`var(--font-serif)`) across `app/page.tsx`, `RouteCatalog.tsx`, `RouteIntroCard.tsx`, and `StopCard.tsx`. Enforce `var(--font-sans)` (`Geist Sans`) for all titles, headings, and body text. Update `DESIGN_SYSTEM.md`.
- **Sentence Case Headings**: Convert ALL CAPS headings ("HISTORICAL OVERVIEW", "OLYA'S RECOMMENDATION", "ROUTE FILTERS & SORTING", "ROUTE AT A GLANCE") to Sentence case ("Historical overview", "Olya's recommendation", "Route filters", "Route at a glance"). Retain ALL CAPS strictly for tiny 1-2 word status badges (11px, letter-spacing 0.06em).

### Container Borders & Background Architecture
- **Zero Nested Borders**: Remove `border` and `outline` styles from all nested inner container blocks (`Olya's Recommendation`, `Photo Spot`, `Logistics Warning`, `Route at a Glance`, `Route Filters`).
- **Subtle Background Tinting**: Apply `#F3EFEA` background tint with `rounded-2xl` and `p-4`/`p-5` spacing on nested callouts against `#FAF7F2` canvas and `#FFFFFF` top-level cards.

### Badges & Content Lists
- **Catalog Route Cards**: Limit tags to max 2 essential badges per route card (`Duration` and `Difficulty`/`Logistics`). Remove hashtag arrays from catalog card displays.
- **Stop Detail Cards**: Convert `recommendedDishes` pill buttons (`<button className="rounded-full border ...">`) into an unbordered vertical bulleted text list (`• Item 1`).

### Geometry, Progress Tracker & Header Toolbar
- **Straight Step Tracker**: Replace `GEORGIAN_WAVE_PATH` SVG in `TimelineBar.tsx` with a straight horizontal progress track line (`bg-[#C4572A]` filled / `bg-[#1C1008]/10` track).
- **Clean Dividers**: Replace ASCII decorative strings with 1px solid dividers with 10% opacity (`border-[#1C1008]/10` or `bg-[#1C1008]/10`).
- **Emoji Reduction**: Remove non-essential decorative emojis from section headings in favor of clean Sentence case text headers.
- **Proximity & Action Bar Placement**: Align `Share Stop` button and `Visited` status badge into a single top header toolbar row in `StopCard.tsx`. Move Google Maps and Yandex Maps provider buttons directly underneath location titles and address metadata.

## Testing Decisions

### Good Test Principles
- Test external component DOM structure, rendered text, and visual hierarchy attributes without binding to fragile private state.
- Ensure all 165+ existing unit tests pass cleanly after refactoring component markup and styling.

### Tested Modules
- `components/RouteCatalog.tsx`: Verify max 2 badges per card, removal of hashtag rows, and Sentence case section headers.
- `components/RouteIntroCard.tsx`: Verify unbordered `Route at a Glance` callout block (`#F3EFEA`), zero nested borders, and ultra-thin line dividers.
- `components/StopCard.tsx`: Verify top toolbar alignment (`Share Stop` & `Visited`), map buttons under title, unbordered callout containers (`#F3EFEA`), bulleted dish text list (`• Item`), and single Sans-Serif font usage.
- `components/TimelineBar.tsx`: Verify straight horizontal step tracker line without SVG wave path.
- `lib/theme/tokens.ts` & `app/globals.css`: Verify typography token definitions and container styling tokens.

### Prior Art
- Vitest suite in `__tests__/homePage.test.tsx`, `__tests__/timeline.test.tsx`, `__tests__/ui.test.tsx`, `__tests__/tokens.test.ts`.

## Out of Scope
- Backend route matching logic changes in `lib/engine/matcher.ts`.
- Routing structure or URL scheme changes under `app/twa/[routeId]`.
- Map coordinate calculations or universal link parameter formats in `lib/utils/maps.ts`.

## Further Notes
- The Georgia travel journal warmth is preserved through warm stone tinting (`#F3EFEA`), terracotta accents (`#C4572A`), and clean geometry.
