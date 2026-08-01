import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MapProviderBottomSheet from '@/components/MapProviderBottomSheet';
import RouteMapModal from '@/components/RouteMapModal';
import { Route } from '@/lib/types/route';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { getPreferredMapProvider, setPreferredMapProvider } from '@/lib/utils/maps';

const mockRoute: Route = {
  id: 'issue-43-test-route',
  title: 'Chugureti Hidden Gems',
  subtitle: 'Exploring Fabrika and Marjanishvili',
  heroImage: 'https://example.com/hero.jpg',
  introCopy: 'Discover Chugureti district',
  durationCategory: 'half-day',
  accessibility: 'moderate',
  vibes: ['architecture', 'courtyards'],
  stops: [
    {
      id: 'stop-43-1',
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
      id: 'stop-43-2',
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

describe('Issue 43: MapLauncher Seam Migration for RouteMapModal and MapProviderBottomSheet', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('1. MapProviderBottomSheet delegates provider selection and persistence to useMapLauncher', () => {
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

    // Initial state: google is default preferred
    expect(screen.getByTestId('preferred-provider-badge-google')).toBeInTheDocument();

    // Select Yandex Maps option
    const yandexLink = screen.getByRole('link', { name: /Yandex Maps/i });
    fireEvent.click(yandexLink);

    // Preferred provider state in localStorage should be updated to yandex
    expect(getPreferredMapProvider()).toBe('yandex');
  });

  it('2. Active and preferred provider badges highlight correctly in MapProviderBottomSheet upon preference change', () => {
    setPreferredMapProvider('apple');
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

  it('3. RouteMapModal action bar launches map navigation using getLaunchUrl with selected stop coords', () => {
    const mockOnClose = vi.fn();
    render(
      <LanguageProvider initialLanguage="en">
        <RouteMapModal
          route={mockRoute}
          isOpen={true}
          onClose={mockOnClose}
          initialStopOrder={1}
        />
      </LanguageProvider>
    );

    // Stop card should be open for stop 1 (Fabrika)
    const openInMapBtn = screen.getByTestId('modal-stop-card').querySelector('a')!;
    expect(openInMapBtn).toBeInTheDocument();
    expect(openInMapBtn).toHaveAttribute(
      'href',
      expect.stringContaining('google.com/maps/search/?api=1&query=41.7095,44.8048')
    );
  });

  it('4. Changing preferred provider via RouteMapModal select dropdown updates action bar launch URL', () => {
    const mockOnClose = vi.fn();
    render(
      <LanguageProvider initialLanguage="en">
        <RouteMapModal
          route={mockRoute}
          isOpen={true}
          onClose={mockOnClose}
          initialStopOrder={1}
        />
      </LanguageProvider>
    );

    const providerSelect = screen.getByTestId('map-provider-select');
    expect(providerSelect).toHaveValue('google');

    // Change provider selection to Yandex
    fireEvent.change(providerSelect, { target: { value: 'yandex' } });

    // Verify select value updated
    expect(providerSelect).toHaveValue('yandex');
    expect(getPreferredMapProvider()).toBe('yandex');

    // Action bar link should now be updated to Yandex maps URL
    const openInMapBtn = screen.getByTestId('modal-stop-card').querySelector('a')!;
    expect(openInMapBtn).toHaveAttribute(
      'href',
      expect.stringContaining('yandex.com/maps/?pt=44.8048,41.7095&z=17')
    );
  });

  it('5. RouteMapModal stop card action bar updates coordinates when switching selected pin', () => {
    const mockOnClose = vi.fn();
    render(
      <LanguageProvider initialLanguage="en">
        <RouteMapModal
          route={mockRoute}
          isOpen={true}
          onClose={mockOnClose}
          initialStopOrder={1}
        />
      </LanguageProvider>
    );

    // Click pin #2 (Marjanishvili Theater)
    const pin2 = screen.getByTestId('modal-map-pin-2');
    fireEvent.click(pin2);

    const openInMapBtn = screen.getByTestId('modal-stop-card').querySelector('a')!;
    expect(openInMapBtn).toHaveAttribute(
      'href',
      expect.stringContaining('google.com/maps/search/?api=1&query=41.7081,44.7989')
    );
  });
});
