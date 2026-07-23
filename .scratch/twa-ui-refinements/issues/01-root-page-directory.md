# 01 — Root Page Route Directory & Mobile Catalog

**What to build:** Replace the default `create-next-app` boilerplate on `/` with a clean, mobile-optimized Tbilisi Travel TWA catalog. Users visiting the root URL can browse interactive cards for all available routes, view duration/vibe tags, and tap to navigate directly to `/twa/[routeId]`.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Root page (`app/page.tsx`) displays a curated list of all routes from `lib/data/routes.ts`
- [ ] Mobile-responsive layout (390px viewports) with no horizontal overflow or clipped text
- [ ] Accessible dark mode and clean typography following modern design standards
- [ ] Direct clickable links navigating to each `/twa/[routeId]` route page
