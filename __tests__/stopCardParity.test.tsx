import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StopCard from '@/components/StopCard';
import { Stop } from '@/lib/types/route';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { COLORS } from '@/lib/theme/tokens';

describe('StopCard 5-Part Layout & Component Parity (Issue 32)', () => {
  const attractionStep1: Stop = {
    id: 'test-step-1',
    order: 1,
    stopType: 'attraction',
    name: 'Freedom Square',
    neighborhood: 'Center',
    coordinates: { lat: 41.6934, lng: 44.8015 },
    estimatedMinutes: 15,
    imageUrl: 'https://images.unsplash.com/photo-1555246050-8957960659b4',
    historicalSummary: 'Historical central square in Tbilisi.',
    funFact: 'Monument of St. George stands in the center.',
    olyaTips: 'Great starting point for walking Kala district.',
    ratings: { google: { rating: 4.7, count: 8520 } },
  };

  const venueStep6: Stop = {
    id: 'test-step-6',
    order: 6,
    stopType: 'venue',
    isOptional: true,
    name: 'Funicular Restaurant',
    neighborhood: 'Mtatsminda',
    coordinates: { lat: 41.695, lng: 44.789 },
    estimatedMinutes: 45,
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
    websiteUrl: 'https://funicular.ge',
    olyaTips: 'Enjoy panoramic city views with ponchiki.',
    venueDetails: {
      category: 'restaurant',
      cuisines: ['georgian'],
      isVegetarianFriendly: true,
      recommendedDishes: ['Tbilisi Ponchiki', 'Lagidze Water'],
      bookingAdvice: 'Book sunset terrace tables in advance.',
    },
    ratings: { google: { rating: 4.8, count: 2400 } },
  };

  it('1. Imports and applies tokens from lib/theme/tokens.ts', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <StopCard stop={attractionStep1} totalStops={6} />
      </LanguageProvider>
    );

    const cardContainer = screen.getByTestId('stop-card-container');
    expect(cardContainer).toBeInTheDocument();
    expect(cardContainer).toHaveStyle({ backgroundColor: COLORS.canvasBg });
    expect(cardContainer).toHaveStyle({ color: COLORS.textPrimary });

    const shareBtn = screen.getByTestId('share-stop-button');
    expect(shareBtn).toBeInTheDocument();
    expect(shareBtn).toHaveStyle({ backgroundColor: COLORS.badgeBg });
  });

  it('2. Displays STOP X OF 6 header badge and Share Stop button for steps 1 through 6', () => {
    const steps = [1, 2, 3, 4, 5, 6];
    steps.forEach((order) => {
      const stop: Stop = { ...attractionStep1, order };
      const { unmount } = render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={stop} totalStops={6} />
        </LanguageProvider>
      );

      expect(screen.getByText(`STOP ${order} OF 6`)).toBeInTheDocument();
      expect(screen.getByTestId('share-stop-button')).toBeInTheDocument();
      unmount();
    });
  });

  it('3. Displays Google Rating badge and map navigation action buttons for all steps', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <StopCard stop={attractionStep1} totalStops={6} />
      </LanguageProvider>
    );

    expect(screen.getByTestId('google-rating-badge')).toBeInTheDocument();
    expect(screen.getByText(/4.7/)).toBeInTheDocument();
    expect(screen.getByLabelText('Open in Google Maps')).toBeInTheDocument();
    expect(screen.getByLabelText('Open in Yandex Maps')).toBeInTheDocument();
  });

  it('4. Displays Globe website link button on Step 6 alongside map links', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <StopCard stop={venueStep6} totalStops={6} />
      </LanguageProvider>
    );

    const mapPillsRow = screen.getByTestId('map-pills-row');
    expect(mapPillsRow).toBeInTheDocument();

    const websiteBtn = screen.getByLabelText('Visit Website');
    expect(websiteBtn).toBeInTheDocument();
    expect(websiteBtn).toHaveAttribute('href', 'https://funicular.ge');
  });

  it('5. Renders recommendation blocks in a single consolidated Olya Recommendation card', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <StopCard stop={venueStep6} totalStops={6} />
      </LanguageProvider>
    );

    const recommendationCard = screen.getByTestId('olya-recommendation-card');
    expect(recommendationCard).toBeInTheDocument();

    // Recommendation card contains tip, dish pills, and booking advice
    expect(screen.getByText(/Enjoy panoramic city views with ponchiki/)).toBeInTheDocument();
    expect(screen.getByText('Tbilisi Ponchiki')).toBeInTheDocument();
    expect(screen.getByText('Book sunset terrace tables in advance.')).toBeInTheDocument();
  });

  it('6. Adheres to minimum 44x44px touch target sizes for interactive buttons', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <StopCard stop={venueStep6} totalStops={6} />
      </LanguageProvider>
    );

    const shareBtn = screen.getByTestId('share-stop-button');
    const googleMapBtn = screen.getByLabelText('Open in Google Maps');
    const yandexMapBtn = screen.getByLabelText('Open in Yandex Maps');
    const websiteBtn = screen.getByLabelText('Visit Website');

    // Verify touch target size classes (min-h-[44px] or min-h-[48px])
    expect(shareBtn.className).toMatch(/min-h-\[(44|48)px\]/);
    expect(googleMapBtn.className).toMatch(/min-h-\[(44|48)px\]/);
    expect(yandexMapBtn.className).toMatch(/min-h-\[(44|48)px\]/);
    expect(websiteBtn.className).toMatch(/min-h-\[(44|48)px\]/);
  });
});
