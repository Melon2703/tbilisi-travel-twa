## Parent
#1

## What to build
A lightweight, server-side rendered static timeline view at `/twa/[routeId]` displaying a vertical feed of Stop Cards for a given route. Each Card presents the stop title, neighborhood, estimated time, hero image, Olya's conversational tips, and highlighted logistics warnings (e.g., steep cobblestone inclines). Styled using the signature Tbilisi design system palette (Terracotta, Tbilisi Slate, Warm Stone, Golden Amber).

## Acceptance criteria
- [ ] Next.js SSR route `/twa/[routeId]` implemented with 404 fallback for invalid route IDs.
- [ ] Vertical Card timeline component rendered with responsive layout, stop sequence order, and visual hierarchy.
- [ ] Olya's personal text tips and highlighted logistics warning callouts rendered cleanly on each Card.
- [ ] Design system tokens and utilities defined in `globals.css` using HSL/tailored CSS variables.

## Blocked by
- #2 ([Ticket 01] Core Domain Schema, Dataset & Matching Engine)
