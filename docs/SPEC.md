# Technical Specification: Tbilisi Curated Travel Route Service MVP

## Problem Statement

Travelers exploring Tbilisi, Georgia face a severe "Context Crisis." The city's unique geography — featuring 30° steep hill inclines in Sololaki and Vera, uneven cobblestones in Old Kala, high summer heat, and spotty cellular reception in deep stone courtyards — creates hidden physical barriers for different demographic groups (e.g., families with strollers, elderly travelers, casual strollers). Additionally, travelers struggle to discover authentic, curated local experiences (hidden courtyards, photo spots, polyphonic dining) matching their specific available time and aesthetic preferences without drowning in generic review apps or suffering heavy mobile battery drain from complex map applications.

## Solution

A high-performance, lightweight dual-interface service built as a unified Next.js monorepo delivered via Telegram:
1. **Interactive Telegram Bot Funnel**: A 3-step conversational filter (`Duration` → `Logistics Constraint` → `Vibe`) that matches travelers to curated walking routes using a hard-constraint logistics filter and soft-constraint preference relaxation.
2. **Telegram Web App (TWA) Mini-App**: A fast-loading, server-side rendered vertical **Card** timeline presenting **Olya's Tips**, **Logistics Warnings**, estimated stop durations, and photo spots.
3. **Card-to-Nav Architecture**: A zero-lag navigation mechanism that opens exact GPS coordinates directly in native mobile apps (Google Maps, Apple Maps, Yandex Maps) via universal links, avoiding heavy embedded mobile WebGL maps.

## User Stories

1. As a traveler with a baby stroller, I want to filter routes by stroller accessibility, so that I never get stuck facing steep 30° stone staircases or impassable cobblestone hills in Sololaki.
2. As an elderly traveler, I want clear logistics warnings on steep inclines and uneven pavement, so that I can safely navigate walking routes at my own pace.
3. As a busy traveler with only 2 hours available, I want to filter routes by duration, so that I can complete a curated walk within my tight schedule.
4. As a photography enthusiast, I want to select a photo-spot vibe filter, so that I am guided directly to Tbilisi's most aesthetic courtyards and viewpoints.
5. As a food lover, I want to select a culinary and wine vibe filter, so that my route includes authentic local taverns and polyphonic dance dining stops.
6. As a Telegram user, I want to interact with a stateless 3-step filter funnel using inline keyboard buttons, so that I can find a recommended route in seconds without filling out forms.
7. As a traveler entering the Bot funnel, I want to receive warm, conversational messages in Olya's personal voice, so that the recommendation feels like a recommendation from a local friend.
8. As a traveler whose specific filter combination yields no exact match, I want the system to safely relax soft constraints (Vibe/Duration) while preserving hard accessibility rules, so that I always receive a safe and enjoyable route recommendation.
9. As a Telegram Mini-App user, I want the TWA interface to match Telegram's active light/dark color scheme, so that the Mini-App feels native to the messaging app.
10. As a traveler viewing a route timeline in the TWA, I want to see a vertical feed of Stop Cards ordered chronologically, so that I can easily follow the route step-by-step.
11. As a traveler at a specific Stop, I want to read Olya's personal tips and visual recommendations, so that I gain rich local context and hidden details about the location.
12. As a traveler ready to move to the next Stop, I want to tap "Open in Maps" on a Card, so that I can launch my preferred native mapping application with exact latitude/longitude coordinates.
13. As an iOS Telegram user, I want an easy option to open navigation in Apple Maps or Google Maps, so that turn-by-turn navigation opens seamlessly in my preferred iOS app.
14. As an Android Telegram user, I want an easy option to open navigation in Google Maps or Yandex Maps, so that navigation launches reliably in my default Android map app.
15. As a repeat traveler, I want the TWA to remember my preferred Map Provider in local storage, so that future "Open in Maps" taps open directly without prompting every time.
16. As a traveler using Telegram's native navigation header, I want the TWA BackButton to seamlessly return me to the route selector or close the webview, so that screen real estate is maximized.
17. As a traveler experiencing spotty mobile network in deep Tbilisi courtyards, I want static SSR timeline pages that load instantaneously without client-side data fetching spinners, so that the app works reliably in low-connectivity areas.
18. As a content curator (Olya), I want route data stored in a strongly-typed JSON structure, so that new routes, stops, and tips can be added and deployed without database management.

## Implementation Decisions

