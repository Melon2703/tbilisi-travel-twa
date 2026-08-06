import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import RouteCatalog from '@/components/RouteCatalog';
import { Route, Stop } from '@/lib/types/route';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { PROGRESS_STORAGE_KEY, recordProgressPosition } from '@/lib/utils/progress';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ back: vi.fn(), push: vi.fn() })),
}));

const stop = (order: number, name: string): Stop => ({
  id: `stop-${order}`,
  order,
  name,
  neighborhood: 'Sololaki',
  coordinates: { lat: 41.69 + order / 100, lng: 44.79 },
  estimatedMinutes: 20,
  imageUrl: `/images/stop-${order}.jpg`,
  olyaTips: `Tip for ${name}.`,
  stopType: 'attraction',
});

const sololaki: Route = {
  id: 'sololaki',
  title: 'Sololaki Architectural Gems',
  subtitle: 'A walking tour through 19th century mansions',
  durationCategory: '1-2h',
  accessibility: 'moderate',
  vibes: ['courtyards'],
  heroImage: '/images/sololaki.jpg',
  introCopy: 'Welcome to Sololaki.',
  stops: [stop(1, 'Kalantarov Mansion'), stop(2, 'Betlemi Stairs'), stop(3, 'Legvtakhevi Waterfall')],
};

const abanotubani: Route = {
  ...sololaki,
  id: 'abanotubani',
  title: 'Abanotubani Sulphur Baths',
  subtitle: 'Domes, steam and brick',
  durationCategory: '3-4h',
  vibes: ['cultural'],
  stops: [stop(1, 'Sulphur Bath Row'), stop(2, 'Juma Mosque')],
};

const ROUTES = [sololaki, abanotubani];

const renderCatalog = (routes: Route[] = ROUTES) =>
  render(
    <LanguageProvider initialLanguage="en">
      <RouteCatalog initialRoutes={routes} />
    </LanguageProvider>
  );

const cardCta = (routeId: string) => screen.getByTestId(`route-cta-${routeId}`);
const cardLink = (routeId: string) => screen.getByTestId(`route-card-${routeId}`);

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Continue affordance on catalog cards', () => {
  it('names the reached Stop on a Route with a stored Progress Position', () => {
    recordProgressPosition('sololaki', 2);
    renderCatalog();

    expect(cardCta('sololaki')).toHaveTextContent(/Continue/i);
    expect(cardCta('sololaki')).toHaveTextContent('Betlemi Stairs');
  });

  it('renders the default entry CTA on a Route with no stored Progress Position', () => {
    recordProgressPosition('sololaki', 2);
    renderCatalog();

    expect(cardCta('abanotubani')).toHaveTextContent('View');
    expect(cardCta('abanotubani')).not.toHaveTextContent(/Continue/i);
  });

  it('opens the Route at the recorded Card when Continue is activated', () => {
    recordProgressPosition('sololaki', 2);
    renderCatalog();

    expect(cardLink('sololaki')).toHaveAttribute('href', '/twa/sololaki?at=2');
    expect(cardLink('abanotubani')).toHaveAttribute('href', '/twa/abanotubani');
  });

  it('falls back to the default entry CTA when the Progress Position outlives its Stop', () => {
    recordProgressPosition('abanotubani', 7);
    renderCatalog();

    expect(cardCta('abanotubani')).toHaveTextContent('View');
    expect(cardLink('abanotubani')).toHaveAttribute('href', '/twa/abanotubani');
  });

  it('names the reached Stop in the traveler language', () => {
    recordProgressPosition('sololaki', 1);
    render(
      <LanguageProvider initialLanguage="ru">
        <RouteCatalog initialRoutes={ROUTES} />
      </LanguageProvider>
    );

    expect(cardCta('sololaki')).toHaveTextContent(/ПРОДОЛЖИТЬ/i);
  });

  it('reads progress for the whole catalog in a single storage read', () => {
    recordProgressPosition('sololaki', 2);
    recordProgressPosition('abanotubani', 1);

    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    renderCatalog();

    const progressReads = getItem.mock.calls.filter(([key]) => key === PROGRESS_STORAGE_KEY);
    expect(progressReads).toHaveLength(1);
  });
});

describe('Cards rendered before progress resolves', () => {
  /**
   * Progress reaches the traveler as label text and as a link target; it must never
   * reach the classes that lay a card out, or the card would move under them.
   */
  const layout = (html: string) => Array.from(html.matchAll(/class="([^"]*)"/g), (m) => m[1]);

  it('names no CTA on the server, so a partly-walked Route never flashes the wrong one', () => {
    recordProgressPosition('sololaki', 2);

    const serverHtml = renderToString(
      <LanguageProvider initialLanguage="en">
        <RouteCatalog initialRoutes={ROUTES} />
      </LanguageProvider>
    );

    expect(serverHtml).toContain('route-cta-sololaki');
    expect(serverHtml).not.toContain('View');
    expect(serverHtml).not.toContain('Continue');
  });

  it('keeps card geometry identical once progress resolves', () => {
    recordProgressPosition('sololaki', 2);

    const serverHtml = renderToString(
      <LanguageProvider initialLanguage="en">
        <RouteCatalog initialRoutes={ROUTES} />
      </LanguageProvider>
    );
    const { container } = renderCatalog();

    expect(layout(container.innerHTML)).toEqual(layout(serverHtml));
  });
});

describe('Filtering and proximity sorting with progress affordances present', () => {
  it('keeps the Continue affordance on a card that survives a filter', () => {
    recordProgressPosition('sololaki', 2);
    renderCatalog();

    fireEvent.click(screen.getByTestId('duration-filter-1-2h'));

    expect(screen.queryByTestId('route-card-abanotubani')).not.toBeInTheDocument();
    expect(cardCta('sololaki')).toHaveTextContent('Betlemi Stairs');
  });

  it('keeps the Continue affordance with its Route once cards are sorted by proximity', () => {
    recordProgressPosition('sololaki', 2);
    vi.stubGlobal('navigator', {
      ...navigator,
      geolocation: {
        getCurrentPosition: (onSuccess: PositionCallback) =>
          onSuccess({ coords: { latitude: 41.7, longitude: 44.79 } } as GeolocationPosition),
      },
    });
    renderCatalog();

    fireEvent.click(screen.getByTestId('geo-location-button'));

    expect(screen.getAllByTestId('route-distance-badge')).toHaveLength(ROUTES.length);
    expect(cardCta('sololaki')).toHaveTextContent('Betlemi Stairs');
    expect(cardCta('abanotubani')).toHaveTextContent('View');
  });
});
