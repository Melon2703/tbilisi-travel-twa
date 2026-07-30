import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RouteIntroCard from '@/components/RouteIntroCard';
import { Route } from '@/lib/types/route';

const mockRoute: Route = {
  id: 'sololaki-test-route',
  title: 'Sololaki Balconies & Hidden Courtyards',
  subtitle: 'A walking route through 19th-century merchant mansions',
  durationCategory: '1-2h',
  accessibility: 'stroller-friendly',
  vibes: ['courtyards', 'architecture'],
  heroImage: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c',
  introCopy: 'Sololaki is the heart of 19th-century Tbilisi elegance.',
  stops: [
    {
      id: 'stop-1',
      order: 1,
      stopType: 'attraction',
      name: 'Lado Asatiani Merchant Houses',
      neighborhood: 'Sololaki',
      coordinates: { lat: 41.6901, lng: 44.7981 },
      estimatedMinutes: 25,
      imageUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c',
      olyaTips: 'Look closely at the wooden carved balconies.',
    },
    {
      id: 'stop-2',
      order: 2,
      stopType: 'attraction',
      name: 'Galaktion Tabidze Balcony House',
      neighborhood: 'Sololaki',
      coordinates: { lat: 41.6915, lng: 44.7995 },
      estimatedMinutes: 20,
      imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f',
      olyaTips: 'Check out the ceiling frescoes in the foyer.',
    },
    {
      id: 'stop-3',
      order: 3,
      stopType: 'attraction',
      name: 'Betlemi Church Viewpoint',
      neighborhood: 'Old Kala',
      coordinates: { lat: 41.6885, lng: 44.806 },
      estimatedMinutes: 30,
      imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f',
      olyaTips: 'Panaromic view of Old Tbilisi.',
    },
  ],
};

describe('Route Overview Map & Interactive Modal UX/UI Redesign', () => {
  it('renders route overview map near top of RouteIntroCard before textual stop list', () => {
    render(<RouteIntroCard route={mockRoute} />);

    const overviewMap = screen.getByTestId('route-overview-map');
    const welcomeCard = screen.queryByTestId('olya-welcome-card');
    const stepPreviewList = screen.getByTestId('step-by-step-preview-list');

    expect(overviewMap).toBeInTheDocument();

    // Verify overviewMap appears before step-by-step preview list in DOM order
    const overviewPosition = overviewMap.compareDocumentPosition(stepPreviewList);
    expect(overviewPosition & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    if (welcomeCard) {
      const welcomePosition = overviewMap.compareDocumentPosition(welcomeCard);
      expect(welcomePosition & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });

  it('renders cartographic map tile layer, start/finish badges, and expand button', () => {
    render(<RouteIntroCard route={mockRoute} />);

    const tileContainer = screen.getByTestId('map-tile-container');
    expect(tileContainer).toBeInTheDocument();

    // Check start and finish badges
    expect(screen.getByTestId('map-start-badge')).toHaveTextContent(/Lado Asatiani/i);
    expect(screen.getByTestId('map-finish-badge')).toHaveTextContent(/Betlemi Church/i);
    expect(screen.getByTestId('expand-map-button')).toBeInTheDocument();
  });

  it('opens interactive fullscreen map modal when expand button or preview map is clicked', () => {
    render(<RouteIntroCard route={mockRoute} />);

    const expandBtn = screen.getByTestId('expand-map-button');
    fireEvent.click(expandBtn);

    // Fullscreen interactive map modal should be rendered
    const modal = screen.getByTestId('route-map-modal');
    expect(modal).toBeInTheDocument();
    expect(screen.getByTestId('interactive-map-viewport')).toBeInTheDocument();
    expect(screen.getByTestId('modal-map-zoom-in')).toBeInTheDocument();
    expect(screen.getByTestId('modal-map-zoom-out')).toBeInTheDocument();
    expect(screen.getByTestId('modal-map-reset')).toBeInTheDocument();
  });

  it('allows selecting pins inside fullscreen map modal to view detailed stop sheet', () => {
    render(<RouteIntroCard route={mockRoute} />);

    // Open modal
    fireEvent.click(screen.getByTestId('expand-map-button'));

    // Click pin #2 inside modal
    const pin2 = screen.getByTestId('modal-map-pin-2');
    fireEvent.click(pin2);

    const stopCard = screen.getByTestId('modal-stop-card');
    expect(stopCard).toBeInTheDocument();
    expect(stopCard).toHaveTextContent('Galaktion Tabidze Balcony House');
    expect(stopCard).toHaveTextContent('20 min');
  });

  it('closes map modal when close button is clicked', () => {
    render(<RouteIntroCard route={mockRoute} />);

    // Open modal
    fireEvent.click(screen.getByTestId('expand-map-button'));
    expect(screen.getByTestId('route-map-modal')).toBeInTheDocument();

    // Click close button
    fireEvent.click(screen.getByTestId('close-map-modal'));
    expect(screen.queryByTestId('route-map-modal')).not.toBeInTheDocument();
  });
});
