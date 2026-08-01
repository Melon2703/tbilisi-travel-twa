import { describe, it, expect } from 'vitest';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  COMPONENT_TOKENS,
} from '@/lib/theme/tokens';

describe('Design System Theme Tokens (Issue 30)', () => {
  describe('COLORS Token Module', () => {
    it('exports base Warm Georgian Travel Journal color palette tokens', () => {
      expect(COLORS.terracotta).toBe('#E07A5F');
      expect(COLORS.terracottaAccent).toBe('#C4572A');
      expect(COLORS.tbilisiSlate).toBe('#1F2421');
      expect(COLORS.warmStone).toBe('#FAFAF7');
      expect(COLORS.neutralBorder).toBe('#E5E5E0');
      expect(COLORS.canvasBg).toBe('#FAF7F2');
      expect(COLORS.cardBg).toBe('#FFF8F3');
      expect(COLORS.tipBoxBg).toBe('#FFF8F3');
      expect(COLORS.tipBoxBorder).toBe('rgba(196, 87, 42, 0.18)');
      expect(COLORS.successAccent).toBe('#228255');
      expect(COLORS.textPrimary).toBe('#1C1008');
      expect(COLORS.textSecondary).toBe('#7A6552');
      expect(COLORS.badgeBg).toBe('#FAF3E8');
      expect(COLORS.badgeText).toBe('#8C4A27');
      expect(COLORS.badgeBorder).toBe('#E8D5C4');
      expect(COLORS.dishBg).toBe('#FFF8EE');
      expect(COLORS.dishText).toBe('#4A3828');
      expect(COLORS.dishBorder).toBe('#E8DCCB');
      expect(COLORS.actionBorder).toBe('#E8EAF0');
      expect(COLORS.iconMuted).toBe('#5C4D42');
    });

    it('exports outdoor high-contrast theme tokens', () => {
      expect(COLORS.outdoor.textPrimary).toBe('#1C1008');
      expect(COLORS.outdoor.terracotta).toBe('#C4572A');
      expect(COLORS.outdoor.success).toBe('#228255');
      expect(COLORS.outdoor.badgeBg).toBe('#1C1008');
      expect(COLORS.outdoor.badgeText).toBe('#FFFFFF');
      expect(COLORS.outdoor.borderContrast).toBe('rgba(28, 16, 8, 0.22)');
    });

    it('exports brand/third-party map colors', () => {
      expect(COLORS.brand.googleMaps).toBe('#EA4335');
      expect(COLORS.brand.yandexMaps).toBe('#FC3F1D');
      expect(COLORS.brand.instagram).toBe('#E4405F');
    });
  });

  describe('TYPOGRAPHY Token Module', () => {
    it('exports font families referencing CSS custom properties', () => {
      expect(TYPOGRAPHY.fonts.sans).toBe('var(--font-sans)');
      expect(TYPOGRAPHY.fonts.serif).toBe('var(--font-serif)');
      expect(TYPOGRAPHY.fonts.display).toBe('var(--font-display)');
      expect(TYPOGRAPHY.fonts.mono).toBe('var(--font-mono)');
    });

    it('exports standard font weights', () => {
      expect(TYPOGRAPHY.weights.regular).toBe(400);
      expect(TYPOGRAPHY.weights.medium).toBe(500);
      expect(TYPOGRAPHY.weights.semibold).toBe(600);
      expect(TYPOGRAPHY.weights.bold).toBe(700);
    });

    it('exports letter tracking tokens', () => {
      expect(TYPOGRAPHY.tracking.cta).toBe('0.18em');
      expect(TYPOGRAPHY.tracking.badge).toBe('0.14em');
    });
  });

  describe('SPACING Token Module (8px Grid)', () => {
    it('defines 8px grid base and standard spacing steps', () => {
      expect(SPACING.gridBase).toBe(8);
      expect(SPACING.steps[0]).toBe('0px');
      expect(SPACING.steps[0.5]).toBe('4px');
      expect(SPACING.steps[1]).toBe('8px');
      expect(SPACING.steps[1.5]).toBe('12px');
      expect(SPACING.steps[2]).toBe('16px');
      expect(SPACING.steps[2.5]).toBe('20px');
      expect(SPACING.steps[3]).toBe('24px');
      expect(SPACING.steps[4]).toBe('32px');
      expect(SPACING.steps[5]).toBe('40px');
      expect(SPACING.steps[6]).toBe('48px');
      expect(SPACING.steps[8]).toBe('64px');
    });
  });

  describe('COMPONENT_TOKENS Module', () => {
    it('exports border radius, component dimensions, and shadows', () => {
      expect(COMPONENT_TOKENS.borderRadius.sm).toBe('0.375rem');
      expect(COMPONENT_TOKENS.borderRadius.md).toBe('0.5rem');
      expect(COMPONENT_TOKENS.borderRadius.lg).toBe('0.75rem');
      expect(COMPONENT_TOKENS.borderRadius.xl).toBe('1rem');
      expect(COMPONENT_TOKENS.borderRadius.full).toBe('9999px');

      expect(COMPONENT_TOKENS.cardPadding).toBe('1rem');
      expect(COMPONENT_TOKENS.ctaButtonMinHeight).toBe('48px');

      expect(COMPONENT_TOKENS.shadows.card).toBe('0 1px 2px 0 rgba(0, 0, 0, 0.05)');
      expect(COMPONENT_TOKENS.shadows.cta).toBe('0 6px 24px rgba(196, 87, 42, 0.35)');
    });
  });
});
