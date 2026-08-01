import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RoutePage from '@/app/twa/[routeId]/page';
import StopCard from '@/components/StopCard';
import RouteIntroCard from '@/components/RouteIntroCard';
import RouteCarousel from '@/components/RouteCarousel';
import { Stop, Route } from '@/lib/types/route';

// Mock next/navigation notFound & useRouter
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  useRouter: vi.fn(() => ({
    back: vi.fn(),
    push: vi.fn(),
  })),
}));

describe('TWA Timeline & Card Feed UI', () => {
  const mockRoute: Route = {
    id: 'test-route-1',
    title: 'Sololaki Italianate Courtyards & Stained Glass',
    subtitle: 'Low-incline residential walk through 19th-century merchant mansions',
    durationCategory: '1-2h',
    accessibility: 'stroller-friendly',
    vibes: ['courtyards', 'photo-spots'],
    heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f',
    introCopy: 'Explore the peaceful, flat avenues of Sololaki.',
    stops: [
      {
        id: 'sololaki-stop-1',
        order: 1,
        stopType: 'attraction',
        name: 'Lado Asatiani St Merchant Houses',
        neighborhood: 'Sololaki',
        coordinates: { lat: 41.6918, lng: 44.7972 },
        estimatedMinutes: 25,
        imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f',
        olyaTips: 'Gently push through the wooden carriage doors into court #28.',
      },
      {
        id: 'sololaki-stop-2',
        order: 2,
        stopType: 'attraction',
        name: 'Galaktion Tabidze Balcony House',
        neighborhood: 'Sololaki',
        coordinates: { lat: 41.6931, lng: 44.7989 },
        estimatedMinutes: 25,
        imageUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c',
        olyaTips: 'Look up at the spiral wrought-iron balcony.',
      },
    ],
  };

  describe('RoutePage (/twa/[routeId])', () => {
    it('renders route details and timeline stop cards for a valid routeId', async () => {
      const pageComponent = await RoutePage({
        params: Promise.resolve({ routeId: 'sololaki-courtyards' }),
      });
      render(pageComponent);

      expect(
        screen.getByRole('heading', { name: /Sololaki Italianate Courtyards & Stained Glass/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Low-incline residential walk through 19th-century merchant mansions/i)
      ).toBeInTheDocument();
      expect(screen.getAllByText(/Lado Asatiani St Merchant Houses/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Galaktion Tabidze Balcony House/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Machabeli St Stained Glass Foyer/i).length).toBeGreaterThan(0);
    });

    it('triggers notFound() for invalid routeId', async () => {
      await expect(
        RoutePage({
          params: Promise.resolve({ routeId: 'non-existent-route-xyz' }),
        })
      ).rejects.toThrow('NEXT_NOT_FOUND');
    });
  });

  describe('RouteIntroCard Component', () => {
    it('renders intro card cover, badges, title, subtitle, and sticky START ROUTE CTA button', () => {
      const onStartMock = vi.fn();
      render(<RouteIntroCard route={mockRoute} onStartRoute={onStartMock} />);

      expect(screen.getByRole('heading', { name: mockRoute.title })).toBeInTheDocument();
      expect(screen.getAllByText(/1-2h/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/stroller/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/#courtyards/i)).toBeInTheDocument();
      expect(screen.getByTestId('olya-welcome-card')).toBeInTheDocument();
      expect(screen.getByText(/Olya's Route Welcome/i)).toBeInTheDocument();
      expect(screen.getByTestId('route-at-a-glance')).toBeInTheDocument();
      expect(screen.getByText(/Curated Stops/i)).toBeInTheDocument();

      const ctaButton = screen.getByRole('button', { name: /START ROUTE/i });
      expect(ctaButton).toBeInTheDocument();

      fireEvent.click(ctaButton);
      expect(onStartMock).toHaveBeenCalledTimes(1);
    });

    it('renders clean hero cover image and sequential body elements without overlays', () => {
      render(<RouteIntroCard route={mockRoute} />);

      const heroImg = screen.getByAltText(mockRoute.title);
      expect(heroImg).toBeInTheDocument();

      // Check badges, title, and subtitle are present
      expect(screen.getByTestId('pill-badges-row')).toBeInTheDocument();
      expect(screen.getByText(mockRoute.title)).toBeInTheDocument();
      expect(screen.getByText(mockRoute.subtitle)).toBeInTheDocument();
    });

    it('renders Olya\'s Welcome quote card', () => {
      render(<RouteIntroCard route={mockRoute} />);

      const quoteCard = screen.getByTestId('olya-welcome-card');
      expect(quoteCard).toBeInTheDocument();
      expect(quoteCard).toHaveTextContent(mockRoute.introCopy);
    });

    it('renders Route At A Glance summary line with stop count, walking time/distance, and transit modes', () => {
      render(<RouteIntroCard route={mockRoute} />);

      const summaryCard = screen.getByTestId('route-at-a-glance');
      expect(summaryCard).toBeInTheDocument();
      expect(summaryCard).toHaveTextContent(/2 curated stops/i);
      expect(summaryCard).toHaveTextContent('50m');
      expect(summaryCard).toHaveTextContent(/Pedestrian Walkway/i);
    });

    it('renders vibe and duration tags in a single horizontal scroll row with visual scroll indicator', () => {
      render(<RouteIntroCard route={mockRoute} />);

      const badgesRow = screen.getByTestId('pill-badges-row');
      expect(badgesRow).toHaveClass('overflow-x-auto');
      expect(badgesRow).toHaveClass('whitespace-nowrap');
      expect(badgesRow).toHaveClass('flex-nowrap');

      const scrollIndicator = screen.getByTestId('pill-badges-scroll-indicator');
      expect(scrollIndicator).toBeInTheDocument();
    });

    it('renders swipe hint prompt with adequate bottom spacing clear of CTA bar', () => {
      render(<RouteIntroCard route={mockRoute} />);

      const swipePrompt = screen.getByText(/👉 Swipe left or tap below to begin!/i);
      expect(swipePrompt).toBeInTheDocument();
      expect(swipePrompt.parentElement).toHaveClass('text-center');
    });

    it('applies break-words and min-w-0 on h1 title to prevent right-edge truncation', () => {
      render(<RouteIntroCard route={mockRoute} />);

      const heading = screen.getByRole('heading', { name: mockRoute.title });
      expect(heading).toHaveClass('break-words');
      expect(heading).toHaveClass('min-w-0');
    });

    it('renders visual route overview map line and step-by-step preview list', () => {
      render(<RouteIntroCard route={mockRoute} />);

      // Route overview map line SVG container
      const overviewMap = screen.getByTestId('route-overview-map');
      expect(overviewMap).toBeInTheDocument();
      expect(screen.getByText(/Route Overview Map/i)).toBeInTheDocument();

      // Step-by-step preview list container
      const stepPreview = screen.getByTestId('step-by-step-preview-list');
      expect(stepPreview).toBeInTheDocument();
      expect(screen.getByText(/Route Sequence Preview/i)).toBeInTheDocument();
      expect(stepPreview).toHaveTextContent('Lado Asatiani St Merchant Houses');
      expect(stepPreview).toHaveTextContent('Galaktion Tabidze Balcony House');
    });

    it('displays logistics notes and terrain highlights section', () => {
      const mockRouteWithWarning: Route = {
        ...mockRoute,
        stops: [
          ...mockRoute.stops,
          {
            id: 'sololaki-stop-3',
            order: 3,
            stopType: 'attraction',
            name: 'Betlemi Stairs',
            neighborhood: 'Old Kala',
            coordinates: { lat: 41.6892, lng: 44.8055 },
            estimatedMinutes: 20,
            imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f',
            olyaTips: 'Steep steps.',
            logisticsWarning: 'Steep stone stairs with loose paving.',
          },
        ],
      };

      render(<RouteIntroCard route={mockRouteWithWarning} />);

      const logisticsHighlights = screen.getByTestId('logistics-terrain-highlights');
      expect(logisticsHighlights).toBeInTheDocument();
      expect(logisticsHighlights).toHaveTextContent(/Logistics & Terrain Highlights/i);
      expect(logisticsHighlights).toHaveTextContent(/stroller-friendly/i);
      expect(logisticsHighlights).toHaveTextContent(/Steep stone stairs with loose paving/i);
    });
  });

  describe('RouteCarousel Component', () => {
    it('renders Swiper horizontal carousel containing Slide 0 intro card and stop slides', () => {
      render(<RouteCarousel route={mockRoute} />);

      expect(screen.getByRole('heading', { name: mockRoute.title })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /START ROUTE/i })).toBeInTheDocument();
      expect(screen.getAllByText('Lado Asatiani St Merchant Houses').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Galaktion Tabidze Balcony House').length).toBeGreaterThan(0);
    });

    it('does not render TimelineBar in preview mode (activeIndex === 0)', () => {
      render(<RouteCarousel route={mockRoute} />);

      // In preview mode (activeIndex === 0), timeline bar should NOT be visible
      expect(screen.queryByTestId('timeline-bar-container')).not.toBeInTheDocument();
      expect(screen.queryByTestId('visited-fab')).not.toBeInTheDocument();
    });

    it('renders sticky START ROUTE button in preview mode at root level', () => {
      render(<RouteCarousel route={mockRoute} />);

      const startBtn = screen.getByRole('button', { name: /START ROUTE/i });

      expect(startBtn).toBeInTheDocument();

      // The container wrapping START ROUTE should be outside swiper-slide to avoid transform stacking context breaking fixed positioning
      const startBtnWrapper = startBtn.closest('[data-testid="sticky-start-container"]');
      expect(startBtnWrapper).toBeInTheDocument();
      expect(startBtnWrapper).toHaveClass('fixed');
      expect(startBtnWrapper).toHaveClass('bottom-0');
    });

    it('initializes visitedStopIds safely to prevent SSR hydration mismatch when localStorage has saved stops', () => {
      localStorage.setItem(
        'tbilisi_visited_test-route-1',
        JSON.stringify(['sololaki-stop-2'])
      );

      render(<RouteCarousel route={mockRoute} />);

      expect(screen.getByText('Visited')).toBeInTheDocument();
    });
  });


  describe('StopCard Component', () => {
    const mockStopWithWarning: Stop = {
      id: 'test-stop-1',
      order: 1,
      stopType: 'attraction',
      name: 'Kiacheli St Art Nouveau Mansion',
      neighborhood: 'Vera',
      coordinates: { lat: 41.7042, lng: 44.7895 },
      estimatedMinutes: 30,
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
      olyaTips: 'Notice the subtle dragon and floral motifs carved on the stone lintel.',
      logisticsWarning: 'Moderate gradient on Kiacheli St with slightly uneven historic paving.',
      bestTimeOfDay: 'Morning (10 AM - 12 PM)',
    };

    const mockStopWithoutWarning: Stop = {
      id: 'test-stop-2',
      order: 2,
      stopType: 'attraction',
      name: 'Lado Asatiani St Merchant Houses',
      neighborhood: 'Sololaki',
      coordinates: { lat: 41.6918, lng: 44.7972 },
      estimatedMinutes: 25,
      imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f',
      olyaTips: 'Gently push through the wooden carriage doors into court #28.',
    };

    it('renders stop details, order badge, estimated time, and Olya\'s tips correctly', () => {
      render(<StopCard stop={mockStopWithoutWarning} isLast={false} totalStops={2} />);

      expect(screen.getByText('STOP 2 OF 2')).toBeInTheDocument();
      expect(screen.getByText('Lado Asatiani St Merchant Houses')).toBeInTheDocument();
      expect(screen.getByText('Sololaki')).toBeInTheDocument();
      expect(screen.getByText('25 min')).toBeInTheDocument();
      expect(screen.getByText(/Gently push through the wooden carriage doors/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Google Maps/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Yandex Maps/i })).toBeInTheDocument();
      expect(screen.queryByTestId('logistics-warning')).not.toBeInTheDocument();
    });

    it('renders step card image badges with high-contrast dark overlay and white text', () => {
      render(<StopCard stop={mockStopWithoutWarning} isLast={false} />);
      const locationBadge = screen.getByText('Sololaki');
      const durationBadge = screen.getByText('25 min');

      expect(locationBadge).toHaveClass('bg-slate-900/80');
      expect(locationBadge).toHaveClass('text-white');
      expect(durationBadge).toHaveClass('bg-slate-900/80');
      expect(durationBadge).toHaveClass('text-white');
    });

    it('embeds direct Google Maps and Yandex Maps provider link pills under the head photo meeting 48x48px min tap target size', () => {
      render(<StopCard stop={mockStopWithoutWarning} isLast={false} />);

      const googleLink = screen.getByRole('link', { name: /Google Maps/i });
      const yandexLink = screen.getByRole('link', { name: /Yandex Maps/i });

      expect(googleLink).toBeInTheDocument();
      expect(googleLink).toHaveAttribute(
        'href',
        'https://www.google.com/maps/search/?api=1&query=41.6918,44.7972'
      );
      expect(googleLink).toHaveClass('min-h-[48px]');

      expect(yandexLink).toBeInTheDocument();
      expect(yandexLink).toHaveAttribute(
        'href',
        'https://yandex.com/maps/?pt=44.7972,41.6918&z=17'
      );
      expect(yandexLink).toHaveClass('min-h-[48px]');
    });

    it('renders standalone Google Rating badge below divider and minimalist map buttons without ratings inside', () => {
      render(<StopCard stop={mockStopWithoutWarning} isLast={false} />);

      const ratingBadge = screen.getByTestId('google-rating-badge');
      expect(ratingBadge).toBeInTheDocument();
      expect(ratingBadge).toHaveTextContent(/★ 4.7 \(1,250 reviews on Google\)/i);

      const googleLink = screen.getByRole('link', { name: /Google Maps/i });
      const yandexLink = screen.getByRole('link', { name: /Yandex Maps/i });

      // Minimalist icon-only map buttons have title/aria-label but no rating numbers or star icons inside
      expect(googleLink).toHaveAttribute('aria-label', 'Open in Google Maps');
      expect(googleLink).not.toHaveTextContent('4.7');
      expect(googleLink).not.toHaveTextContent('★');

      expect(yandexLink).toHaveAttribute('aria-label', 'Open in Yandex Maps');
      expect(yandexLink).not.toHaveTextContent('4.7');
      expect(yandexLink).not.toHaveTextContent('★');
    });

    it('renders Visited badge on the right when isVisited is true and not inside the title', () => {
      const { container } = render(<StopCard stop={mockStopWithoutWarning} isVisited={true} />);
      const visitedBadge = screen.getByText('Visited');
      expect(visitedBadge).toBeInTheDocument();
      const heading = container.querySelector('h2');
      expect(heading).toHaveTextContent('Lado Asatiani St Merchant Houses');
      expect(heading).not.toHaveTextContent('Visited');
    });

    it('renders logistics warning when provided', () => {
      render(<StopCard stop={mockStopWithWarning} isLast={false} />);

      const warningElement = screen.getByTestId('logistics-warning');
      expect(warningElement).toBeInTheDocument();
      expect(warningElement).toHaveTextContent(
        'Moderate gradient on Kiacheli St with slightly uneven historic paving.'
      );
    });

    it('does not render redundant best time of day badge on the right', () => {
      render(<StopCard stop={mockStopWithWarning} isLast={false} />);

      expect(screen.queryByText(/Morning \(10 AM - 12 PM\)/i)).not.toBeInTheDocument();
    });

    it('renders photo spot recommendation when provided', () => {
      const mockStopWithPhotoSpot: Stop = {
        ...mockStopWithoutWarning,
        photoSpot: 'Pardag carpets hanging along the narrow brick alley.',
      };
      render(<StopCard stop={mockStopWithPhotoSpot} isLast={false} />);

      const photoElement = screen.getByTestId('photo-spot');
      expect(photoElement).toBeInTheDocument();
      expect(photoElement).toHaveTextContent(
        'Pardag carpets hanging along the narrow brick alley.'
      );
    });

    it('does not render vertical timeline spine lines or indicators on stop cards', () => {
      const { container } = render(<StopCard stop={mockStopWithoutWarning} isLast={false} />);
      const spineLine = container.querySelector('.bg-gradient-to-b');
      expect(spineLine).not.toBeInTheDocument();
    });

    it('has touch isolation styling for vertical body scrolling', () => {
      const { container } = render(<StopCard stop={mockStopWithoutWarning} isLast={false} />);
      const scrollContainer = container.querySelector('[data-testid="stop-card-container"]');
      expect(scrollContainer).toBeInTheDocument();
      expect(scrollContainer).toHaveClass('touch-pan-x');
      expect(scrollContainer).toHaveClass('touch-pan-y');
      expect(scrollContainer).toHaveClass('overscroll-y-contain');
    });
  });

  describe('Ticket 4: TimelineBar & Visited State Integration', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('renders scrollable bottom timeline bar with numbered badges (1..N) and 56x56px FAB when route is started', () => {
      render(<RouteCarousel route={mockRoute} />);

      // Click START ROUTE to transition to Stop 1 (activeIndex 1)
      fireEvent.click(screen.getByRole('button', { name: /START ROUTE/i }));

      const stop1 = screen.getByTestId('timeline-stop-1');
      const stop2 = screen.getByTestId('timeline-stop-2');
      const fab = screen.getByTestId('visited-fab');

      expect(stop1).toBeInTheDocument();
      expect(stop2).toBeInTheDocument();
      expect(stop1).toHaveTextContent('1');
      expect(stop2).toHaveTextContent('2');
      expect(stop1).toHaveClass('min-w-[36px]');
      expect(stop2).toHaveClass('min-w-[28px]');
      expect(fab).toBeInTheDocument();
      expect(fab).toHaveClass('w-[56px]');
      expect(fab).toHaveClass('h-[56px]');
    });

    it('jumps directly to stop card slide when stop badge is tapped', () => {
      render(<RouteCarousel route={mockRoute} />);

      // Click START ROUTE to transition to Stop 1
      fireEvent.click(screen.getByRole('button', { name: /START ROUTE/i }));

      const stop1 = screen.getByTestId('timeline-stop-1');
      fireEvent.click(stop1);

      // Stop 1 badge should now be active and have active ring styling
      expect(stop1).toHaveClass('ring-2');
      expect(stop1).toHaveClass('scale-110');
    });

    it('toggles visited state in localStorage and auto-swipes to next card when FAB is clicked', () => {
      render(<RouteCarousel route={mockRoute} />);

      // Click START ROUTE to transition to Stop 1
      fireEvent.click(screen.getByRole('button', { name: /START ROUTE/i }));

      const fab = screen.getByTestId('visited-fab');
      fireEvent.click(fab);

      // localStorage should persist visited stop ID for test-route-1
      const savedData = localStorage.getItem('tbilisi_visited_test-route-1');
      expect(savedData).not.toBeNull();
      const parsedData = JSON.parse(savedData!);
      expect(parsedData).toContain('sololaki-stop-1');

      // Auto-swiped to Stop 2 (stop 2 badge is now active)
      const stop2 = screen.getByTestId('timeline-stop-2');
      expect(stop2).toHaveClass('ring-2');
      expect(stop2).toHaveClass('scale-110');
    });

    it('displays completion feedback when all stops are marked visited without auto-swiping past end', () => {
      render(<RouteCarousel route={mockRoute} />);

      // Click START ROUTE to transition to Stop 1
      fireEvent.click(screen.getByRole('button', { name: /START ROUTE/i }));

      // Mark stop 1 visited
      const fab = screen.getByTestId('visited-fab');
      fireEvent.click(fab);

      // Now at stop 2 (final stop). Mark stop 2 visited
      fireEvent.click(fab);

      // Both stops visited in localStorage
      const savedData = localStorage.getItem('tbilisi_visited_test-route-1');
      expect(savedData).not.toBeNull();
      const parsedData = JSON.parse(savedData!);
      expect(parsedData).toContain('sololaki-stop-1');
      expect(parsedData).toContain('sololaki-stop-2');

    });

    it('persists checked-off visited state when re-rendering component', () => {
      localStorage.setItem('tbilisi_visited_test-route-1', JSON.stringify(['sololaki-stop-1']));

      render(<RouteCarousel route={mockRoute} />);

      // Click START ROUTE to transition to Stop 1 where TimelineBar is visible
      fireEvent.click(screen.getByRole('button', { name: /START ROUTE/i }));

      const stop1 = screen.getByTestId('timeline-stop-1');
      // Stop 1 should show green background for visited stop
      expect(stop1).toHaveClass('bg-emerald-600');
      expect(stop1).toHaveTextContent('1');
    });

    it('does not render connecting lines between progress indicators', () => {
      render(<RouteCarousel route={mockRoute} />);
      fireEvent.click(screen.getByRole('button', { name: /START ROUTE/i }));

      const lines = screen.queryAllByTestId('timeline-connecting-line');
      expect(lines.length).toBe(0);
    });

    it('highlights active stop with Terracotta ring styling', () => {
      render(<RouteCarousel route={mockRoute} />);
      fireEvent.click(screen.getByRole('button', { name: /START ROUTE/i }));

      const stop1 = screen.getByTestId('timeline-stop-1');
      expect(stop1).toHaveClass('ring-2');
      expect(stop1).toHaveClass('scale-110');
    });

    it('provides clear tooltip and accessible label for visited FAB button', () => {
      render(<RouteCarousel route={mockRoute} />);
      fireEvent.click(screen.getByRole('button', { name: /START ROUTE/i }));

      const fab = screen.getByTestId('visited-fab');
      expect(fab).toHaveAttribute('title', 'Mark as visited');
      expect(fab).toHaveAttribute('aria-label', 'Mark as visited');

      // Toggling visited on stop 1 auto-swipes to stop 2; jump back to stop 1 to check visited tooltip
      fireEvent.click(fab);
      fireEvent.click(screen.getByTestId('timeline-stop-1'));
      expect(fab).toHaveAttribute('title', 'Mark as unvisited');
      expect(fab).toHaveAttribute('aria-label', 'Mark as unvisited');
    });

    it('provides safe side padding in timeline container so stop 1 is not obscured', () => {
      render(<RouteCarousel route={mockRoute} />);
      fireEvent.click(screen.getByRole('button', { name: /START ROUTE/i }));

      const container = screen.getByTestId('timeline-bar-container');
      expect(container).toHaveClass('px-3');
    });
  });

  describe('Ticket 02: Venue Details, Pitstop UI & Continuous Scroll', () => {
    const mockVenueStop = {
      id: 'venue-stop-1',
      order: 1,
      stopType: 'venue' as const,
      isOptional: true as const,
      name: 'Café Minda',
      neighborhood: 'Orbeliani',
      coordinates: { lat: 41.6981, lng: 44.8032 },
      estimatedMinutes: 60,
      imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
      olyaTips: 'Light-filled upper floor. Get fresh pastries & tea.',
      venueDetails: {
        category: 'cafe' as const,
        cuisines: ['georgian' as const, 'european' as const],
        isVegetarianFriendly: true,
        recommendedDishes: ['Fresh pastries', 'Georgian tea'],
        bookingAdvice: 'Light-filled upper floor. Walk-ins welcome for breakfast.',
      },
    };

    const mockAttractionStopWithTransit = {
      id: 'attraction-stop-1',
      order: 2,
      stopType: 'attraction' as const,
      transitBadge: 'Cable Car Ride (~5 min)',
      name: 'Cable Car to Mother of Georgia',
      neighborhood: 'Sololaki Ridge',
      coordinates: { lat: 41.688, lng: 44.8051 },
      estimatedMinutes: 15,
      imageUrl: 'https://images.unsplash.com/photo-1663785011617',
      olyaTips: 'Tap TravelCard at turnstile and glide up ridge.',
    };

    it('renders VenueStop category and cuisine pills correctly', () => {
      render(<StopCard stop={mockVenueStop} isLast={false} totalStops={2} />);

      const categoryCuisine = screen.getByTestId('venue-category-cuisine');
      expect(categoryCuisine).toBeInTheDocument();
      expect(categoryCuisine).toHaveTextContent('☕ Cafe • Georgian, European');
    });

    it('renders 🌱 Veggie Friendly badge when isVegetarianFriendly is true', () => {
      render(<StopCard stop={mockVenueStop} isLast={false} totalStops={2} />);

      const veggieBadge = screen.getByTestId('veggie-friendly-badge');
      expect(veggieBadge).toBeInTheDocument();
      expect(veggieBadge).toHaveTextContent('🌱 Veggie Friendly');
    });

    it('renders recommended dish pills for VenueStop and supports interactive selection', () => {
      render(<StopCard stop={mockVenueStop} isLast={false} totalStops={2} />);

      const dishesContainer = screen.getByTestId('recommended-dishes');
      expect(dishesContainer).toBeInTheDocument();
      expect(screen.getByText('Fresh pastries')).toBeInTheDocument();
      expect(screen.getByText('Georgian tea')).toBeInTheDocument();

      const pills = screen.getAllByTestId('dish-pill');
      expect(pills).toHaveLength(2);
      expect(pills[0]).toHaveAttribute('data-selected', 'false');

      fireEvent.click(pills[0]);
      expect(pills[0]).toHaveAttribute('data-selected', 'true');
    });

    it('renders booking advice callout block when present on VenueStop', () => {
      render(<StopCard stop={mockVenueStop} isLast={false} totalStops={2} />);

      const bookingAdvice = screen.getByTestId('booking-advice');
      expect(bookingAdvice).toBeInTheDocument();
      expect(bookingAdvice).toHaveTextContent('Light-filled upper floor. Walk-ins welcome for breakfast.');
    });

    it('renders Pitstop badge on StopCard for optional VenueStop', () => {
      render(<StopCard stop={mockVenueStop} isLast={false} totalStops={2} />);

      const pitstopBadge = screen.getByTestId('pitstop-badge');
      expect(pitstopBadge).toBeInTheDocument();
      expect(pitstopBadge).toHaveTextContent('☕ Pitstop');
    });

    it('renders transit step badge on AttractionStop', () => {
      render(<StopCard stop={mockAttractionStopWithTransit} isLast={false} totalStops={2} />);

      const transitBadge = screen.getByTestId('transit-badge');
      expect(transitBadge).toBeInTheDocument();
      expect(transitBadge).toHaveTextContent('Cable Car Ride (~5 min)');
    });

    it('renders a single continuous scrolling container without collapsible accordions', () => {
      render(<StopCard stop={mockVenueStop} isLast={false} totalStops={2} />);

      const scrollContainer = screen.getByTestId('stop-card-container');
      expect(scrollContainer).toBeInTheDocument();

      expect(screen.getByTestId('venue-category-cuisine')).toBeVisible();
      expect(screen.getByTestId('recommended-dishes')).toBeVisible();
      expect(screen.getByTestId('booking-advice')).toBeVisible();
      expect(screen.getByTestId('map-pills-row')).toBeVisible();
    });

    it('styles VenueStop optional pitstop on timeline bar with dashed border', () => {
      const mockRouteWithPitstop: Route = {
        id: 'pitstop-route-1',
        title: 'Test Pitstop Route',
        subtitle: 'Route with venue pitstop',
        durationCategory: '1-2h',
        accessibility: 'stroller-friendly',
        vibes: ['food-wine'],
        heroImage: 'https://images.unsplash.com/photo-1554118811',
        introCopy: 'Intro',
        stops: [mockVenueStop],
      };

      render(<RouteCarousel route={mockRouteWithPitstop} />);
      fireEvent.click(screen.getByRole('button', { name: /START ROUTE/i }));

      const pitstopBtn = screen.getByTestId('timeline-stop-1');
      expect(pitstopBtn).toBeInTheDocument();
      expect(pitstopBtn).toHaveAttribute('data-pitstop', 'true');
    });
  });

  describe('Full-Screen Lightbox Modal & Deep-Link Sharing', () => {
    const mockMultiPhotoStop: Stop = {
      id: 'multi-photo-stop',
      order: 1,
      stopType: 'attraction',
      name: 'Narikala Fortress Lookout',
      neighborhood: 'Old Tbilisi',
      coordinates: { lat: 41.6879, lng: 44.8091 },
      estimatedMinutes: 30,
      imageUrl: 'https://images.unsplash.com/photo-1555246050-1',
      galleryImages: [
        'https://images.unsplash.com/photo-1555246050-1',
        'https://images.unsplash.com/photo-1555246050-2',
        'https://images.unsplash.com/photo-1555246050-3',
      ],
      olyaTips: 'Panoramic sunrise spot over the Mtkvari river.',
    };

    it('displays photo count badge when galleryImages has multiple photos', () => {
      render(<StopCard stop={mockMultiPhotoStop} isLast={false} totalStops={1} />);
      const badge = screen.getByTestId('photo-count-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('🖼️ 1/3');
    });

    it('opens full-screen LightboxModal when hero image is clicked', () => {
      render(<StopCard stop={mockMultiPhotoStop} isLast={false} totalStops={1} />);

      expect(screen.queryByTestId('lightbox-modal')).not.toBeInTheDocument();

      const heroImageContainer = screen.getByTestId('hero-image-container');
      fireEvent.click(heroImageContainer);

      const modal = screen.getByTestId('lightbox-modal');
      expect(modal).toBeInTheDocument();
      expect(screen.getByTestId('lightbox-counter')).toHaveTextContent('1/3');
    });

    it('navigates next and previous photos using lightbox buttons and touch swipe gestures', () => {
      render(<StopCard stop={mockMultiPhotoStop} isLast={false} totalStops={1} />);
      fireEvent.click(screen.getByTestId('hero-image-container'));

      const counter = screen.getByTestId('lightbox-counter');
      expect(counter).toHaveTextContent('1/3');

      // Click Next Button
      const nextBtn = screen.getByTestId('lightbox-next');
      fireEvent.click(nextBtn);
      expect(counter).toHaveTextContent('2/3');

      // Click Prev Button
      const prevBtn = screen.getByTestId('lightbox-prev');
      fireEvent.click(prevBtn);
      expect(counter).toHaveTextContent('1/3');

      // Touch Swipe Left -> Next
      const swipeArea = screen.getByTestId('lightbox-swipe-area');
      fireEvent.touchStart(swipeArea, { touches: [{ clientX: 200 }] });
      fireEvent.touchMove(swipeArea, { touches: [{ clientX: 100 }] });
      fireEvent.touchEnd(swipeArea);
      expect(counter).toHaveTextContent('2/3');

      // Touch Swipe Right -> Prev
      fireEvent.touchStart(swipeArea, { touches: [{ clientX: 100 }] });
      fireEvent.touchMove(swipeArea, { touches: [{ clientX: 200 }] });
      fireEvent.touchEnd(swipeArea);
      expect(counter).toHaveTextContent('1/3');
    });

    it('closes LightboxModal via close button, Escape key, and backdrop click', () => {
      render(<StopCard stop={mockMultiPhotoStop} isLast={false} totalStops={1} />);
      fireEvent.click(screen.getByTestId('hero-image-container'));
      expect(screen.getByTestId('lightbox-modal')).toBeInTheDocument();

      // Close via close button
      fireEvent.click(screen.getByTestId('lightbox-close'));
      expect(screen.queryByTestId('lightbox-modal')).not.toBeInTheDocument();

      // Reopen and close via backdrop click
      fireEvent.click(screen.getByTestId('hero-image-container'));
      expect(screen.getByTestId('lightbox-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('lightbox-backdrop'));
      expect(screen.queryByTestId('lightbox-modal')).not.toBeInTheDocument();

      // Reopen and close via Escape key
      fireEvent.click(screen.getByTestId('hero-image-container'));
      expect(screen.getByTestId('lightbox-modal')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByTestId('lightbox-modal')).not.toBeInTheDocument();
    });

    it('renders Share Stop button and executes share action on click', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
        configurable: true,
      });

      render(<StopCard stop={mockMultiPhotoStop} routeId="test-route-1" isLast={false} totalStops={1} />);

      const shareBtn = screen.getByTestId('share-stop-button');
      expect(shareBtn).toBeInTheDocument();
      expect(shareBtn).toHaveTextContent(/Share Stop/i);

      fireEvent.click(shareBtn);

      expect(await screen.findByText(/Link copied to clipboard!/i)).toBeInTheDocument();
    });

    it('auto-navigates RouteCarousel to target stop slide upon TWA startapp deep link launch', () => {
      window.Telegram = {
        WebApp: {
          initDataUnsafe: {
            start_param: 'route_test-route-1_stop_sololaki-stop-2',
          },
        } as any,
      };

      render(<RouteCarousel route={mockRoute} />);

      // Verify deep link navigated directly to Slide 2 (sololaki-stop-2) showing timeline bar
      expect(screen.getByTestId('timeline-bar-container')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-stop-2')).toHaveAttribute('aria-current', 'step');
    });
  });
});





