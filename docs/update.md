🗺️ PROJECT_MASTER_SPEC.md — UI Refactor & Route Spec

1. Context & TaskGoal: Refactor existing Next.js (App Router) TWA frontend from a heavy vertical scroll feed into a lightweight, 60fps horizontal swipe carousel (Stories UX).Stack: Next.js, Tailwind CSS, Framer Motion / Swiper.js, Vercel Edge.

2. System Architecture Schematic
┌────────────────────────────────────────────────────────────────────────┐
│                        TELEGRAM CLIENT INTERFACE                       │
└────────────────────────────────────────────────────────────────────────┘
                        │                        │
         1. /start & Filter choice          2. Opens TWA Swipe UI
                        │                        │
                        ▼                        ▼
┌──────────────────────────────────┐   ┌─────────────────────────────────┐
│     Next.js Bot Webhook API      │   │      Next.js TWA Frontend       │
│      (/app/api/bot/route.ts)     │   │   (/app/twa/[routeId]/page.tsx) │
└──────────────────────────────────┘   └─────────────────────────────────┘
                        │                        │
                        └───────────┬────────────┘
                                    │
                                    ▼
                       ┌────────────────────────┐
                       │ Vercel Edge Serverless │
                       │ (Tested via ngrok)     │
                       └────────────────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
┌───────────────────────────┐                   ┌───────────────────────────┐
│  Google Maps Deep Links   │                   │   Yandex Maps Deep Links  │
└───────────────────────────┘                   └───────────────────────────┘


3. UI/UX Wireframe Schematics

📱 Slide 0: Route Intro Screen (Landing Preview)
+---------------------------------------------------+
| [✕] Tbilisi Travel Bot                      [...] |
+---------------------------------------------------+
|                                                   |
|             [ HERO COVER PHOTO ]                  |
|        (Freedom Square & Old Tbilisi)             |
|                                                   |
+---------------------------------------------------+
| [ Full Day ]   [ Moderate Terrain ]   [ Old Town ]
|
| The Ultimate Old Tbilisi Heartbeat Route
|  
| "Hey! Ready to explore Tbilisi's iconic core? From 
|  puppet clock shows to sulfur bath waterfalls and 
|  funicular sunset views. Take your time!"
|   
| ── ROUTE AT A GLANCE ─────────────────────────────
| 📍 19 Curated Stops | 👟 ~4.5 km | 🚠 Cable Car + Funicular
|  
| 👉 Swipe left or tap below to begin!
+---------------------------------------------------+
| [ START ROUTE ➔ ]                                 | <-- Sticky Bottom CTA
+---------------------------------------------------+

📱 Slide 1..19: Location Card Component
+---------------------------------------------------+
| [✕] Old Tbilisi Walking Route               [...] |
+---------------------------------------------------+
|                                                   |
|            [ LOCATION HEAD PHOTO ]                |
|                                                   |
| ┌──────────────────────────────────────────────┐  |
| │ 📍 Google Maps 4.8 ⭐ │ 📍 Yandex Maps 4.9 ⭐ │  | <-- Deep links to map apps
| └──────────────────────────────────────────────┘  |
+---------------------------------------------------+
| STOP 4 OF 19
| Gabriadze Puppet Theater & Clock
| 
| ⏱️ Recommended Timing: 11:45 AM - 12:15 PM
|  
| 💬 OLYA'S LOCAL TIP
| ┌──────────────────────────────────────────────┐  |
| │ "Be here by 11:50 AM! At exactly 12:00 PM,   │  |
| │ the tiny angel comes out to strike the bell, │  |
| │ followed by 'The Cycle of Life' puppet show."│  |
| └──────────────────────────────────────────────┘  |
|
| 📸 Photo Spot
| Stand on the cobblestones right opposite the leaning 
| tower for the best wide-angle portrait light.
|
| ⚠️ Logistics & Terrain
| Flat paving around Shavteli St. Very crowded at noon.
|
+---------------------------------------------------+
|  ●━━━━━━━○━━━━━━━○━━━━━━━○             [  ✓  ]    | <-- Sticky Bottom Bar
| (1..3)  (4)     (5)   (6..19)     Mark as Visited |
+---------------------------------------------------+

4. UI/UX Interaction & Gesture SpecHorizontal Swipe (Left/Right): Switch between Route Intro (Slide 0) and Location Cards (Slide 1..19).Vertical Scroll: Restricted strictly inside active card body content.Sticky Bottom Navigation Bar:Left (Progress Nodes): (1) ── (2) ── (3). Active index highlighted with ring; visited index filled green with checkmark. Tapping a node jumps directly to that slide index.Right (Floating Action Button): 56x56px circular button [ ✓ ]. Toggling updates visited state and automatically triggers auto-swipe to next card.

5. Hero Route Dataset (19 Stops)#NameTimingTerrainOlya's Local Tip1Freedom Square09:00 AMFlatMeet under St. George statue. Baseline orient point.2Café Minda ~ Orbeliani Bazaar09:20 - 10:20 AMIndoorsLight-filled upper floor. Get fresh pastries & Georgian tea.3Orbeliani Flower Market10:25 - 10:45 AMStreetRenovated street stalls. Great vibrant morning photos.4Gabriadze Puppet Theater & Clock11:45 - 12:15 PMFlatArrive by 11:50 AM for 12:00 PM "Cycle of Life" puppet show.5Old Streets (Shavteli & Anchiskhati)12:15 - 12:45 PMCobblestonesPeep into 6th-century Anchiskhati church along the alley.6Sioni Cathedral12:50 - 01:10 PMPeacefulStep inside quietly. See Grapevine Cross of St. Nino.7Pardag Carpet Spot (Sioni Alley)01:10 - 01:25 PMPhoto SpotStand near hanging hand-woven carpets (pardags) for photos.8Bridge of Peace01:30 - 01:45 PMGlassGlass canopy bridge toward Rike Park. Modern contrast.9Rike Park01:45 - 02:00 PMFlat PavingPark lawns leading toward cable car lower station.10Metekhi & Gorgasali Monument View02:00 PMViewpointLook back across river for classic postcard cliff shot.11Cable Car to Mother of Georgia02:15 - 02:30 PMCable CarTap TravelCard/bank card at turnstile; glide up ridge.12Betlemi Church & Stairs Walk Down02:45 - 03:15 PMSteep DownWatch footing on old Betlemi cobblestone stairs; enjoy views.13Lunch at 144 Stairs / See36003:15 - 04:30 PMRest & DiningPanoramic rooftops. Try khachapuri and cold lemonade.14Abanotubani Sulfur Baths04:45 - 05:15 PMHistoricBrick domed bathhouses & warm sulfur vapors.15Legvtakhevi Waterfall Canyon05:15 - 05:35 PMBoardwalkWooden canyon boardwalk straight to the waterfall.16Fresh Pomegranate Juice Stand05:35 - 05:50 PMRefreshmentBuy freshly pressed ruby-red pomegranate juice at exit.17Zabron Sulfur Baths Facade05:50 - 06:15 PMArchitectureRoyal blue tile work facade of Zabron/Orbeliani baths.18Taxi / Funicular to Mtatsminda06:30 - 07:15 PMTransitHead to Chonkadze St, take steep Funicular tram up mountain.19Funicular Restaurant07:30 - 09:30 PMDinnerCity night lights, hot ponchiki (cream donuts), Georgian wine.

6. Technical ConstraintsExpand viewport via window.Telegram.WebApp.expand().Isolate gestures: prevent horizontal page drag when user scrolls vertically inside card content.Keep bundle size under 150KB for fast performance on mobile data inside deep courtyards.