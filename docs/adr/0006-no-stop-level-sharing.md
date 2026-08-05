# No Stop-Level Sharing or Deep Links

The stop-level Telegram deep-link subsystem (`generateStopDeepLink`, `parseStartParam`, `parseDeepLinkParam`, `getTelegramStartParam`, and the `start_param` effect in `RouteCarousel`) was dead at both ends: nothing in the product ever emitted a `startapp` link — the bot sends a plain `web_app` URL — so the parser could only fire for a hand-crafted URL. We removed the whole subsystem rather than completing it with a share button.

This is deliberately surprising for a Telegram app, where links are the natural channel: sharing is a *new feature*, and this round of work is hardening what exists. Keeping a receiver for links nobody can create was worse than having neither — it read as load-bearing, carried tests asserting unreachable behaviour, and its effect depended on an unmemoised array so it re-ran on every render and competed with the carousel's other programmatic-slide path.

If sharing returns it is roughly twenty lines, and it will want a different payload shape once Route Family exists.

## Consequences

- `?lang=` URL reading stays — the bot's links use it, and it is the top of the language resolution order (URL → stored preference → Telegram `language_code` → `en`).
- Language persistence is still required independently of sharing: `setLanguage` must write the URL and `localStorage`, and the EN/RU toggle must be reachable from the catalog, not only from the Route Intro Card hero.
