# 05 — Full-Screen Multi-Photo Lightbox & Stop Deep-Link Sharing

**What to build:** A full-screen horizontal swipe lightbox modal for exploring stop photos on tap, paired with native Telegram startapp deep-link sharing (`t.me/bot?startapp=route_X_stop_Y`) so travelers can share specific stops directly with friends.

**Blocked by:** 04 — Continuous Scrollable VenueStop & AttractionStop Card Components

**Status:** ready-for-agent

- [ ] Build `LightboxModal.tsx` component supporting horizontal swipe touch gestures across `galleryImages[]` and photo counter (`1/N`).
- [ ] Connect image tap events on stop cards to trigger the lightbox modal.
- [ ] Implement `↗️ Share Stop` deep-link generator using Telegram WebApp startapp parameter encoding (`route_<id>_stop_<id>`).
- [ ] Add deep-link payload handler in route page to auto-navigate to the target stop upon launch.
