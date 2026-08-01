import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RouteIntroCard from '@/components/RouteIntroCard';
import { Route } from '@/lib/types/route';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

const mockRoute: Route = {
  id: 'sololaki-architecture-tour',
  title: 'Sololaki Architectural Gems & Hidden Courtyards Long Title Test',
  subtitle: 'A walking tour through 19th century merchant mansions and ornate wooden balconies',
  durationCategory: '1-2h',
  accessibility: 'moderate',
  vibes: ['courtyards', 'architecture', 'photo-spots'],
  heroImage: '/images/sololaki.jpg',
  introCopy: 'Welcome to Sololaki, the heart of Old Tbilisi aristocracy.',
  stops: [
    {
      id: 'stop-1',
      order: 1,
      name: 'Kalantarov Mansion',
      neighborhood: 'Sololaki',
      coordinates: { lat: 41.6912, lng: 44.7989 },
      estimatedMinutes: 25,
      imageUrl: '/images/kalantarov.jpg',
      olyaTips: 'Look up at the painted ceiling in the entrance hall.',
      stopType: 'attraction',
      logisticsWarning: 'Cobblestone paths and moderate inclines.',
    },
    {
      id: 'stop-2',
      order: 2,
      name: 'Betlemi Church Viewpoint',
      neighborhood: 'Old Kala',
      coordinates: { lat: 41.6885, lng: 44.806 },
      estimatedMinutes: 30,
      imageUrl: '/images/betlemi.jpg',
      olyaTips: 'Panoramic view of Old Tbilisi.',
      stopType: 'attraction',
    },
  ],
};

describe('RouteIntroCard Component', () => {
  it('1. Route titles (h1) wrap cleanly on mobile screens without right-edge truncation', () => {
    render(
      <LanguageProvider>
        <RouteIntroCard route={mockRoute} />
      </LanguageProvider>
    );

    const titleHeading = screen.getByRole('heading', { level: 1 });
    expect(titleHeading).toBeInTheDocument();
    expect(titleHeading).toHaveClass('break-words');
    expect(titleHeading).toHaveClass('min-w-0');
    expect(titleHeading).toHaveClass('max-w-full');
    expect(titleHeading.getAttribute('style') || '').not.toContain('var(--font-playfair)');
  });

  it('2. Vibe and duration tags scroll horizontally with smooth padding and visual indicators', () => {
    render(
      <LanguageProvider>
        <RouteIntroCard route={mockRoute} />
      </LanguageProvider>
    );

    const badgesRow = screen.getByTestId('pill-badges-row');
    expect(badgesRow).toBeInTheDocument();
    expect(badgesRow).toHaveClass('overflow-x-auto');
    expect(badgesRow).toHaveClass('pr-8');

    expect(badgesRow).toHaveTextContent('1-2h');
    expect(badgesRow).toHaveTextContent('moderate');
    expect(badgesRow).toHaveTextContent('courtyards');
    expect(badgesRow).toHaveTextContent('architecture');

    const scrollIndicator = screen.getByTestId('pill-badges-scroll-indicator');
    expect(scrollIndicator).toBeInTheDocument();
  });

  it('3. Renders overview map near top, tile layer, start/finish badges, and expand button', () => {
    render(
      <LanguageProvider>
        <RouteIntroCard route={mockRoute} />
      </LanguageProvider>
    );

    const overviewMap = screen.getByTestId('route-overview-map');
    expect(overviewMap).toBeInTheDocument();

    const tileContainer = screen.getByTestId('map-tile-container');
    expect(tileContainer).toBeInTheDocument();

    expect(screen.getByTestId('map-start-badge')).toHaveTextContent(/Kalantarov Mansion/i);
    expect(screen.getByTestId('map-finish-badge')).toHaveTextContent(/Betlemi Church/i);
    expect(screen.getByTestId('expand-map-button')).toBeInTheDocument();
  });

  it('4. Opens map modal when expand map button is clicked', () => {
    render(
      <LanguageProvider>
        <RouteIntroCard route={mockRoute} />
      </LanguageProvider>
    );

    expect(screen.queryByTestId('close-map-modal')).not.toBeInTheDocument();

    const expandBtn = screen.getByTestId('expand-map-button');
    fireEvent.click(expandBtn);

    expect(screen.getByTestId('close-map-modal')).toBeInTheDocument();
  });

  it('5. Callouts (Olya Welcome, Route at a Glance, Logistics Notes) use bg-[#F3EFEA], border-0, and rounded-2xl', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <RouteIntroCard route={mockRoute} />
      </LanguageProvider>
    );

    const olyaWelcome = screen.getByTestId('olya-welcome-card');
    expect(olyaWelcome).toBeInTheDocument();
    expect(olyaWelcome.className).toContain('bg-[#F3EFEA]');
    expect(olyaWelcome.className).toContain('border-0');
    expect(olyaWelcome.className).toContain('rounded-2xl');

    const routeAtAGlance = screen.getByTestId('route-at-a-glance');
    expect(routeAtAGlance).toBeInTheDocument();
    expect(routeAtAGlance.className).toContain('bg-[#F3EFEA]');
    expect(routeAtAGlance.className).toContain('border-0');

    const glanceHeader = screen.getByRole('heading', { name: 'Route at a glance' });
    expect(glanceHeader.className).not.toContain('uppercase');

    const logisticsNotes = screen.getByTestId('logistics-notes-callout');
    expect(logisticsNotes).toBeInTheDocument();
    expect(logisticsNotes.className).toContain('bg-[#F3EFEA]');
    expect(logisticsNotes.className).toContain('border-0');

    const warningHeader = logisticsNotes.querySelector('p');
    expect(warningHeader).toHaveTextContent('Logistics warning');
    expect(warningHeader?.textContent).not.toContain('⚠️');
  });
});
