import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StopCard from '@/components/StopCard';
import RouteIntroCard from '@/components/RouteIntroCard';
import RouteCatalog from '@/components/RouteCatalog';
import Callout from '@/components/ui/Callout';
import Card from '@/components/ui/Card';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { Route, Stop, VenueStop } from '@/lib/types/route';

describe('Soft Background Tinting & Zero Inner Borders (Issue 36)', () => {
  const mockStop: Stop = {
    id: 'stop-1',
    order: 1,
    stopType: 'venue',
    name: 'Cafe Minda',
    neighborhood: 'Sololaki',
    coordinates: { lat: 41.69, lng: 44.80 },
    estimatedMinutes: 20,
    imageUrl: 'https://images.unsplash.com/photo-1555246050-8957960659b4',
    olyaTips: 'Order the freshly baked khachapuri.',
    photoSpot: 'Balcony overlooking Betlemi Street.',
    logisticsWarning: 'Steep stairs, watch your step.',
    venueDetails: {
      category: 'cafe',
      cuisines: ['georgian'],
      recommendedDishes: ['Khachapuri'],
      bookingAdvice: 'Reserve in advance for weekend brunch.',
    },
  } as VenueStop;

  const mockRoute: Route = {
    id: 'test-route',
    title: 'Sololaki Secrets',
    subtitle: 'Hidden courtyards and cozy cafes',
    durationCategory: '1-2h',
    accessibility: 'stroller-friendly',
    vibes: ['courtyards', 'photo-spots'],
    heroImage: 'https://images.unsplash.com/photo-1555246050-8957960659b4',
    introCopy: 'Welcome to Sololaki, my favorite neighborhood.',
    stops: [mockStop],
  };

  it('1. Callout and Card components use soft background tinting (#F3EFEA), rounded-2xl, border-0, and generous padding', () => {
    render(
      <Callout emoji="chat" title="Test Callout">
        Callout content
      </Callout>
    );

    const calloutEl = screen.getByText('Test Callout').closest('div')?.parentElement;
    expect(calloutEl).toBeInTheDocument();
    expect(calloutEl?.className).toContain('bg-[#F3EFEA]');
    expect(calloutEl?.className).toContain('border-0');
    expect(calloutEl?.className).toContain('rounded-2xl');
    expect(calloutEl?.className).toMatch(/p-(4|5)/);
  });

  it('2. Olya Recommendation card inner callouts have zero inner borders (border-0) and bg-[#F3EFEA]', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <StopCard stop={mockStop} totalStops={1} />
      </LanguageProvider>
    );

    const recommendationCard = screen.getByTestId('olya-recommendation-card');
    expect(recommendationCard).toBeInTheDocument();

    // Verify outer card retains single 1px outline against canvas
    expect(recommendationCard.className).toContain('border');
    expect(recommendationCard.className).not.toContain('border-0');

    // Verify inner callout containers inside Olya Recommendation card have border-0 and bg-[#F3EFEA]
    const photoSpotCallout = screen.getByTestId('photo-spot').firstElementChild;
    const logisticsCallout = screen.getByTestId('logistics-warning').firstElementChild;
    const bookingCallout = screen.getByTestId('booking-advice').firstElementChild;

    expect(photoSpotCallout?.className).toContain('border-0');
    expect(photoSpotCallout?.className).toContain('bg-[#F3EFEA]');
    expect(logisticsCallout?.className).toContain('border-0');
    expect(logisticsCallout?.className).toContain('bg-[#F3EFEA]');
    expect(bookingCallout?.className).toContain('border-0');
    expect(bookingCallout?.className).toContain('bg-[#F3EFEA]');
  });

  it('3. RouteIntroCard callouts (Olya Welcome, Route at a Glance, Logistics Notes) use bg-[#F3EFEA], border-0, and rounded-2xl', () => {
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
    expect(routeAtAGlance.className).toContain('rounded-2xl');

    const logisticsNotes = screen.getByTestId('logistics-notes-callout');
    expect(logisticsNotes).toBeInTheDocument();
    expect(logisticsNotes.className).toContain('bg-[#F3EFEA]');
    expect(logisticsNotes.className).toContain('border-0');
    expect(logisticsNotes.className).toContain('rounded-2xl');
  });

  it('4. Route Filters panel has zero inner border lines and unselected filter buttons use bg-[#F3EFEA] with border-0', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <RouteCatalog initialRoutes={[mockRoute]} />
      </LanguageProvider>
    );

    const filterPanel = screen.getByTestId('filter-controls-panel');
    expect(filterPanel).toBeInTheDocument();

    // Verify outer panel retains top-level border against canvas background
    expect(filterPanel.className).toContain('border');

    // Verify inner section headers do NOT have inner border lines (border-b / border-t)
    const headerRow = screen.getByText('Route filters & sorting').parentElement?.parentElement;
    expect(headerRow?.className).not.toContain('border-b');

    // Verify unselected duration filter button uses bg-[#F3EFEA] and border-0
    const durationBtn = screen.getByTestId('duration-filter-1-2h');
    expect(durationBtn.className).toContain('bg-[#F3EFEA]');
    expect(durationBtn.className).toContain('border-0');
    expect(durationBtn.className).not.toContain('border-black/10');
  });
});
