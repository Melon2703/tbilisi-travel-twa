import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StopCard from '@/components/StopCard';
import RouteCarousel from '@/components/RouteCarousel';
import RoutePage from '@/app/twa/[routeId]/page';
import { ROUTES } from '@/lib/data/routes';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { COLORS, TYPOGRAPHY, COMPONENT_TOKENS } from '@/lib/theme/tokens';
import { Stop } from '@/lib/types/route';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  useRouter: vi.fn(() => ({
    back: vi.fn(),
    push: vi.fn(),
  })),
}));

describe('Heartbeat Express (heartbeat-express-1-2h) Parity & Component Test Suite (Issue 33)', () => {
  const expressRoute = ROUTES.find((r) => r.id === 'heartbeat-express-1-2h');

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('1. Verifies heartbeat-express-1-2h route configuration has 6 curated stops', () => {
    expect(expressRoute).toBeDefined();
    expect(expressRoute?.stops).toHaveLength(6);
    expect(expressRoute?.durationCategory).toBe('1-2h');
    expect(expressRoute?.accessibility).toBe('stroller-friendly');
  });

  it('2. Verifies header status labels (STOP 1 OF 6 through STOP 6 OF 6) on all 6 stops', () => {
    expect(expressRoute).toBeDefined();
    expressRoute!.stops.forEach((stop, index) => {
      const stopOrder = index + 1;
      const { unmount } = render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={stop} routeId="heartbeat-express-1-2h" totalStops={6} />
        </LanguageProvider>
      );

      // Verify header status label (STOP 1 OF 6 ... STOP 6 OF 6)
      expect(screen.getByText(`STOP ${stopOrder} OF 6`)).toBeInTheDocument();

      unmount();
    });
  });

  it('3. Verifies every stop in heartbeat-express-1-2h displays full 5-part layout elements', () => {
    expect(expressRoute).toBeDefined();
    expressRoute!.stops.forEach((stop, index) => {
      const stopOrder = index + 1;
      const { unmount } = render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={stop} routeId="heartbeat-express-1-2h" totalStops={6} />
        </LanguageProvider>
      );

      // Part 1: Header Bar with Status Label & Title
      expect(screen.getByText(`STOP ${stopOrder} OF 6`)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: stop.name })).toBeInTheDocument();

      // Part 2: Visual Cover with Hero Image & Floating Badges
      expect(screen.getByTestId('hero-image-container')).toBeInTheDocument();
      expect(screen.getAllByText(stop.neighborhood).length).toBeGreaterThan(0);
      expect(screen.getByText(`${stop.estimatedMinutes} min`)).toBeInTheDocument();

      // Part 3: Short Overview Layout (working hours, transit, historical summary, or venue details)
      if (stop.workingHours) {
        expect(screen.getByTestId('working-hours-badge')).toBeInTheDocument();
      }
      if (stop.stopType === 'venue') {
        expect(screen.getByTestId('venue-details-header')).toBeInTheDocument();
      }

      // Part 4: Flat Callouts (Olya's Tip, Historical summary, etc.)
      if (stop.olyaTips) {
        expect(screen.getByTestId('olya-tip')).toBeInTheDocument();
      }

      // Part 5: Map/Website Action Pills
      expect(screen.getByTestId('map-pills-row')).toBeInTheDocument();
      expect(screen.getByLabelText('Open in Google Maps')).toBeInTheDocument();
      expect(screen.getByLabelText('Open in Yandex Maps')).toBeInTheDocument();

      unmount();
    });
  });

  it('4. Verifies map links and website buttons across all stops of heartbeat-express-1-2h', () => {
    expect(expressRoute).toBeDefined();
    const expectedWebsites: Record<number, string> = {
      0: 'https://tbilisi.gov.ge',
      1: 'https://orbelianibazaar.ge',
      3: 'https://gabriadze.com',
      5: 'https://tbilisi.gov.ge',
    };

    expressRoute!.stops.forEach((stop, index) => {
      const { unmount } = render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={stop} totalStops={6} />
        </LanguageProvider>
      );

      // Verify Map Links
      expect(screen.getByLabelText('Open in Google Maps')).toBeInTheDocument();
      expect(screen.getByLabelText('Open in Yandex Maps')).toBeInTheDocument();

      // Verify Website Link if expected
      if (expectedWebsites[index]) {
        expect(screen.getByLabelText('Visit Website')).toHaveAttribute('href', expectedWebsites[index]);
      }

      unmount();
    });
  });

  it('5. Verifies Stop 6 displays Rike Park photo & website link', () => {
    expect(expressRoute).toBeDefined();
    const rikeParkStop = expressRoute!.stops[5];

    expect(rikeParkStop.id).toBe('hb-stop-9');
    expect(rikeParkStop.order).toBe(6);
    expect(rikeParkStop.name).toBe('Rike Park');
    expect(rikeParkStop.imageUrl).toBe(
      'https://images.unsplash.com/photo-1707908884432-26832ebb2e12?auto=format&fit=crop&w=800&q=80'
    );
    expect(rikeParkStop.websiteUrl).toBe('https://tbilisi.gov.ge');

    render(
      <LanguageProvider initialLanguage="en">
        <StopCard stop={rikeParkStop} totalStops={6} />
      </LanguageProvider>
    );

    // Verify Rike Park photo is rendered inside hero image container
    const heroImgContainer = screen.getByTestId('hero-image-container');
    expect(heroImgContainer).toBeInTheDocument();
    const img = screen.getByAltText('Rike Park');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toContain('photo-1707908884432-26832ebb2e12');

    // Verify website action link on Stop 6
    const websiteLink = screen.getByLabelText('Visit Website');
    expect(websiteLink).toBeInTheDocument();
    expect(websiteLink).toHaveAttribute('href', 'https://tbilisi.gov.ge');
  });

  it('6. Verifies design tokens (COLORS, TYPOGRAPHY, COMPONENT_TOKENS) are imported and applied in StopCard layout', () => {
    expect(expressRoute).toBeDefined();
    const stop1 = expressRoute!.stops[0];

    render(
      <LanguageProvider initialLanguage="en">
        <StopCard stop={stop1} totalStops={6} />
      </LanguageProvider>
    );

    const cardContainer = screen.getByTestId('stop-card-container');
    expect(cardContainer).toBeInTheDocument();
    expect(cardContainer).toHaveStyle({ backgroundColor: COLORS.canvasBg, color: COLORS.textPrimary });

    const olyaTipCallout = screen.getByTestId('olya-tip');
    expect(olyaTipCallout).toBeInTheDocument();

    const heading = screen.getByRole('heading', { name: stop1.name });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveStyle({ color: COLORS.textPrimary });
  });

  it('7. Verifies touch targets meet minimum 44px / 48px bounds across all interactive action links', () => {
    expect(expressRoute).toBeDefined();
    // Stop 6 has Google Maps, Yandex Maps, and Website action links
    const stop6 = expressRoute!.stops[5];

    render(
      <LanguageProvider initialLanguage="en">
        <StopCard stop={stop6} totalStops={6} />
      </LanguageProvider>
    );

    const googleMapLink = screen.getByLabelText('Open in Google Maps');
    const yandexMapLink = screen.getByLabelText('Open in Yandex Maps');
    const websiteLink = screen.getByLabelText('Visit Website');

    // Assert minimum 44px / 48px touch target size classes
    expect(googleMapLink.className).toMatch(/min-h-\[(44|48)px\]/);
    expect(googleMapLink.className).toMatch(/min-w-\[(44|48)px\]/);
    expect(yandexMapLink.className).toMatch(/min-h-\[(44|48)px\]/);
    expect(yandexMapLink.className).toMatch(/min-w-\[(44|48)px\]/);
    expect(websiteLink.className).toMatch(/min-h-\[(44|48)px\]/);
    expect(websiteLink.className).toMatch(/min-w-\[(44|48)px\]/);
  });

  it('8. Verifies RouteCarousel renders heartbeat-express-1-2h with intro card and 6 stop slides', () => {
    expect(expressRoute).toBeDefined();

    render(
      <LanguageProvider initialLanguage="en">
        <RouteCarousel route={expressRoute!} />
      </LanguageProvider>
    );

    // Intro title
    expect(screen.getByRole('heading', { name: expressRoute!.title })).toBeInTheDocument();
    // Start route button
    expect(screen.getByRole('button', { name: /START ROUTE/i })).toBeInTheDocument();

    // Verify all 6 stop titles are rendered in carousel slides
    expressRoute!.stops.forEach((stop) => {
      expect(screen.getAllByText(stop.name).length).toBeGreaterThan(0);
    });
  });

  it('9. Verifies RoutePage loads heartbeat-express-1-2h route successfully', async () => {
    const pageComponent = await RoutePage({
      params: Promise.resolve({ routeId: 'heartbeat-express-1-2h' }),
    });

    render(
      <LanguageProvider initialLanguage="en">
        {pageComponent}
      </LanguageProvider>
    );

    expect(screen.getByRole('heading', { name: /Heartbeat Express: Historic Center Flat Walk/i })).toBeInTheDocument();
  });
});
