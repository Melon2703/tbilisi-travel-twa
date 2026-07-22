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
      expect(screen.getByText(/Lado Asatiani St Merchant Houses/i)).toBeInTheDocument();
      expect(screen.getByText(/Galaktion Tabidze Balcony House/i)).toBeInTheDocument();
      expect(screen.getByText(/Machabeli St Stained Glass Foyer/i)).toBeInTheDocument();
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
      expect(screen.getByText(mockRoute.subtitle)).toBeInTheDocument();
      expect(screen.getByText(/1-2h/i)).toBeInTheDocument();
      expect(screen.getByText(/stroller/i)).toBeInTheDocument();
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
      expect(summaryCard).toHaveTextContent('2 Curated Stops');
      expect(summaryCard).toHaveTextContent('50m');
      expect(summaryCard).toHaveTextContent('Pedestrian Walkway');
    });
  });

  describe('RouteCarousel Component', () => {
    it('renders Swiper horizontal carousel containing Slide 0 intro card and stop slides', () => {
      render(<RouteCarousel route={mockRoute} />);

      expect(screen.getByRole('heading', { name: mockRoute.title })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /START ROUTE/i })).toBeInTheDocument();
      expect(screen.getByText('Lado Asatiani St Merchant Houses')).toBeInTheDocument();
      expect(screen.getByText('Galaktion Tabidze Balcony House')).toBeInTheDocument();
    });

    it('does not render TimelineBar in preview mode (activeIndex === 0)', () => {
      render(<RouteCarousel route={mockRoute} />);

      // In preview mode (activeIndex === 0), timeline bar should NOT be visible
      expect(screen.queryByTestId('timeline-bar-container')).not.toBeInTheDocument();
      expect(screen.queryByTestId('visited-fab')).not.toBeInTheDocument();
    });

    it('renders sticky START ROUTE button in preview mode at root level', () => {
      const { container } = render(<RouteCarousel route={mockRoute} />);

      const startBtn = screen.getByRole('button', { name: /START ROUTE/i });
      expect(startBtn).toBeInTheDocument();

      // The container wrapping START ROUTE should be outside swiper-slide to avoid transform stacking context breaking fixed positioning
      const startBtnWrapper = startBtn.closest('[data-testid="sticky-start-container"]');
      expect(startBtnWrapper).toBeInTheDocument();
      expect(startBtnWrapper).toHaveClass('fixed');
      expect(startBtnWrapper).toHaveClass('bottom-0');
    });
  });

  describe('StopCard Component', () => {
    const mockStopWithWarning: Stop = {
      id: 'test-stop-1',
      order: 1,
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

    it('embeds direct Google Maps and Yandex Maps provider link pills under the head photo', () => {
      render(<StopCard stop={mockStopWithoutWarning} isLast={false} />);

      const googleLink = screen.getByRole('link', { name: /Google Maps/i });
      const yandexLink = screen.getByRole('link', { name: /Yandex Maps/i });

      expect(googleLink).toBeInTheDocument();
      expect(googleLink).toHaveAttribute(
        'href',
        'https://www.google.com/maps/search/?api=1&query=41.6918,44.7972'
      );

      expect(yandexLink).toBeInTheDocument();
      expect(yandexLink).toHaveAttribute(
        'href',
        'https://yandex.com/maps/?pt=44.7972,41.6918&z=17'
      );
    });

    it('renders logistics warning when provided', () => {
      render(<StopCard stop={mockStopWithWarning} isLast={false} />);

      const warningElement = screen.getByTestId('logistics-warning');
      expect(warningElement).toBeInTheDocument();
      expect(warningElement).toHaveTextContent(
        'Moderate gradient on Kiacheli St with slightly uneven historic paving.'
      );
    });

    it('renders best time of day when provided', () => {
      render(<StopCard stop={mockStopWithWarning} isLast={false} />);

      expect(screen.getByText(/Morning \(10 AM - 12 PM\)/i)).toBeInTheDocument();
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

    it('does not render vertical timeline spine lines or node indicators on stop cards', () => {
      const { container } = render(<StopCard stop={mockStopWithoutWarning} isLast={false} />);
      const spineLine = container.querySelector('.bg-gradient-to-b');
      expect(spineLine).not.toBeInTheDocument();
    });

    it('has touch isolation styling for vertical body scrolling', () => {
      const { container } = render(<StopCard stop={mockStopWithoutWarning} isLast={false} />);
      const scrollContainer = container.querySelector('[data-testid="stop-card-container"]');
      expect(scrollContainer).toBeInTheDocument();
      expect(scrollContainer).toHaveClass('touch-pan-x');
      expect(scrollContainer).toHaveClass('pan-y');
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
      expect(stop1).toHaveClass('ring-4');
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
      expect(stop2).toHaveClass('ring-4');
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

      // Completion feedback should be visible
      expect(screen.getByTestId('completion-feedback')).toBeInTheDocument();
      expect(screen.getByText(/Route completed! All stops visited!/i)).toBeInTheDocument();
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
  });
});



