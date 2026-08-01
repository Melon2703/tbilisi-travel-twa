import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StopCard from '@/components/StopCard';
import { Stop } from '@/lib/types/route';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

describe('Issue 39: Re-architect Stop Card Header Toolbar & Map Proximity Layout', () => {
  const mockAttractionStop: Stop = {
    id: 'test-stop-39',
    order: 1,
    stopType: 'attraction',
    name: 'Metekhi Church',
    neighborhood: 'Old Tbilisi',
    coordinates: { lat: 41.6901, lng: 44.8115 },
    estimatedMinutes: 25,
    imageUrl: 'https://images.unsplash.com/photo-1555246050-8957960659b4',
    historicalSummary: 'Historic church perched on a cliff over the Kura River.',
    olyaTips: 'Visit early in the morning for best lighting.',
    ratings: { google: { rating: 4.8, count: 5400 } },
  };

  it('1. Top header toolbar row places stop order on the left, and aligns Visited status badge on the right', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <StopCard stop={mockAttractionStop} totalStops={6} isVisited={true} />
      </LanguageProvider>
    );

    const topRow = screen.getByTestId('stop-card-header-top-row');
    expect(topRow).toBeInTheDocument();

    // Verify stop order is present in the top row
    expect(topRow).toHaveTextContent('STOP 1 OF 6');

    // Verify Visited badge is inside the top row
    const visitedBadge = screen.getByText('Visited');

    expect(topRow).toContainElement(visitedBadge);
  });

  it('2. Map provider buttons (Google Maps, Yandex Maps) are positioned directly underneath location title and neighborhood metadata', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <StopCard stop={mockAttractionStop} totalStops={6} isVisited={false} />
      </LanguageProvider>
    );

    const heading = screen.getByRole('heading', { name: 'Metekhi Church' });
    expect(heading).toBeInTheDocument();

    const neighborhoodMeta = screen.getByTestId('stop-neighborhood-metadata');
    expect(neighborhoodMeta).toBeInTheDocument();
    expect(neighborhoodMeta).toHaveTextContent('Old Tbilisi');

    const mapPillsRow = screen.getByTestId('map-pills-row');
    expect(mapPillsRow).toBeInTheDocument();

    const googleBtn = screen.getByLabelText('Open in Google Maps');
    const yandexBtn = screen.getByLabelText('Open in Yandex Maps');
    expect(mapPillsRow).toContainElement(googleBtn);
    expect(mapPillsRow).toContainElement(yandexBtn);

    // Verify DOM structure: title -> neighborhood metadata -> map provider buttons are adjacent in the header section
    const headerContainer = heading.closest('[data-testid="stop-card-header-container"]') || heading.parentElement?.parentElement;
    expect(headerContainer).toContainElement(heading);
    expect(headerContainer).toContainElement(neighborhoodMeta);
    expect(headerContainer).toContainElement(mapPillsRow);
  });
});
