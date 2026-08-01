import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MapProviderBottomSheet from '@/components/MapProviderBottomSheet';
import RouteMapModal from '@/components/RouteMapModal';
import { Route } from '@/lib/types/route';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { MAP_STORAGE_KEY } from '@/lib/utils/maps';

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

describe('RouteMapModal & MapProviderBottomSheet Components', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('MapProviderBottomSheet', () => {
    it('delegates provider selection and persistence to useMapLauncher', () => {
      const mockOnClose = vi.fn();
      render(
        <LanguageProvider initialLanguage="en">
          <MapProviderBottomSheet
            isOpen={true}
            onClose={mockOnClose}
            coordinates={{ lat: 41.7095, lng: 44.8048 }}
            stopName="Fabrika Tbilisi"
          />
        </LanguageProvider>
      );

      expect(screen.getByTestId('preferred-provider-badge-google')).toBeInTheDocument();

      const yandexLink = screen.getByRole('link', { name: /Yandex Maps/i });
      fireEvent.click(yandexLink);

      expect(localStorage.getItem(MAP_STORAGE_KEY)).toBe('yandex');
    });

    it('highlights active and preferred provider badges correctly upon preference change', () => {
      localStorage.setItem(MAP_STORAGE_KEY, 'apple');
      const mockOnClose = vi.fn();

      render(
        <LanguageProvider initialLanguage="en">
          <MapProviderBottomSheet
            isOpen={true}
            onClose={mockOnClose}
            coordinates={{ lat: 41.7095, lng: 44.8048 }}
            stopName="Fabrika Tbilisi"
          />
        </LanguageProvider>
      );

      expect(screen.getByTestId('preferred-provider-badge-apple')).toBeInTheDocument();
      expect(screen.queryByTestId('preferred-provider-badge-google')).not.toBeInTheDocument();
    });
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

    it('launches map navigation using getLaunchUrl with selected stop coordinates', () => {
      renderModal();

      const openInMapBtn = screen.getByTestId('modal-stop-card').querySelector('a')!;
      expect(openInMapBtn).toBeInTheDocument();
      expect(openInMapBtn).toHaveAttribute(
        'href',
        expect.stringContaining('google.com/maps/search/?api=1&query=Fabrika%20Tbilisi')
      );
    });

    it('renders close button in right-side floating controls which triggers onClose', () => {
      const { mockOnClose } = renderModal();

      const closeBtn = screen.getByTestId('close-map-modal');
      expect(closeBtn).toBeInTheDocument();
      expect(closeBtn).toHaveClass('w-9', 'h-9', 'rounded-xl');

      fireEvent.click(closeBtn);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('updates stop card coordinates when switching selected map pin', () => {
      renderModal();

      const pin2 = screen.getByTestId('modal-map-pin-2');
      fireEvent.click(pin2);

      const openInMapBtn = screen.getByTestId('modal-stop-card').querySelector('a')!;
      expect(openInMapBtn).toHaveAttribute(
        'href',
        expect.stringContaining('google.com/maps/search/?api=1&query=Marjanishvili%20Theater')
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


