# 04 — Telegram Bot Webhook & Stateless 3-Step Funnel

**What to build:** The Next.js API route (`/api/bot`) handling incoming Telegram Bot API webhook updates (`/start`, inline keyboard callback queries). It guides the user through the 3-step filter funnel (`Duration` → `Accessibility` → `Vibe`), encoding filter states statelessly in `callback_data` payloads, calling `matchRoute()`, and replying with a rich card preview + inline Telegram WebApp button pointing to `/twa/[routeId]`.

**Blocked by:** 01 — Core Domain Schema, Dataset & Matching Engine, 02 — TWA Server-Side Timeline & Card Feed UI

**Status:** ready-for-agent

- [ ] `/api/bot` API route implemented handling `POST` webhook payloads from Telegram Bot API.
- [ ] 3-step conversational flow implemented with inline keyboards and stateless callback data payload parsing (`dur|acc|vibe`).
- [ ] Route matching integration that selects the appropriate route and formats Olya's warm recommendation message.
- [ ] Final recommendation message rendered with an inline `web_app` button launching `/twa/[routeId]`.
- [ ] Webhook integration test suite testing `/start` and callback query payload processing.
