import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StopCard from '@/components/StopCard';
import { Stop, VenueStop } from '@/lib/types/route';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { COLORS } from '@/lib/theme/tokens';

describe('StopCard Component', () => {
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

  const venueStep6: VenueStop = {
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
    photoSpot: 'Balcony view of Old Tbilisi.',
    logisticsWarning: 'Steep stairs at entrance.',
    venueDetails: {
      category: 'restaurant',
      cuisines: ['georgian'],
      isVegetarianFriendly: true,
      recommendedDishes: ['Tbilisi Ponchiki', 'Lagidze Water'],
      bookingAdvice: 'Book sunset terrace tables in advance.',
    },
    ratings: { google: { rating: 4.8, count: 2400 } },
  };

  describe('5-Part Layout & Styling', () => {
    it('applies design tokens from lib/theme/tokens.ts', () => {
      render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={attractionStep1} totalStops={6} />
        </LanguageProvider>
      );

      const cardContainer = screen.getByTestId('stop-card-container');
      expect(cardContainer).toBeInTheDocument();
      expect(cardContainer).toHaveStyle({ backgroundColor: COLORS.canvasBg });
      expect(cardContainer).toHaveStyle({ color: COLORS.textPrimary });
    });

    it('renders STOP X OF Y order badge on top left, and Visited status on top right when visited', () => {
      render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={attractionStep1} totalStops={6} isVisited={true} />
        </LanguageProvider>
      );

      const topRow = screen.getByTestId('stop-card-header-top-row');
      expect(topRow).toBeInTheDocument();
      expect(topRow).toHaveTextContent('STOP 1 OF 6');

      const visitedBadge = screen.getByText('Visited');
      expect(topRow).toContainElement(visitedBadge);

      const orderBadge = screen.getByText('STOP 1 OF 6');
      expect(orderBadge.className).toContain('uppercase');
      expect(orderBadge.className).toContain('text-[11px]');
      expect(orderBadge.className).toContain('tracking-[0.06em]');
    });

    it('renders Google Rating badge and map navigation action buttons', () => {
      render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={attractionStep1} totalStops={6} />
        </LanguageProvider>
      );

      expect(screen.getByTestId('google-rating-badge')).toBeInTheDocument();
      expect(screen.getByText(/4.7/)).toBeInTheDocument();

      const googleBtn = screen.getByLabelText('Open in Google Maps');
      const yandexBtn = screen.getByLabelText('Open in Yandex Maps');
      expect(googleBtn).toBeInTheDocument();
      expect(yandexBtn).toBeInTheDocument();

      // Launch URL checks
      expect(googleBtn).toHaveAttribute('href', expect.stringContaining('google.com/maps'));
      expect(yandexBtn).toHaveAttribute('href', expect.stringContaining('yandex.com/maps'));
    });

    it('positions map provider buttons directly underneath location title and neighborhood metadata', () => {
      render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={attractionStep1} totalStops={6} />
        </LanguageProvider>
      );

      const heading = screen.getByRole('heading', { name: 'Freedom Square' });
      const neighborhoodMeta = screen.getByTestId('stop-neighborhood-metadata');
      const mapPillsRow = screen.getByTestId('map-pills-row');

      expect(heading).toBeInTheDocument();
      expect(neighborhoodMeta).toBeInTheDocument();
      expect(mapPillsRow).toBeInTheDocument();
    });

    it('renders Globe website link button when websiteUrl is present', () => {
      render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={venueStep6} totalStops={6} />
        </LanguageProvider>
      );

      const websiteBtn = screen.getByLabelText('Visit Website');
      expect(websiteBtn).toBeInTheDocument();
      expect(websiteBtn).toHaveAttribute('href', 'https://funicular.ge');
    });

    it('meets minimum touch target sizes for interactive action buttons', () => {
      render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={venueStep6} totalStops={6} />
        </LanguageProvider>
      );

      const googleMapBtn = screen.getByLabelText('Open in Google Maps');
      const yandexMapBtn = screen.getByLabelText('Open in Yandex Maps');
      const websiteBtn = screen.getByLabelText('Visit Website');

      expect(googleMapBtn.className).toMatch(/min-h-\[(44|48)px\]/);
      expect(yandexMapBtn.className).toMatch(/min-h-\[(44|48)px\]/);
      expect(websiteBtn.className).toMatch(/min-h-\[(44|48)px\]/);
    });
  });

  describe('Recommended Food Items List', () => {
    it('converts recommended dishes into a vertical bulleted text list (• Item) with zero pill buttons', () => {
      render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={venueStep6} totalStops={6} />
        </LanguageProvider>
      );

      const dishesContainer = screen.getByTestId('recommended-dishes');
      expect(dishesContainer).toBeInTheDocument();

      const dishList = screen.getByTestId('recommended-dishes-list');
      expect(dishList.tagName.toLowerCase()).toBe('ul');

      const dishItems = screen.getAllByTestId('dish-item');
      expect(dishItems).toHaveLength(2);
      expect(dishItems[0]).toHaveTextContent('•');
      expect(dishItems[0]).toHaveTextContent('Tbilisi Ponchiki');
      expect(dishItems[1]).toHaveTextContent('•');
      expect(dishItems[1]).toHaveTextContent('Lagidze Water');

      dishItems.forEach((item) => {
        expect(item.tagName.toLowerCase()).toBe('li');
        expect(item.querySelector('button')).toBeNull();
      });
      expect(screen.queryByTestId('dish-pill')).not.toBeInTheDocument();
    });
  });

  describe('Olya Recommendation Card & Secondary Headers', () => {
    it('renders recommendation blocks inside consolidated Olya Recommendation card with clean section titles', () => {
      render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={venueStep6} totalStops={6} />
        </LanguageProvider>
      );

      const recommendationCard = screen.getByTestId('olya-recommendation-card');
      expect(recommendationCard).toBeInTheDocument();

      // Recommendation title checks
      const recHeader = recommendationCard.firstElementChild;
      expect(recHeader).toHaveTextContent("Olya's recommendation");
      expect(recHeader?.textContent).not.toContain('✨');
      expect(recHeader?.className).not.toContain('uppercase');

      // Recommended dishes section title check
      const dishesSection = screen.getByTestId('recommended-dishes');
      expect(dishesSection.firstElementChild).toHaveTextContent('Recommended dishes');
      expect(dishesSection.firstElementChild?.textContent).not.toContain('🍽️');

      // Photo spot section title check
      const photoSpotSection = screen.getByTestId('photo-spot');
      expect(photoSpotSection).toHaveTextContent('Photo spot recommendation');
      expect(photoSpotSection.textContent).not.toContain('📷');

      // Logistics warning section title check
      const logisticsSection = screen.getByTestId('logistics-warning');
      expect(logisticsSection).toHaveTextContent('Logistics warning');
      expect(logisticsSection.textContent).not.toContain('⚠️');
    });

    it('uses soft background tinting bg-[#F3EFEA] and border-0 on inner recommendation callouts', () => {
      render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={venueStep6} totalStops={6} />
        </LanguageProvider>
      );

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
  });
});
