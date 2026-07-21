# Stateless Callback Data for Telegram Bot Filter Funnel

We decided to encode the 3-step filter state (`duration`, `accessibility`, `vibe`) directly inside Telegram inline keyboard `callback_data` payload strings (e.g. `dur:1-2h|acc:stroller`) rather than storing transient user sessions in Redis or a database. This ensures the Next.js API route (`/app/api/bot/route.ts`) remains 100% stateless and serverless-friendly on Vercel, eliminates session cleanup overhead, and supports concurrent multi-device usage without database operations.
