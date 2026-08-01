import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TimelineBar from '@/components/TimelineBar';
import StopCard from '@/components/StopCard';
import RouteIntroCard from '@/components/RouteIntroCard';
import GeorgianOrnament from '@/components/ui/GeorgianOrnament';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { Stop, Route, VenueStop } from '@/lib/types/route';

describe('Issue 38: Straight Step Tracker, Clean Line Dividers & Secondary Emojis', () => {
  const mockStops: Stop[] = [
    {
      id: 'stop-1',
      order: 1,
      stopType: 'venue',
      name: 'Fabrika Cafe',
      neighborhood: 'Marjanishvili',
      coordinates: { lat: 41.71, lng: 44.80 },
      estimatedMinutes: 30,
      imageUrl: 'https://images.unsplash.com/photo-1555246050-8957960659b4',
      olyaTips: 'Try the filter coffee.',
      photoSpot: 'Graffiti alley behind the courtyard.',
      logisticsWarning: 'High doorstep at entrance.',
      venueDetails: {
        category: 'cafe',
        cuisines: ['georgian'],
        recommendedDishes: ['Matcha Latte', 'Cardamom Bun'],
        bookingAdvice: 'No reservations accepted.',
      },
    } as VenueStop,
    {
      id: 'stop-2',
      order: 2,
      stopType: 'attraction',
      name: 'Dry Bridge Market',
      neighborhood: 'Chugureti',
      coordinates: { lat: 41.70, lng: 44.80 },
      estimatedMinutes: 45,
      imageUrl: 'https://images.unsplash.com/photo-1555246050-8957960659b4',
      olyaTips: 'Bargain politely.',
    },
  ];

  const mockRoute: Route = {
    id: 'test-route-38',
    title: 'Chugureti Crafts & Flea Market',
    subtitle: 'Vibrant artistic neighborhood walk',
    durationCategory: '1-2h',
    accessibility: 'stroller-friendly',
    vibes: ['courtyards', 'photo-spots'],
    heroImage: 'https://images.unsplash.com/photo-1555246050-8957960659b4',
    introCopy: 'Discover local artists and vintage finds.',
    stops: mockStops,
  };

  it('1. TimelineBar replaces Georgian wave path with a straight 2px horizontal track', () => {
    const { container } = render(
      <LanguageProvider initialLanguage="en">
        <TimelineBar
          stops={mockStops}
          activeIndex={1}
          visitedStopIds={[]}
          onStopClick={() => {}}
          onToggleVisited={() => {}}
        />
      </LanguageProvider>
    );

    const timelineContainer = screen.getByTestId('timeline-bar-container');
    expect(timelineContainer).toBeInTheDocument();

    // Verify SVG wave path is absent
    const wavePathElements = container.querySelectorAll('path[d*="M0,8 C10,4"]');
    expect(wavePathElements.length).toBe(0);

    // Verify straight 2px track container exists
    const trackContainer = timelineContainer.querySelector('.absolute.overflow-hidden.pointer-events-none');
    expect(trackContainer).toBeInTheDocument();
    expect(trackContainer).toHaveStyle({ height: '2px' });
  });

  it('2. GeorgianOrnament component renders an ultra-thin 1px line divider with 10% opacity', () => {
    const { container } = render(<GeorgianOrnament />);

    const divider = container.querySelector('[data-testid="line-divider"]') || container.firstElementChild;
    expect(divider).toBeInTheDocument();
    expect(divider?.className).toContain('h-px');
    expect(divider?.className).toContain('bg-[#C4572A]/10');

    // Ensure no complex SVG shapes (waves, circles, diamonds) remain inside GeorgianOrnament
    expect(container.querySelector('svg')).toBeNull();
  });

  it('3. Secondary section titles in StopCard have non-essential emojis removed', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <StopCard stop={mockStops[0]} totalStops={2} />
      </LanguageProvider>
    );

    // Olya's recommendation section title check
    const recommendationCard = screen.getByTestId('olya-recommendation-card');
    const recHeader = recommendationCard.firstElementChild;
    expect(recHeader).toHaveTextContent("Olya's recommendation");
    expect(recHeader?.textContent).not.toContain('✨');

    // Recommended dishes section title check
    const dishesSection = screen.getByTestId('recommended-dishes');
    const dishesHeader = dishesSection.firstElementChild;
    expect(dishesHeader).toHaveTextContent('Recommended dishes');
    expect(dishesHeader?.textContent).not.toContain('🍽️');

    // Photo spot section title check
    const photoSpotSection = screen.getByTestId('photo-spot');
    expect(photoSpotSection).toHaveTextContent('Photo spot recommendation');
    expect(photoSpotSection.textContent).not.toContain('📷');

    // Logistics warning section title check
    const logisticsSection = screen.getByTestId('logistics-warning');
    expect(logisticsSection).toHaveTextContent('Logistics warning');
    expect(logisticsSection.textContent).not.toContain('⚠️');
  });

  it('4. Logistics warning section in RouteIntroCard has non-essential emojis removed', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <RouteIntroCard route={mockRoute} />
      </LanguageProvider>
    );

    const logisticsNotes = screen.getByTestId('logistics-notes-callout');
    expect(logisticsNotes).toBeInTheDocument();

    const warningHeader = logisticsNotes.querySelector('p');
    expect(warningHeader).toHaveTextContent('Logistics warning');
    expect(warningHeader?.textContent).not.toContain('⚠️');
  });
});
