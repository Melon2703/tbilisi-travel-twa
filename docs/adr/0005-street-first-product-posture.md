# Street-First Product Posture

The app had been built halfway toward two products: a planning tool read at home and a navigation companion used on the street. We committed to **street-first** — the traveler is standing on the spot, phone in one hand. The route shell already assumed this (full-viewport slides, swipe transport, per-stop progress, per-stop map deep-links, Telegram native chrome); only the Route Intro Card serves planning, and it stays as the single planning surface.

The Story Layer (history, fun facts, Olya's Tips) is **not** demoted by this decision — it is the reason a traveler picks a curated Route over a map, and it is consumed on site, in front of the place. The remedy for the undifferentiated Stop Card is therefore to *promote the Act Layer* into a fixed zone beneath the Stop title, not to hide the reading.

## Consequences

- Comparison features are out of scope: no sibling-route comparison view, no "what you gave up". A Route Family is surfaced as a *label* on the card ("Short version of X — 6 of 19 stops"), not as a comparison tool.
- Real walking-path geometry is out of scope. Preview maps convey *shape* via a dashed sequence connector; turn-by-turn is handed off to Google/Yandex from each Stop Card.
- Catalog filters must earn their place: `full-day` matches no Route, `photo-spots` matches 8 of 9, and accessibility — the Hard Constraint — is not filterable at all.