1. **Unified Next.js App Router Architecture**:
   - Single repository hosting both the Telegram Bot Webhook endpoint and the Telegram Web App timeline pages.
   - Standard static local JSON data store stored at a central location.

2. **Stateless Bot Webhook & Callback Payload Routing**:
   - Telegram Bot Webhook processes incoming `Message` and `CallbackQuery` updates.
   - Filter state is encoded statefully inside inline keyboard callback data strings (e.g. `dur:1-2h|acc:stroller|vibe:photo-spots`).
   - Serverless execution on Vercel requires zero persistent session memory or Redis databases.

3. **Constraint-Based Route Matching Engine**:
   - Hard Constraint: `Logistics Constraint` (Accessibility: `stroller-friendly` vs `moderate` vs `steep-stairs`). If a user requests `stroller-friendly`, routes containing `steep-stairs` are strictly excluded.
   - Soft Constraints: `Duration Category` (`1-2h`, `2-4h`, `half-day`) and `Vibe` (`photo-spots`, `courtyards`, `food-wine`, `architecture`).
   - If no exact match satisfies all three parameters, the engine selects the best match with matching accessibility, relaxing vibe/duration, and appends Olya's clarification note to the Bot response message.

4. **Data Schema Shape**:
   ```ts
   export type DurationCategory = '1-2h' | '2-4h' | 'half-day';
   export type AccessibilityLevel = 'stroller-friendly' | 'moderate' | 'steep-stairs';
   export type VibeCategory = 'photo-spots' | 'courtyards' | 'food-wine' | 'architecture';

   export interface Stop {
     id: string;
     order: number;
     name: string;
     neighborhood: string;
     coordinates: { lat: number; lng: number };
     estimatedMinutes: number;
     imageUrl: string;
     olyaTips: string;
     logisticsWarning?: string;
     bestTimeOfDay?: string;
   }

   export interface Route {
     id: string;
     title: string;
     subtitle: string;
     durationCategory: DurationCategory;
     accessibility: AccessibilityLevel;
     vibes: VibeCategory[];
     heroImage: string;
     introCopy: string;
     stops: Stop[];
   }
   ```

5. **Card-to-Nav Deep-Link Provider Sheet**:
   - TWA Card "Open in Maps" button launches a lightweight modal bottom sheet presenting universal links:
     - Google Maps: `https://www.google.com/maps/search/?api=1&query={lat},{lng}`
     - Apple Maps: `https://maps.apple.com/?q={lat},{lng}`
     - Yandex Maps: `https://yandex.com/maps/?pt={lng},{lat}&z=17`
   - Choice is saved in browser local storage.

6. **Telegram WebApp SDK Integration**:
   - `window.Telegram.WebApp` initialized via context wrapper.
   - Root CSS variables synchronized to Telegram theme palette (`--twa-bg-color`, `--twa-text-color`, `--twa-button-color`, etc.).
   - Fallback design system palette applied for non-Telegram web browsers:
     - Terracotta: `#C85A32`
     - Tbilisi Slate: `#1F2421`
     - Warm Stone: `#F7F4EF`
     - Golden Amber: `#E29578`

## Testing Decisions

1. **Test Seam 1: Route Matching Logic (Unit Tests)**:
   - Test external behavior of the route matcher given exact filter matches, edge cases, and soft-constraint relaxation scenarios.
   - Verify hard accessibility constraints are never violated under any combination.

2. **Test Seam 2: Bot Webhook Handler (Integration Tests)**:
   - Send simulated Telegram API POST updates (`/start`, callback queries) to the API route handler.
   - Verify correct inline keyboard callback data generation and final WebApp button URL generation.

3. **Test Seam 3: TWA Timeline SSR & Card Rendering (Component/Page Tests)**:
   - Test timeline page rendering given valid route IDs and missing route IDs (404 fallback).
   - Test Map Provider selection bottom sheet behavior and local storage persistence.

## Out of Scope

- Payment gateways, token logic, monetization, or paywalls.
- Audio guide streaming, voice notes, or speech synthesis.
- Live GPS user location tracking / real-time turn-by-turn map canvas rendering inside TWA.
- User accounts, registration, login forms, or user route creation.
- Dynamic backend database management (PostgreSQL/Supabase).

## Further Notes

- All code implementation adheres strictly to the existing domain glossary in CONTEXT.md and architectural decisions in docs/adr/.

## Sub-issues

- [ ] #2
- [ ] #3
- [ ] #4
- [ ] #5

