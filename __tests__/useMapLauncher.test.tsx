import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useMapLauncher } from '@/hooks/useMapLauncher';
import { MAP_STORAGE_KEY, MapProvider } from '@/lib/utils/maps';

function TestComponent({
  initialCoords,
  initialStopName,
}: {
  initialCoords?: { lat: number; lng: number };
  initialStopName?: string;
}) {
  const {
    preferredProvider,
    setPreferredProvider,
    getLaunchUrl,
    isOpen,
    openMapLauncher,
    closeMapLauncher,
    toggleMapLauncher,
    selectedCoordinates,
    selectedStopName,
  } = useMapLauncher({ initialCoordinates: initialCoords, initialStopName });

  const testCoords = { lat: 41.6918, lng: 44.7972 };

  return (
    <div>
      <span data-testid="preferred-provider">{preferredProvider}</span>
      <span data-testid="is-open">{isOpen ? 'open' : 'closed'}</span>
      <span data-testid="coords">
        {selectedCoordinates ? `${selectedCoordinates.lat},${selectedCoordinates.lng}` : 'none'}
      </span>
      <span data-testid="stop-name">{selectedStopName || 'none'}</span>
      <span data-testid="default-url">{getLaunchUrl(testCoords)}</span>
      <span data-testid="apple-url">{getLaunchUrl(testCoords, 'apple')}</span>

      <button data-testid="set-apple" onClick={() => setPreferredProvider('apple')}>
        Set Apple
      </button>
      <button data-testid="set-yandex" onClick={() => setPreferredProvider('yandex')}>
        Set Yandex
      </button>
      <button data-testid="open-modal" onClick={() => openMapLauncher({ lat: 41.7, lng: 44.8 }, 'Freedom Square')}>
        Open
      </button>
      <button data-testid="close-modal" onClick={() => closeMapLauncher()}>
        Close
      </button>
      <button data-testid="toggle-modal" onClick={() => toggleMapLauncher()}>
        Toggle
      </button>
    </div>
  );
}

describe('useMapLauncher hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('provides default fallback preferredProvider ("google") when localStorage is empty', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('preferred-provider')).toHaveTextContent('google');
  });

  it('loads saved map provider preference from localStorage on mount', () => {
    localStorage.setItem(MAP_STORAGE_KEY, 'yandex');
    render(<TestComponent />);
    expect(screen.getByTestId('preferred-provider')).toHaveTextContent('yandex');
  });

  it('handles invalid stored provider in localStorage gracefully by falling back to "google"', () => {
    localStorage.setItem(MAP_STORAGE_KEY, 'invalid_provider_name');
    render(<TestComponent />);
    expect(screen.getByTestId('preferred-provider')).toHaveTextContent('google');
  });

  it('updates preferredProvider and persists change to localStorage key "tbilisi_preferred_map_provider"', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('preferred-provider')).toHaveTextContent('google');

    act(() => {
      screen.getByTestId('set-apple').click();
    });

    expect(screen.getByTestId('preferred-provider')).toHaveTextContent('apple');
    expect(localStorage.getItem(MAP_STORAGE_KEY)).toBe('apple');
  });

  it('resolves getLaunchUrl using preferredProvider when no provider is passed', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('default-url')).toHaveTextContent(
      'https://www.google.com/maps/search/?api=1&query=41.6918,44.7972'
    );

    act(() => {
      screen.getByTestId('set-yandex').click();
    });

    expect(screen.getByTestId('default-url')).toHaveTextContent(
      'https://yandex.com/maps/?pt=44.7972,41.6918&z=17'
    );
  });

  it('resolves getLaunchUrl using explicitly specified provider override', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('apple-url')).toHaveTextContent(
      'https://maps.apple.com/?q=41.6918,44.7972'
    );
  });

  it('manages modal drawer visibility controls and target coordinates/stopName', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('is-open')).toHaveTextContent('closed');
    expect(screen.getByTestId('coords')).toHaveTextContent('none');
    expect(screen.getByTestId('stop-name')).toHaveTextContent('none');

    // Open modal with custom coords and stopName
    act(() => {
      screen.getByTestId('open-modal').click();
    });

    expect(screen.getByTestId('is-open')).toHaveTextContent('open');
    expect(screen.getByTestId('coords')).toHaveTextContent('41.7,44.8');
    expect(screen.getByTestId('stop-name')).toHaveTextContent('Freedom Square');

    // Close modal
    act(() => {
      screen.getByTestId('close-modal').click();
    });

    expect(screen.getByTestId('is-open')).toHaveTextContent('closed');

    // Toggle modal
    act(() => {
      screen.getByTestId('toggle-modal').click();
    });

    expect(screen.getByTestId('is-open')).toHaveTextContent('open');
  });
});
