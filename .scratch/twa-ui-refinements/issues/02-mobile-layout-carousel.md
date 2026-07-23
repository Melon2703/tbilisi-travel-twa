# 02 — Mobile Typography, Overflow & Layout Polish in RouteCarousel

**What to build:** Fix all mobile layout defects on `/twa/[routeId]` route pages when viewed on 390px viewports (Telegram Web App context). Route titles wrap gracefully, sticky action bars do not obscure hint text, tag containers render clean horizontal scroll states, and dev overlays do not overlap CTA buttons.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Route titles (`h1`) wrap cleanly on 390px screens without right-edge truncation
- [ ] Bottom swipe hint text ("👉 Swipe left or tap below to begin!") remains fully visible and is not overlapped by the fixed `START ROUTE` CTA bar
- [ ] Vibe and duration tags scroll horizontally with smooth padding and visual indicators
- [ ] Mobile button tap target sizes meet minimum 48x48px accessibility guidelines
