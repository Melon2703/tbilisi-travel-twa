import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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
      expect(screen.getByText(/stroller-friendly/i)).toBeInTheDocument();
      expect(screen.getByText(/#courtyards/i)).toBeInTheDocument();
      expect(screen.getByText(/Olya's Route Welcome/i)).toBeInTheDocument();
      expect(screen.getByText(/Curated Stops/i)).toBeInTheDocument();

      const ctaButton = screen.getByRole('button', { name: /START ROUTE/i });
      expect(ctaButton).toBeInTheDocument();

      fireEvent.click(ctaButton);
      expect(onStartMock).toHaveBeenCalledTimes(1);
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
      render(<StopCard stop={mockStopWithoutWarning} isLast={false} />);

      expect(screen.getByText('Stop 2')).toBeInTheDocument();
      expect(screen.getByText('Lado Asatiani St Merchant Houses')).toBeInTheDocument();
      expect(screen.getByText('Sololaki')).toBeInTheDocument();
      expect(screen.getByText('25 min')).toBeInTheDocument();
      expect(screen.getByText(/Gently push through the wooden carriage doors/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Open in Maps/i })).toBeInTheDocument();
      expect(screen.queryByTestId('logistics-warning')).not.toBeInTheDocument();
    });

    it('opens MapProviderSheet dialog when "Open in Maps" button is clicked', () => {
      render(<StopCard stop={mockStopWithoutWarning} isLast={false} />);

      const mapsButton = screen.getByRole('button', { name: /Open in Maps/i });
      fireEvent.click(mapsButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Open in Navigation App/i)).toBeInTheDocument();
      expect(screen.getByText('Google Maps')).toBeInTheDocument();
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

      expect(screen.getByText('Morning (10 AM - 12 PM)')).toBeInTheDocument();
    });
  });
});
