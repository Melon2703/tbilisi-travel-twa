import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RouteCatalog from '@/components/RouteCatalog';
import RouteIntroCard from '@/components/RouteIntroCard';
import StopCard from '@/components/StopCard';
import Callout from '@/components/ui/Callout';
import { ROUTES } from '@/lib/data/routes';
import { TYPOGRAPHY } from '@/lib/theme/tokens';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    back: vi.fn(),
    push: vi.fn(),
  })),
}));

describe('Issue 35: Typography Unification & Single Sans-Serif Design System', () => {
  const sampleRoute = ROUTES[0];
  const sampleStop = sampleRoute.stops[0];

  it('ensures TYPOGRAPHY tokens map serif and display to var(--font-sans)', () => {
    expect(TYPOGRAPHY.fonts.sans).toBe('var(--font-sans)');
    expect(TYPOGRAPHY.fonts.serif).toBe('var(--font-sans)');
    expect(TYPOGRAPHY.fonts.display).toBe('var(--font-sans)');
  });

  it('renders RouteCatalog section headers in Sentence case without Playfair inline styles', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <RouteCatalog initialRoutes={ROUTES} />
      </LanguageProvider>
    );

    const filterHeader = screen.getByText('Route filters & sorting');
    expect(filterHeader).toBeInTheDocument();
    expect(filterHeader.className).not.toContain('uppercase');

    const catalogHeader = screen.getByRole('heading', { name: 'Curated Routes Catalog' });
    expect(catalogHeader.getAttribute('style') || '').not.toContain('var(--font-playfair)');
  });

  it('renders RouteIntroCard headers in Sentence case without Playfair inline styles', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <RouteIntroCard route={sampleRoute} showStartButton={true} />
      </LanguageProvider>
    );

    const mainHeading = screen.getByRole('heading', { name: sampleRoute.title });
    expect(mainHeading.getAttribute('style') || '').not.toContain('var(--font-playfair)');

    const glanceHeader = screen.getByRole('heading', { name: 'Route at a glance' });
    expect(glanceHeader.className).not.toContain('uppercase');
  });

  it('renders StopCard headers in Sentence case and order badge in ALL CAPS 11px', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <StopCard stop={sampleStop} totalStops={6} />
      </LanguageProvider>
    );

    const stopTitle = screen.getByRole('heading', { name: sampleStop.name });
    expect(stopTitle.getAttribute('style') || '').not.toContain('var(--font-serif)');
    expect(stopTitle.getAttribute('style') || '').not.toContain('var(--font-playfair)');

    const orderBadge = screen.getByText(`STOP 1 OF 6`);
    expect(orderBadge.className).toContain('uppercase');
    expect(orderBadge.className).toContain('text-[11px]');
    expect(orderBadge.className).toContain('tracking-[0.06em]');

    const recHeader = screen.getByText("Olya's recommendation");
    expect(recHeader.className).not.toContain('uppercase');
  });

  it('renders Callout header without uppercase class', () => {
    render(
      <Callout emoji="landmark" title="Historical Overview">
        <p>Test content</p>
      </Callout>
    );

    const titleElement = screen.getByText('Historical Overview');
    expect(titleElement.parentElement?.className).not.toContain('uppercase');
  });
});
