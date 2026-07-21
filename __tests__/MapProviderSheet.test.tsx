import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MapProviderSheet from '@/components/MapProviderSheet';
import { setPreferredMapProvider, MAP_STORAGE_KEY } from '@/lib/utils/maps';

describe('MapProviderSheet Component', () => {
  const mockCoordinates = { lat: 41.6918, lng: 44.7972 };
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Mock window.open
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <MapProviderSheet
        isOpen={false}
        onClose={mockOnClose}
        stopName="Machabeli St Foyer"
        coordinates={mockCoordinates}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal dialog with stop name and all 3 map providers when isOpen is true', () => {
    render(
      <MapProviderSheet
        isOpen={true}
        onClose={mockOnClose}
        stopName="Machabeli St Foyer"
        coordinates={mockCoordinates}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Machabeli St Foyer/i)).toBeInTheDocument();
    expect(screen.getByText('Google Maps')).toBeInTheDocument();
    expect(screen.getByText('Apple Maps')).toBeInTheDocument();
    expect(screen.getByText('Yandex Maps')).toBeInTheDocument();
  });

  it('displays "Preferred" tag for saved provider in localStorage', () => {
    setPreferredMapProvider('apple');

    render(
      <MapProviderSheet
        isOpen={true}
        onClose={mockOnClose}
        stopName="Machabeli St Foyer"
        coordinates={mockCoordinates}
      />
    );

    expect(screen.getByText(/Preferred|Last used/i)).toBeInTheDocument();
  });

  it('saves selected provider to localStorage and opens universal link when clicked', () => {
    render(
      <MapProviderSheet
        isOpen={true}
        onClose={mockOnClose}
        stopName="Machabeli St Foyer"
        coordinates={mockCoordinates}
      />
    );

    const googleButton = screen.getByRole('button', { name: /Google Maps/i });
    fireEvent.click(googleButton);

    expect(localStorage.getItem(MAP_STORAGE_KEY)).toBe('google');
    expect(window.open).toHaveBeenCalledWith(
      'https://www.google.com/maps/search/?api=1&query=41.6918,44.7972',
      '_blank',
      'noopener,noreferrer'
    );
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when backdrop or close button is clicked', () => {
    render(
      <MapProviderSheet
        isOpen={true}
        onClose={mockOnClose}
        stopName="Machabeli St Foyer"
        coordinates={mockCoordinates}
      />
    );

    const closeButton = screen.getByLabelText(/Close/i);
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when Escape key is pressed', () => {
    render(
      <MapProviderSheet
        isOpen={true}
        onClose={mockOnClose}
        stopName="Machabeli St Foyer"
        coordinates={mockCoordinates}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
