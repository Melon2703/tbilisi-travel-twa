import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import RouteMapModal from '@/components/RouteMapModal';
import { Route } from '@/lib/types/route';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

const mockRoute: Route = {
  id: 'map-modal-test-route',
  title: 'Chugureti Hidden Gems',
  subtitle: 'Exploring Fabrika and Marjanishvili',
  heroImage: 'https://example.com/hero.jpg',
  introCopy: 'Discover Chugureti district',
  durationCategory: 'half-day',
  accessibility: 'moderate',
  vibes: ['architecture', 'courtyards'],
  stops: [
    {
      id: 'stop-1',
      order: 1,
      stopType: 'attraction',
      name: 'Fabrika Tbilisi',
      neighborhood: 'Chugureti',
      coordinates: { lat: 41.7095, lng: 44.8048 },
      estimatedMinutes: 45,
      imageUrl: 'https://example.com/fabrika.jpg',
      olyaTips: 'Great atmosphere and street art.',
      placeIds: { google: 'ChIJFabrikaTbilisi_TB' },
    },
    {
      id: 'stop-2',
      order: 2,
      stopType: 'attraction',
      name: 'Marjanishvili Theater',
      neighborhood: 'Chugureti',
      coordinates: { lat: 41.7081, lng: 44.7989 },
      estimatedMinutes: 30,
      imageUrl: 'https://example.com/theater.jpg',
      olyaTips: 'Architectural landmark.',
    },
  ],
};

describe('RouteMapModal Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('RouteMapModal', () => {
    const renderModal = (props?: Partial<React.ComponentProps<typeof RouteMapModal>>) => {
      const mockOnClose = vi.fn();
      const result = render(
        <LanguageProvider initialLanguage="en">
          <RouteMapModal
            route={mockRoute}
            isOpen={true}
            onClose={mockOnClose}
            initialStopOrder={1}
            {...props}
          />
        </LanguageProvider>
      );
      return { ...result, mockOnClose };
    };

    it('launches map navigation anchored on the selected stop place identity', () => {
      renderModal();

      const openInMapBtn = screen.getByTestId('modal-stop-card').querySelector('a')!;
      expect(openInMapBtn).toBeInTheDocument();
      expect(openInMapBtn).toHaveAttribute(
        'href',
        'https://www.google.com/maps/search/?api=1&query=41.7095,44.8048&query_place_id=ChIJFabrikaTbilisi_TB'
      );
    });

    it('offers Google and Yandex as direct one-tap links on the selected stop', () => {
      renderModal();

      const links = screen.getByTestId('modal-stop-card').querySelectorAll('a');
      expect(links).toHaveLength(2);
      expect(links[1]).toHaveAttribute('aria-label', 'Open in Yandex Maps');
      expect(links[1]).toHaveAttribute(
        'href',
        'https://yandex.com/maps/?pt=44.8048,41.7095&z=17'
      );
    });

    it('renders stops count correctly without unparsed placeholders', () => {
      renderModal();
      expect(screen.getByText('2 stops')).toBeInTheDocument();
      expect(screen.queryByText('{count}')).not.toBeInTheDocument();
    });

    it('renders close button in right-side floating controls which triggers onClose', () => {
      const { mockOnClose } = renderModal();

      const closeBtn = screen.getByTestId('close-map-modal');
      expect(closeBtn).toBeInTheDocument();
      expect(closeBtn).toHaveClass('w-9', 'h-9', 'rounded-xl');

      fireEvent.click(closeBtn);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('updates the map link, degrading to coordinates only, when switching selected map pin', () => {
      renderModal();

      const pin2 = screen.getByTestId('modal-map-pin-2');
      fireEvent.click(pin2);

      const openInMapBtn = screen.getByTestId('modal-stop-card').querySelector('a')!;
      expect(openInMapBtn).toHaveAttribute(
        'href',
        'https://www.google.com/maps/search/?api=1&query=41.7081,44.7989'
      );
    });

    it('renders numbered pin markers for all stops without SVG route connecting lines', () => {
      const { container } = renderModal();

      expect(screen.getByTestId('modal-map-pin-1')).toBeInTheDocument();
      expect(screen.getByTestId('modal-map-pin-2')).toBeInTheDocument();
      expect(container.querySelector('svg path')).not.toBeInTheDocument();
    });

    it('supports map zoom in, zoom out, and reset controls', () => {
      renderModal();

      const zoomIn = screen.getByTestId('modal-map-zoom-in');
      const zoomOut = screen.getByTestId('modal-map-zoom-out');
      const reset = screen.getByTestId('modal-map-reset');

      fireEvent.click(zoomIn);
      fireEvent.click(zoomOut);
      fireEvent.click(reset);

      expect(screen.getByTestId('modal-map-pin-1')).toBeInTheDocument();
    });

    it('locks body overflow and touch-action when open and restores on unmount', () => {
      const { unmount } = renderModal();

      expect(document.body.style.overflow).toBe('hidden');
      expect(document.body.style.touchAction).toBe('none');

      unmount();

      expect(document.body.style.overflow).toBe('');
      expect(document.body.style.touchAction).toBe('');
    });
  });
});


