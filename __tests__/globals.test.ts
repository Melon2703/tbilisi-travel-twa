import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Design System CSS Tokens (Issue 12)", () => {
  const globalsCssPath = path.resolve(__dirname, "../app/globals.css");
  const globalsCss = fs.readFileSync(globalsCssPath, "utf-8");

  it("defines 2-color minimalist CSS tokens with exact hex values", () => {
    const requiredTokens = [
      ["--terracotta", "#E07A5F"],
      ["--tbilisi-slate", "#1F2421"],
      ["--warm-stone", "#FAFAF7"],
      ["--neutral-border", "#E5E5E0"],
    ];

    for (const [token, hex] of requiredTokens) {
      expect(globalsCss).toContain(`${token}: ${hex}`);
    }
  });

  it("aligns Telegram WebApp SDK fallback variables with design tokens", () => {
    expect(globalsCss).toContain("--twa-bg-color: var(--warm-stone)");
    expect(globalsCss).toContain("--twa-text-color: var(--tbilisi-slate)");
    expect(globalsCss).toContain("--twa-hint-color: var(--tbilisi-slate)");
    expect(globalsCss).toContain("--twa-link-color: var(--terracotta)");
    expect(globalsCss).toContain("--twa-button-color: var(--terracotta)");
    expect(globalsCss).toContain("--twa-secondary-bg-color: var(--warm-stone)");
    expect(globalsCss).toContain("--twa-header-bg-color: var(--tbilisi-slate)");
  });

  it("applies background and text color to body using design tokens", () => {
    expect(globalsCss).toMatch(/body\s*\{[^}]*background-color:\s*var\(--twa-bg-color\)/);
    expect(globalsCss).toMatch(/body\s*\{[^}]*color:\s*var\(--twa-text-color\)/);
  });
});
