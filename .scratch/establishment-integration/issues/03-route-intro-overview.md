# 03 — Slide 0 Route Intro Card Path Overview & Transit Visuals

**What to build:** An interactive route path line map + step-by-step preview timeline rendered on the landing slide (`Route Intro Card`), letting travelers visually inspect all stops from start to end (with transit badges like Cable Car and distinct pitstop icons) before embarking.

**Blocked by:** 01 — Polymorphic Stop Schema & Route Data Prefactoring

**Status:** ready-for-agent

- [ ] Render a visual route path overview on `RouteIntroCard.tsx` showing connected stop nodes.
- [ ] Display transit duration badges (e.g. `🚠 Cable Car Ride (~5 min)`) between transit nodes (e.g. Cable Car Lower Station -> Mother of Georgia).
- [ ] Render secondary icons/badges for optional venue pitstops in the preview list.
- [ ] Verify Slide 0 rendering with Vitest component tests in `__tests__/timeline.test.tsx`.
