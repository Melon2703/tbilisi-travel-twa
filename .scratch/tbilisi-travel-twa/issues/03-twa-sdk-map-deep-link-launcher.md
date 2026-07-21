# 03 — Telegram WebApp SDK Sync & Map Deep-Link Launcher

**What to build:** Telegram Mini-App bridge integration (`window.Telegram.WebApp`) for theme synchronization and native button controls, alongside a Card-to-Nav universal link modal sheet. When tapping "Open in Maps" on any stop Card, a lightweight bottom sheet lets the user choose between Google Maps, Apple Maps, or Yandex Maps with exact GPS coordinates, remembering their selection in browser local storage.

**Blocked by:** 02 — TWA Server-Side Timeline & Card Feed UI

**Status:** ready-for-agent

- [ ] `<TelegramProvider>` context component created to initialize Telegram WebApp SDK, expand view, and bind Telegram theme colors to CSS variables.
- [ ] Native Telegram `BackButton` integrated to navigate back to route selection or close the Mini-App view cleanly.
- [ ] Map provider selection bottom sheet component built with direct universal links for Google Maps, Apple Maps, and Yandex Maps.
- [ ] User's preferred Map Provider saved and restored from `localStorage`.
