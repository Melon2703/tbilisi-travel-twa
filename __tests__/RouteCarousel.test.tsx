import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import RouteCarousel from '@/components/RouteCarousel';
import { Route, Stop } from '@/lib/types/route';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    back: vi.fn(),
    push: vi.fn(),
  })),
  notFound: vi.fn(),
}));

const mockRoute: Route = {
  id: 'carousel-test-route',
  title: 'Sololaki Architectural Gems',
  subtitle: 'A walking tour through 19th century mansions',
  durationCategory: '1-2h',
  accessibility: 'moderate',
  vibes: ['courtyards', 'architecture'],
  heroImage: '/images/sololaki.jpg',
  introCopy: 'Welcome to Sololaki.',
  stops: [
    {
      id: 'stop-1',
      order: 1,
      name: 'Kalantarov Mansion',
      neighborhood: 'Sololaki',
      coordinates: { lat: 41.6912, lng: 44.7989 },
      estimatedMinutes: 25,
      imageUrl: '/images/kalantarov.jpg',
      olyaTips: 'Look up at the painted ceiling.',
      stopType: 'attraction',
    },
  ],
};

describe('RouteCarousel Component', () => {
  it('renders sticky START ROUTE CTA bar without an on-screen swipe hint', () => {
    render(
      <LanguageProvider>
        <RouteCarousel route={mockRoute} />
      </LanguageProvider>
    );

    expect(screen.queryByTestId('swipe-prompt-container')).not.toBeInTheDocument();

    const stickyStartBar = screen.getByTestId('sticky-start-container');
    expect(stickyStartBar).toBeInTheDocument();
    expect(stickyStartBar).toHaveClass('fixed');
    expect(stickyStartBar).toHaveClass('bottom-0');
    expect(stickyStartBar).toHaveClass('bg-gradient-to-t');
  });

  it('renders RouteCarousel without throwing errors when mounted with TelegramProvider', () => {
    render(
      <LanguageProvider>
        <RouteCarousel route={mockRoute} />
      </LanguageProvider>
    );

    expect(screen.getByText('Sololaki Architectural Gems')).toBeInTheDocument();
  });

  describe('Google Rating', () => {
    const originalFetch = globalThis.fetch;

    afterEach(() => {
      globalThis.fetch = originalFetch;
      vi.restoreAllMocks();
    });

    const routeWith = (stop: Partial<Stop>): Route => ({
      ...mockRoute,
      stops: [{ ...mockRoute.stops[0], ...stop } as Stop],
    });

    const renderCarousel = (route: Route) =>
      render(
        <LanguageProvider>
          <RouteCarousel route={route} />
        </LanguageProvider>
      );

    it('renders no rating element for a Stop whose rating cannot be resolved', () => {
      renderCarousel(routeWith({}));

      expect(screen.queryByTestId('google-rating-badge')).not.toBeInTheDocument();
      expect(screen.queryByText(/reviews on Google/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/★/)).not.toBeInTheDocument();
    });

    it('renders a real rating with its review count', async () => {
      globalThis.fetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ google: { rating: 4.6, count: 8520 } }), { status: 200 })
      ) as unknown as typeof fetch;

      renderCarousel(routeWith({ placeIds: { google: 'ChIJkalantarov' } }));

      await waitFor(() =>
        expect(screen.getByTestId('google-rating-badge')).toHaveTextContent(
          /★ 4\.6 \(8,520 reviews on Google\)/
        )
      );

      // The rating sits above the Map Links, as CONTEXT.md describes them.
      const ratingBadge = screen.getByTestId('google-rating-badge');
      const mapPillsRow = screen.getByTestId('map-pills-row');
      expect(ratingBadge.compareDocumentPosition(mapPillsRow)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    });

    it('renders the rest of the Stop Card before the rating resolves, then shows the arriving rating', async () => {
      let resolveFetch: (response: Response) => void = () => {};
      globalThis.fetch = vi.fn(
        () => new Promise<Response>((resolve) => { resolveFetch = resolve; })
      ) as unknown as typeof fetch;

      renderCarousel(routeWith({ placeIds: { google: 'ChIJkalantarov' } }));

      // The card is fully readable while the rating is still in flight.
      expect(screen.getAllByText('Kalantarov Mansion').length).toBeGreaterThan(0);
      const tipBeforeRating = screen.getByText(/Look up at the painted ceiling\./);
      const mapLinkBeforeRating = screen.getByRole('link', { name: /Google Maps/i });
      expect(screen.queryByTestId('google-rating-badge')).not.toBeInTheDocument();

      resolveFetch(
        new Response(JSON.stringify({ google: { rating: 4.9, count: 1204 } }), { status: 200 })
      );

      await waitFor(() =>
        expect(screen.getByTestId('google-rating-badge')).toHaveTextContent(
          /★ 4\.9 \(1,204 reviews on Google\)/
        )
      );

      // The rest of the card is the same DOM, untouched by the arriving rating.
      expect(screen.getByText(/Look up at the painted ceiling\./)).toBe(tipBeforeRating);
      expect(screen.getByRole('link', { name: /Google Maps/i })).toBe(mapLinkBeforeRating);
    });

    it('renders no rating when the resolution fails', async () => {
      globalThis.fetch = vi.fn(async () => new Response('{}', { status: 500 })) as unknown as typeof fetch;

      renderCarousel(routeWith({ placeIds: { google: 'ChIJkalantarov' } }));

      await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
      expect(screen.queryByTestId('google-rating-badge')).not.toBeInTheDocument();
    });
  });
});
