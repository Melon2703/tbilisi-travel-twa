import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RouteCatalog from '@/components/RouteCatalog';
import { ROUTES } from '@/lib/data/routes';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    back: vi.fn(),
    push: vi.fn(),
  })),
}));

describe('RouteCatalog Component', () => {
  it('1. Renders maximum 2 essential badges (Duration & Difficulty) per catalog card top image', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <RouteCatalog initialRoutes={ROUTES} />
      </LanguageProvider>
    );

    const essentialBadgeContainers = screen.getAllByTestId('essential-badges');
    expect(essentialBadgeContainers.length).toBeGreaterThan(0);

    essentialBadgeContainers.forEach((container) => {
      expect(container.children.length).toBeLessThanOrEqual(2);
    });
  });

  it('2. Removes hashtag badges (#Cultural, #Insta-Locations) from catalog card summaries', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <RouteCatalog initialRoutes={ROUTES} />
      </LanguageProvider>
    );

    const catalogCardLinks = screen.getAllByRole('link');
    expect(catalogCardLinks.length).toBeGreaterThan(0);

    catalogCardLinks.forEach((link) => {
      expect(link.textContent).not.toMatch(/#(cultural|insta-locations|courtyards|photo-spots|hiking|architecture)/i);
    });
  });

  it('3. Renders RouteCatalog section headers in Sentence case without Playfair inline styles', () => {
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

  it('4. Route Filters panel has zero inner border lines and unselected filter buttons use bg-[#F3EFEA] with border-0', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <RouteCatalog initialRoutes={ROUTES} />
      </LanguageProvider>
    );

    const filterPanel = screen.getByTestId('filter-controls-panel');
    expect(filterPanel).toBeInTheDocument();
    expect(filterPanel.className).toContain('border');

    const headerRow = screen.getByText('Route filters & sorting').parentElement?.parentElement;
    expect(headerRow?.className).not.toContain('border-b');

    const durationBtn = screen.getByTestId('duration-filter-1-2h');
    expect(durationBtn.className).toContain('bg-[#F3EFEA]');
    expect(durationBtn.className).toContain('border-0');
    expect(durationBtn.className).not.toContain('border-black/10');
  });
});
