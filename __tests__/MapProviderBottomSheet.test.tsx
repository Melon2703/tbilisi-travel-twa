import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MapProviderBottomSheet from '@/components/MapProviderBottomSheet';
import { getPreferredMapProvider, setPreferredMapProvider } from '@/lib/utils/maps';

describe('MapProviderBottomSheet Component', () => {
  const mockCoords = { lat: 41.6918, lng: 44.7972 };
  const mockOnClose = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <MapProviderBottomSheet
        isOpen={false}
        onClose={mockOnClose}
        coordinates={mockCoords}
        stopName="Narikala Fortress"
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders bottom sheet dialog when isOpen is true with stop name and map options', () => {
    render(
      <MapProviderBottomSheet
        isOpen={true}
        onClose={mockOnClose}
        coordinates={mockCoords}
        stopName="Narikala Fortress"
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Narikala Fortress/i)).toBeInTheDocument();
    expect(screen.getByText('Google Maps')).toBeInTheDocument();
    expect(screen.getByText('Apple Maps')).toBeInTheDocument();
    expect(screen.getByText('Yandex Maps')).toBeInTheDocument();
  });

  it('generates direct universal links for Google, Apple, and Yandex Maps with exact coordinates', () => {
    render(
      <MapProviderBottomSheet
        isOpen={true}
        onClose={mockOnClose}
        coordinates={mockCoords}
        stopName="Narikala Fortress"
      />
    );

    const googleLink = screen.getByRole('link', { name: /Google Maps/i });
    const appleLink = screen.getByRole('link', { name: /Apple Maps/i });
    const yandexLink = screen.getByRole('link', { name: /Yandex Maps/i });

    expect(googleLink).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=41.6918,44.7972'
    );
    expect(appleLink).toHaveAttribute(
      'href',
      'https://maps.apple.com/?q=41.6918,44.7972'
    );
    expect(yandexLink).toHaveAttribute(
      'href',
      'https://yandex.com/maps/?pt=44.7972,41.6918&z=17'
    );
  });

  it('saves preferred map provider to localStorage when a provider option is clicked', () => {
    render(
      <MapProviderBottomSheet
        isOpen={true}
        onClose={mockOnClose}
        coordinates={mockCoords}
        stopName="Narikala Fortress"
      />
    );

    const appleLink = screen.getByRole('link', { name: /Apple Maps/i });
    fireEvent.click(appleLink);

    expect(getPreferredMapProvider()).toBe('apple');
  });

  it('restores and indicates the preferred map provider from localStorage', () => {
    setPreferredMapProvider('yandex');

    render(
      <MapProviderBottomSheet
        isOpen={true}
        onClose={mockOnClose}
        coordinates={mockCoords}
        stopName="Narikala Fortress"
      />
    );

    expect(screen.getByTestId('preferred-provider-badge-yandex')).toBeInTheDocument();
  });

  it('calls onClose when close button or backdrop is clicked', () => {
    render(
      <MapProviderBottomSheet
        isOpen={true}
        onClose={mockOnClose}
        coordinates={mockCoords}
        stopName="Narikala Fortress"
      />
    );

    const closeBtn = screen.getByLabelText(/close/i);
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    const backdrop = screen.getByTestId('bottom-sheet-backdrop');
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});
