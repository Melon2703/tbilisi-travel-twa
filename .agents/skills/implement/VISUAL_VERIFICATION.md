# Visual Verification Protocol for Frontend Changes

Before calling `/code-review` or completing a task involving frontend UI, perform the following visual verification steps.

---

## Step 1: Ensure Dev Server is Running

1. Check if the local dev server is active at `http://localhost:3000`.
2. If not active, run `npm run dev` in the background.

---

## Step 2: Chrome DevTools MCP Navigation & Viewport Setup

1. Open Chrome DevTools MCP context:
   - Navigate to target URL (e.g. `http://localhost:3000` or modified sub-route) using `navigate_page`.
2. Verify both Mobile (Telegram WebApp standard: 390x844px) and Desktop viewports.

---

## Step 3: Capture Screenshots & Visual Inspection

1. Take page snapshot via `take_snapshot` to inspect accessibility tree and interactive elements.
2. Take visual screenshot via `take_screenshot` (saved to `.scratch/` or inspect inline).
3. Inspect screenshot visually using multimodal vision capabilities for:
   - Layout alignment, margins, and 8px grid compliance.
   - Text rendering, Geist Sans typography, and sentence case headings.
   - Design System token usage ([DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) / [lib/theme/tokens.ts](../../lib/theme/tokens.ts)): terracotta primary `#E07A5F`, card background `#FFF8F3`, canvas `#FAF7F2`.
   - 5-part card hierarchy compliance for Stop Cards.
   - Minimum 48px touch target height on all primary buttons and interactive pills.
   - High-contrast outdoor theme support tokens (`--outdoor-*`).
   - No unintended layout shifts or overflowing text on mobile viewports.

---

## Step 4: Fix Discrepancies

If visual inspection reveals layout inconsistencies, missing design system tokens, or broken mobile viewports:
1. Adjust components/CSS tokens.
2. Re-navigate or refresh page in Chrome DevTools MCP.
3. Re-take screenshot and verify fixes before proceeding to `/code-review`.
