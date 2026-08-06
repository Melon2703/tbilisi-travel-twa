import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RouteCarousel from '@/components/RouteCarousel';
import RouteIntroCard from '@/components/RouteIntroCard';
import { Route, Stop } from '@/lib/types/route';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { getProgressPosition, recordProgressPosition } from '@/lib/utils/progress';
import { getVisitedStops, setVisitedStops } from '@/lib/utils/visited';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ back: vi.fn(), push: vi.fn() })),
  notFound: vi.fn(),
}));

/**
 * Swiper cannot be dragged in jsdom, so it is replaced by a stand-in that renders
 * every slide and exposes the two ways the real Swiper drives the carousel:
 * a user swipe (onSlideChange) and a programmatic jump (slideTo).
 */
const swiperInstance = {
  activeIndex: 0,
  slideTo(index: number) {
    swiperInstance.activeIndex = index;
  },
};
let emitSlideChange: ((swiper: { activeIndex: number }) => void) | undefined;

vi.mock('swiper/css', () => ({}));
vi.mock('swiper/react', () => ({
  Swiper: ({ children, onSwiper, onSlideChange }: any) => {
    emitSlideChange = onSlideChange;
    React.useEffect(() => {
      onSwiper?.(swiperInstance);
    }, [onSwiper]);
    return <div data-testid="swiper-mock">{children}</div>;
  },
  SwiperSlide: ({ children }: any) => <div>{children}</div>,
}));

const swipeTo = (index: number) => {
  act(() => {
    swiperInstance.activeIndex = index;
    emitSlideChange?.({ activeIndex: index });
  });
};

const stop = (order: number, name: string): Stop => ({
  id: `stop-${order}`,
  order,
  name,
  neighborhood: 'Sololaki',
  coordinates: { lat: 41.69, lng: 44.79 },
  estimatedMinutes: 20,
  imageUrl: `/images/stop-${order}.jpg`,
  olyaTips: `Tip for ${name}.`,
  stopType: 'attraction',
});

const mockRoute: Route = {
  id: 'sololaki',
  title: 'Sololaki Architectural Gems',
  subtitle: 'A walking tour through 19th century mansions',
  durationCategory: '1-2h',
  accessibility: 'moderate',
  vibes: ['courtyards'],
  heroImage: '/images/sololaki.jpg',
  introCopy: 'Welcome to Sololaki.',
  stops: [
    stop(1, 'Kalantarov Mansion'),
    stop(2, 'Betlemi Stairs'),
    stop(3, 'Legvtakhevi Waterfall'),
  ],
};

const renderCarousel = (route: Route = mockRoute) =>
  render(
    <LanguageProvider>
      <RouteCarousel route={route} />
    </LanguageProvider>
  );

const activeStopOrder = () =>
  screen
    .getAllByRole('button')
    .find((button) => button.getAttribute('aria-current') === 'step')
    ?.getAttribute('data-testid');

beforeEach(() => {
  localStorage.clear();
  swiperInstance.activeIndex = 0;
});

describe('Progress Position within a Route', () => {
  it('records Progress Position when the traveler swipes', () => {
    renderCarousel();

    swipeTo(2);

    expect(getProgressPosition('sololaki')).toBe(2);
  });

  it('records Progress Position when the traveler taps a Stop indicator', () => {
    renderCarousel();

    swipeTo(1);
    fireEvent.click(screen.getByTestId('timeline-stop-3'));

    expect(getProgressPosition('sololaki')).toBe(3);
  });

  it('records the furthest Card reached, not merely the most recent', () => {
    renderCarousel();

    swipeTo(3);
    swipeTo(1);

    expect(getProgressPosition('sololaki')).toBe(3);
  });

  it('records nothing while the traveler is still on the Route Intro Card', () => {
    renderCarousel();

    expect(getProgressPosition('sololaki')).toBeNull();
  });

  it('leaves Visited State alone as Progress Position advances', () => {
    setVisitedStops('sololaki', ['stop-1']);
    renderCarousel();

    swipeTo(3);

    expect(getVisitedStops('sololaki')).toEqual(['stop-1']);
  });

  it('still advances when a Stop is marked visited, and stays put when un-marked', () => {
    renderCarousel();

    swipeTo(1);
    fireEvent.click(screen.getByTestId('visited-fab'));
    expect(activeStopOrder()).toBe('timeline-stop-2');
    expect(getVisitedStops('sololaki')).toEqual(['stop-1']);

    swipeTo(1);
    fireEvent.click(screen.getByTestId('visited-fab'));
    expect(activeStopOrder()).toBe('timeline-stop-1');
    expect(getVisitedStops('sololaki')).toEqual([]);
  });
});

describe('Continue CTA on the Route Intro Card', () => {
  it('shows the default entry CTA for a Route with no Progress Position', () => {
    renderCarousel();

    const cta = screen.getByTestId('sticky-start-container');
    expect(cta).toHaveTextContent('Start Route');
    expect(cta).not.toHaveTextContent(/Continue/i);
  });

  it('reads as Continue and names the Stop reached when a Progress Position exists', () => {
    recordProgressPosition('sololaki', 2);
    renderCarousel();

    const cta = screen.getByTestId('sticky-start-container');
    expect(cta).toHaveTextContent(/Continue/i);
    expect(cta).toHaveTextContent('Betlemi Stairs');
  });

  it('navigates to the recorded Card when Continue is activated, and keeps the overview reachable', () => {
    recordProgressPosition('sololaki', 2);
    renderCarousel();

    fireEvent.click(screen.getByTestId('sticky-start-container').querySelector('button')!);

    expect(activeStopOrder()).toBe('timeline-stop-2');
    expect(screen.queryByTestId('sticky-start-container')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('timeline-overview'));

    expect(screen.getByTestId('sticky-start-container')).toBeInTheDocument();
  });

  it('reads as Continue on the Route Intro Card itself when it carries its own CTA', () => {
    render(
      <LanguageProvider>
        <RouteIntroCard route={mockRoute} showStartButton progressStopName="Betlemi Stairs" />
      </LanguageProvider>
    );

    expect(screen.getByText(/Continue: Betlemi Stairs/)).toBeInTheDocument();
    expect(screen.queryByText('Start Route')).not.toBeInTheDocument();
  });

  it('names the Stop reached in the traveler language', () => {
    recordProgressPosition('sololaki', 1);
    render(
      <LanguageProvider initialLanguage="ru">
        <RouteCarousel route={mockRoute} />
      </LanguageProvider>
    );

    expect(screen.getByTestId('sticky-start-container')).toHaveTextContent(/ПРОДОЛЖИТЬ/i);
  });
});
