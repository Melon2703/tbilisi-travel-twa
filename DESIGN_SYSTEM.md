# Tbilisi Travel TWA Design System

This document outlines the visual design language, design tokens, standard card component hierarchy, and styling guidelines for the Tbilisi Travel Telegram Web App (TWA).

---

## 1. Single Source of Truth (`lib/theme/tokens.ts`)

All reusable theme constants, spacing grids, typography tokens, and component dimensions are defined in [`lib/theme/tokens.ts`](file:///Users/danilaalexeev/Desktop/Projects/tbilisi-travel-twa/lib/theme/tokens.ts) and integrated via [`app/globals.css`](file:///Users/danilaalexeev/Desktop/Projects/tbilisi-travel-twa/app/globals.css).

```typescript
import { COLORS, TYPOGRAPHY, SPACING, COMPONENT_TOKENS } from '@/lib/theme/tokens';
```

---

## 2. Design Tokens

### 2.1 Color Palette

#### Base Palette (Warm Georgian Travel Journal)
- **Terracotta Primary (`--terracotta`, `#E07A5F`)**: Signature Georgian clay brick tone for links and primary buttons.
- **Terracotta Accent (`--terracotta-accent`, `#C4572A`)**: High-saturation accent for CTA buttons, badge text, and tip highlights.
- **Tbilisi Slate (`--tbilisi-slate`, `#1F2421`)**: Dark slate tone for headers, primary text, and dark theme fallbacks.
- **Warm Stone (`--warm-stone`, `#FAFAF7`)**: Off-white background for canvas and secondary containers.
- **Neutral Border (`--neutral-border`, `#E5E5E0`)**: Soft divider and card outline color.
- **Canvas Background (`--canvas-bg`, `#FAF7F2`)**: Warm background for TWA viewports.
- **Card Background (`--card-bg`, `#FFF8F3`)**: Warm paper tone for journal cards.
- **Tip Box Background (`--tip-box-bg`, `#FFF8F3`)**: Warm background container for curator callouts.
- **Tip Box Border (`--tip-box-border`, `rgba(196, 87, 42, 0.18)`)**: Subtle terracotta accent border.
- **Advisory Background (`advisoryBg`, `#FDECE2`)**: Warm alert tint for the Act Layer advisory surface (Logistics Warning, Stop Directive).
- **Advisory Border (`advisoryBorder`, `rgba(196, 87, 42, 0.25)`)**: Border of the advisory surface, with a 4px terracotta-accent left rule.
- **Success Accent (`--success-accent`, `#228255`)**: Emerald green for completed visited states and veggie badges.
- **Text Primary (`--text-primary`, `#1C1008`)**: Deep warm charcoal for high legibility.
- **Text Secondary (`--text-secondary`, `#7A6552`)**: Muted brown-slate for secondary metadata.

#### High-Contrast Outdoor Theme Support Tokens
For bright sunlight outdoor visibility:
- **Outdoor Text Primary (`--outdoor-text-primary`, `#1C1008`)**
- **Outdoor Terracotta (`--outdoor-terracotta`, `#C4572A`)**
- **Outdoor Success (`--outdoor-success`, `#228255`)**
- **Outdoor Badge BG (`--outdoor-badge-bg`, `#1C1008`)**
- **Outdoor Badge Text (`--outdoor-badge-text`, `#FFFFFF`)**
- **Outdoor Border Contrast (`--outdoor-border-contrast`, `rgba(28, 16, 8, 0.22)`)**

#### Third-Party & Brand Colors
- **Google Maps**: `#EA4335`
- **Yandex Maps**: `#FC3F1D`
- **Instagram**: `#E4405F`

---

### 2.2 Typography

- **Single Sans-Serif System**: 100% unified under Geist Sans (`var(--font-sans)`, `system-ui`, `-apple-system`, `sans-serif`) across all titles, headings, and body text.
- **Monospace (Coordinates / Metadata)**: `var(--font-mono)` (`Geist Mono`, `monospace`)

#### Sentence Case Headings & Status Badges
- **Section Headers**: All section headers (e.g. "Historical overview", "Olya's recommendation", "Route filters & sorting", "Route at a glance") are rendered in standard **Sentence case**.
- **ALL CAPS Usage**: ALL CAPS is used strictly for tiny status/order badges (11px, letter-spacing 0.06em, e.g. `STOP 1 OF 6`, `VISITED`, `1-2H`).

#### Font Sizes & Scale
- `xs`: `0.75rem` (12px)
- `sm`: `0.875rem` (14px)
- `base`: `1rem` (16px)
- `lg`: `1.125rem` (18px)
- `xl`: `1.25rem` (20px)
- `2xl`: `1.5rem` (24px)
- `3xl`: `1.875rem` (30px)

#### Font Weights
- `regular`: `400`
- `medium`: `500`
- `semibold`: `600`
- `bold`: `700`

#### Letter Spacing (Tracking)
- `badge`: `0.06em` (`uppercase tracking-[0.06em]` for tiny 11px status/order badges)

---

### 2.3 Spacing (8px Grid System)

Layouts and padding follow a strict **8px base grid system**:

| Step | Pixel Value | REM Value | Typical Usage |
| :--- | :--- | :--- | :--- |
| `0` | `0px` | `0` | Reset / inline |
| `0.5` | `4px` | `0.25rem` | Micro gaps, pill padding |
| `1` | `8px` | `0.5rem` | Badge padding, icon gaps |
| `1.5` | `12px` | `0.75rem` | Card internal gaps, list items |
| `2` | `16px` | `1rem` | Standard card padding, standard margins |
| `2.5` | `20px` | `1.25rem` | Medium section padding |
| `3` | `24px` | `1.5rem` | Section gaps, modal headers |
| `4` | `32px` | `2rem` | Container gaps |
| `5` | `40px` | `2.5rem` | Header padding |
| `6` | `48px` | `3rem` | Touch target height minimum |
| `8` | `64px` | `4rem` | Hero spacing |

---

### 2.4 Component Dimensions & Elevation

- **Border Radius**:
  - `sm`: `0.375rem` (6px)
  - `md`: `0.5rem` (8px)
  - `lg`: `0.75rem` (12px)
  - `xl`: `1rem` (16px) - standard card corner radius
  - `full`: `9999px` - pill badges
- **Card Padding**: `1rem` (16px)
- **CTA Button Minimum Height**: `48px` (complies with mobile tap target standards)
- **Shadows**:
  - `card`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
  - `cardHighlight`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
  - `cta`: `0 6px 24px rgba(196, 87, 42, 0.35)`

---

## 3. Stop Card Hierarchy: Act Layer, then Story Layer

Every **Stop Card** renders on a continuous scroll surface without accordions. Above a visible divider sits the **Act Block** — everything that passes the five-minute test. Below it, the **Story Layer** scrolls freely and at full length. See `docs/adr/0005-street-first-product-posture.md` and the Act Layer / Story Layer entries in `CONTEXT.md`.

```
┌─────────────────────────────────────────────────────────┐
│ 1. VISUAL COVER                                         │
│    - Hero image / lightbox trigger, floating badges     │
├─────────────────────────────────────────────────────────┤
│ 2. HEADER                                               │
│    - STOP X OF Y order badge, Pitstop & Visited flags   │
│    - Stop title + neighborhood metadata                 │
├─────────────────────────────────────────────────────────┤
│ 3. ACT BLOCK (fixed zone, directly beneath the title)   │
│    - Google Rating (only when Google resolves one)      │
│    - Map Links (Google / Yandex, website, Instagram)    │
│    - Venue category & cuisine, 🌱 Veggie Friendly       │
│    - Working hours, transit step                        │
│    - Recommended dishes, booking advice, photo spot     │
│    - 🧭 Stop Directive      ─┐ advisory surface         │
│    - ⚠️ Logistics Warning   ─┘                          │
├─────────────────────────── divider ─────────────────────┤
│ 4. STORY LAYER (never truncated or behind a tap)        │
│    - 🏛️ Historical overview                             │
│    - 💡 Fun fact                                        │
│    - 💬 Olya's tip                                      │
└─────────────────────────────────────────────────────────┘
```

### Rules

- **Absent items are omitted outright.** A Stop with nothing beyond a title and Map Links renders an Act Block holding only the Map Links row — no placeholders, no empty gaps.
- **The Story Layer is never demoted.** It is not truncated, collapsed, or hidden behind a tap; it is the reason a traveler picks a curated Route over a map.
- **Advisory surface.** Stop Directive and Logistics Warning use `Card variant="highlight"` (`advisoryBg` + 4px terracotta left rule), deliberately distinct from the neutral `callout` surface the Route Intro Card summarises route-wide warnings on.

---

## 4. Styling Guidelines & Best Practices

1. **Warm Georgian Travel Journal Aesthetic**:
   - Avoid generic solid colors. Always use warm clay, stone, and terracotta tones (`--card-bg`, `--canvas-bg`, `--terracotta`).
   - Use high-contrast light theme tokens (`--outdoor-*`) to guarantee readability under outdoor sunlight.
2. **No Accordions / Continuous Scrolling**:
   - All details on Stop Cards must be visible on a single continuous scrolling page. Do not hide core details inside collapsed accordions.
3. **Touch Targets & Micro-Interactions**:
   - Interactive elements (CTA buttons, dish pills, map links) must meet the `48px` minimum touch height standard.
   - Apply active feedback scale (`active:scale-95`) on buttons and pills for responsive touch feedback.
4. **Telegram WebApp SDK Integration**:
   - Map Telegram CSS variables (`--twa-bg-color`, `--twa-text-color`, `--twa-button-color`) to design system tokens as fallbacks.
   - Ensure the TWA header, theme colors, and native Telegram BackButton synchronize automatically with the active TWA slide.
