import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StopCard from '@/components/StopCard';
import { Stop, VenueStop, AttractionStop } from '@/lib/types/route';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { COLORS } from '@/lib/theme/tokens';

vi.mock('@/lib/services/places', () => ({
  fetchPlaceRating: vi.fn(async ({ googlePlaceId }: { googlePlaceId?: string }) =>
    googlePlaceId ? { rating: 4.6, count: 1234 } : null
  ),
}));

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

    it('renders map navigation action buttons', () => {
      render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={attractionStep1} totalStops={6} />
        </LanguageProvider>
      );

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

      const headerContainer = screen.getByTestId('stop-card-header-container');
      const heading = screen.getByRole('heading', { name: 'Freedom Square' });
      const neighborhoodMeta = screen.getByTestId('stop-neighborhood-metadata');
      const mapPillsRow = screen.getByTestId('map-pills-row');

      expect(heading).toBeInTheDocument();
      expect(neighborhoodMeta).toBeInTheDocument();
      expect(mapPillsRow).toBeInTheDocument();

      expect(headerContainer).toContainElement(neighborhoodMeta);
      expect(screen.getByTestId('act-block')).toContainElement(mapPillsRow);

      // Verify DOM order: neighborhood metadata comes before mapPillsRow
      expect(neighborhoodMeta.compareDocumentPosition(mapPillsRow)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
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

  describe('Flat Callout Recommendation Blocks & Headers', () => {
    it('renders recommendation blocks as standalone flat Callout cards with clean section titles', () => {
      render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={venueStep6} totalStops={6} />
        </LanguageProvider>
      );

      // Olya's tip section check
      const olyaTipSection = screen.getByTestId('olya-tip');
      expect(olyaTipSection).toBeInTheDocument();
      expect(olyaTipSection).toHaveTextContent("Olya's tip");

      // Recommended dishes section title check
      const dishesSection = screen.getByTestId('recommended-dishes');
      expect(dishesSection.firstElementChild).toHaveTextContent('Recommended dishes');

      // Booking advice section check
      const bookingSection = screen.getByTestId('booking-advice');
      expect(bookingSection).toHaveTextContent('Booking & seating advice');

      // Photo spot section title check
      const photoSpotSection = screen.getByTestId('photo-spot');
      expect(photoSpotSection).toHaveTextContent('Photo spot recommendation');

      // Logistics warning section title check
      const logisticsSection = screen.getByTestId('logistics-warning');
      expect(logisticsSection).toHaveTextContent('Logistics warning');
    });

    it('uses soft background tinting bg-[#F3EFEA] and border-0 on flat callout cards', () => {
      render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={venueStep6} totalStops={6} />
        </LanguageProvider>
      );

      const olyaTipCallout = screen.getByTestId('olya-tip').firstElementChild;
      const photoSpotCallout = screen.getByTestId('photo-spot').firstElementChild;
      const bookingCallout = screen.getByTestId('booking-advice').firstElementChild;

      expect(olyaTipCallout?.className).toContain('border-0');
      expect(olyaTipCallout?.className).toContain('bg-[#F3EFEA]');
      expect(photoSpotCallout?.className).toContain('border-0');
      expect(photoSpotCallout?.className).toContain('bg-[#F3EFEA]');
      expect(bookingCallout?.className).toContain('border-0');
      expect(bookingCallout?.className).toContain('bg-[#F3EFEA]');
    });
  });

  describe('Map Links resolve by Place Identity', () => {
    const cyrillicStop: Stop = {
      ...attractionStep1,
      id: 'test-step-cyrillic',
      name: 'Площадь Свободы',
      placeIds: { google: 'ChIJde6a4L4XREARZ6pL-v6Hw8U' },
    };

    const renderStop = (stop: Stop) =>
      render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={stop} totalStops={6} />
        </LanguageProvider>
      );

    it('anchors the Google link on coordinates and carries the place identity, never the name', () => {
      renderStop(cyrillicStop);

      expect(screen.getByLabelText('Open in Google Maps')).toHaveAttribute(
        'href',
        'https://www.google.com/maps/search/?api=1&query=41.6934,44.8015&query_place_id=ChIJde6a4L4XREARZ6pL-v6Hw8U'
      );
    });

    it('builds the Yandex link from coordinates only', () => {
      renderStop(cyrillicStop);

      expect(screen.getByLabelText('Open in Yandex Maps')).toHaveAttribute(
        'href',
        'https://yandex.com/maps/?pt=44.8015,41.6934&z=17'
      );
    });

    it('still pins the correct coordinates for a Stop with no place identity', () => {
      renderStop({ ...cyrillicStop, placeIds: undefined });

      expect(screen.getByLabelText('Open in Google Maps')).toHaveAttribute(
        'href',
        'https://www.google.com/maps/search/?api=1&query=41.6934,44.8015'
      );
    });

    it('offers Google and Yandex as direct one-tap links, with no provider chooser', () => {
      renderStop(cyrillicStop);

      expect(screen.getByLabelText('Open in Google Maps')).toBeInTheDocument();
      expect(screen.getByLabelText('Open in Yandex Maps')).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText(/Apple Maps/i)).not.toBeInTheDocument();
    });
  });

  describe('Act Layer and Story Layer', () => {
    const fullAttraction: AttractionStop = {
      ...(attractionStep1 as AttractionStop),
      id: 'test-act-layer',
      placeIds: { google: 'ChIJde6a4L4XREARZ6pL-v6Hw8U' },
      workingHours: '10:00 – 18:00',
      transitBadge: 'Take the funicular from Chonkadze street.',
      stopDirective: 'Enter through the side door on the left, not the main gate.',
      stopDirectiveRu: 'Заходите через боковую дверь слева, а не через главные ворота.',
      logisticsWarning: 'Steep cobblestone climb on the way here.',
    };

    const renderStop = (stop: Stop, language: 'en' | 'ru' = 'en') =>
      render(
        <LanguageProvider initialLanguage={language}>
          <StopCard stop={stop} totalStops={6} />
        </LanguageProvider>
      );

    it('renders the Act Block directly beneath the Stop title, above the first Story Layer element', () => {
      renderStop(fullAttraction);

      const neighborhoodMeta = screen.getByTestId('stop-neighborhood-metadata');
      const actBlock = screen.getByTestId('act-block');
      const storyLayer = screen.getByTestId('story-layer');

      expect(neighborhoodMeta.compareDocumentPosition(actBlock)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(actBlock.compareDocumentPosition(storyLayer)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(actBlock).not.toContainElement(storyLayer);
    });

    it('gathers Google Rating, Map Links, working hours, transit step, Stop Directive, and Logistics Warning into the Act Block', async () => {
      renderStop(fullAttraction);

      const actBlock = screen.getByTestId('act-block');

      await waitFor(() => {
        expect(actBlock).toContainElement(screen.getByTestId('google-rating-badge'));
      });
      expect(actBlock).toContainElement(screen.getByTestId('map-pills-row'));
      expect(actBlock).toContainElement(screen.getByTestId('working-hours-badge'));
      expect(actBlock).toContainElement(screen.getByTestId('transit-badge'));
      expect(actBlock).toContainElement(screen.getByTestId('stop-directive'));
      expect(actBlock).toContainElement(screen.getByTestId('logistics-warning'));
    });

    it('omits absent Act Layer items, including the rating of a Stop Google cannot resolve', async () => {
      renderStop({ ...fullAttraction, placeIds: undefined, workingHours: undefined, transitBadge: undefined, stopDirective: undefined, logisticsWarning: undefined });

      const actBlock = screen.getByTestId('act-block');
      await waitFor(() => expect(screen.getByTestId('map-pills-row')).toBeInTheDocument());

      expect(screen.queryByTestId('google-rating-badge')).not.toBeInTheDocument();
      expect(screen.queryByTestId('working-hours-badge')).not.toBeInTheDocument();
      expect(screen.queryByTestId('transit-badge')).not.toBeInTheDocument();
      expect(screen.queryByTestId('stop-directive')).not.toBeInTheDocument();
      expect(screen.queryByTestId('logistics-warning')).not.toBeInTheDocument();

      // No gap is left behind: the Act Block holds only the Map Links row.
      expect(actBlock.children).toHaveLength(1);
      expect(actBlock.firstElementChild).toBe(screen.getByTestId('map-pills-row'));
    });

    it('renders a Stop with no Act Layer content beyond title and Map Links', () => {
      renderStop({ ...attractionStep1, placeIds: undefined });

      expect(screen.getByRole('heading', { name: 'Freedom Square' })).toBeInTheDocument();
      expect(screen.getByTestId('act-block')).toContainElement(screen.getByTestId('map-pills-row'));
      expect(screen.getByTestId('story-layer')).toBeInTheDocument();
    });

    it('renders the Story Layer in full below a visible divider, never collapsed or behind a tap', () => {
      renderStop(fullAttraction);

      const divider = screen.getByTestId('layer-divider');
      const storyLayer = screen.getByTestId('story-layer');
      expect(divider.compareDocumentPosition(storyLayer)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

      expect(storyLayer).toContainElement(screen.getByTestId('historical-summary'));
      expect(storyLayer).toContainElement(screen.getByTestId('fun-fact'));
      expect(storyLayer).toContainElement(screen.getByTestId('olya-tip'));

      expect(storyLayer).toHaveTextContent('Historical central square in Tbilisi.');
      expect(storyLayer).toHaveTextContent('Monument of St. George stands in the center.');
      expect(storyLayer).toHaveTextContent('Great starting point for walking Kala district.');

      // Nothing is truncated, collapsed, or gated behind a control.
      expect(storyLayer.querySelector('details')).toBeNull();
      expect(storyLayer.querySelector('button')).toBeNull();
      expect(storyLayer.className).not.toMatch(/line-clamp|max-h-|truncate/);
    });

    it('renders the Stop Directive as an optional bilingual field', () => {
      const { unmount } = renderStop(fullAttraction);
      expect(screen.getByTestId('stop-directive')).toHaveTextContent(
        'Enter through the side door on the left, not the main gate.'
      );
      unmount();

      renderStop(fullAttraction, 'ru');
      expect(screen.getByTestId('stop-directive')).toHaveTextContent(
        'Заходите через боковую дверь слева, а не через главные ворота.'
      );
    });

    it('keeps recommended dishes and booking advice of a Venue Stop in the Act Block', () => {
      renderStop(venueStep6);

      const actBlock = screen.getByTestId('act-block');
      expect(actBlock).toContainElement(screen.getByTestId('recommended-dishes'));
      expect(actBlock).toContainElement(screen.getByTestId('booking-advice'));
      expect(actBlock).toContainElement(screen.getByTestId('photo-spot'));
      expect(actBlock).toContainElement(screen.getByTestId('logistics-warning'));
    });

    it('presents the per-Stop Logistics Warning distinctly from the route-wide summary surface', () => {
      renderStop(fullAttraction);

      const logisticsCallout = screen.getByTestId('logistics-warning').firstElementChild;
      const storyCallout = screen.getByTestId('historical-summary').firstElementChild;

      // The Route Intro Card summarises warnings on the neutral callout surface
      // (bg-[#F3EFEA], border-0); the per-Stop warning is an advisory the
      // traveler acts on now, and carries the advisory surface instead.
      expect(logisticsCallout).toHaveStyle({ backgroundColor: COLORS.advisoryBg });
      expect(logisticsCallout).toHaveStyle({ borderLeftColor: COLORS.terracottaAccent });
      expect(logisticsCallout?.className).toContain('border-l-4');
      expect(storyCallout?.className).toContain('bg-[#F3EFEA]');
      expect(logisticsCallout?.className).not.toContain('bg-[#F3EFEA]');
      expect(screen.getByTestId('logistics-warning').querySelector('svg')).toBeInTheDocument();
    });
  });
});
