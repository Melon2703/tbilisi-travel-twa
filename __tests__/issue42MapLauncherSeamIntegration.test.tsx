import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import StopCard from '@/components/StopCard';
import RouteIntroCard from '@/components/RouteIntroCard';
import { Stop, Route } from '@/lib/types/route';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

const mockStop: Stop = {
  id: 'test-stop-42',
  order: 1,
  stopType: 'attraction',
  name: 'Narikala Fortress',
  neighborhood: 'Old Tbilisi',
  coordinates: { lat: 41.688, lng: 44.808 },
  estimatedMinutes: 30,
  imageUrl: 'https://example.com/narikala.jpg',
  historicalSummary: 'Ancient fortress overlooking Tbilisi.',
  olyaTips: 'Great view at sunset.',
  ratings: { google: { rating: 4.7, count: 3200 } },
};

const mockRoute: Route = {
  id: 'test-route-42',
  title: 'Old Tbilisi Secrets',
  subtitle: 'A stroll through history',
  heroImage: 'https://example.com/hero.jpg',
  introCopy: 'Welcome to Old Tbilisi',
  durationCategory: 'half-day',
  accessibility: 'moderate',
  vibes: ['cultural', 'architecture'],
  stops: [mockStop],
};

describe('Issue 42: MapLauncher Seam Integration in StopCard & RouteIntroCard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. StopCard Google Maps action link consumes getLaunchUrl (preferred provider)', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <StopCard stop={mockStop} totalStops={1} />
      </LanguageProvider>
    );

    const googleBtn = screen.getByLabelText('Open in Google Maps');
    expect(googleBtn).toBeInTheDocument();
    expect(googleBtn.tagName.toLowerCase()).toBe('a');
    expect(googleBtn).toHaveAttribute('target', '_blank');
    expect(googleBtn).toHaveAttribute('rel', 'noopener noreferrer');
    // Default preferred provider is google
    expect(googleBtn).toHaveAttribute('href', expect.stringContaining('google.com/maps'));
  });

  it('2. StopCard Google and Yandex map action links consume getLaunchUrl', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <StopCard stop={mockStop} totalStops={1} />
      </LanguageProvider>
    );

    const googleBtn = screen.getByLabelText('Open in Google Maps');
    const yandexBtn = screen.getByLabelText('Open in Yandex Maps');

    expect(googleBtn).toHaveAttribute('href', expect.stringContaining('google.com/maps'));
    expect(yandexBtn).toHaveAttribute('href', expect.stringContaining('yandex.com/maps'));
  });

  it('3. RouteIntroCard opens map modal via MapLauncher seam when map trigger is clicked', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <RouteIntroCard route={mockRoute} />
      </LanguageProvider>
    );

    // Initial state: map modal is not open
    expect(screen.queryByTestId('close-map-modal')).not.toBeInTheDocument();

    // Click on interactive route map header or expand trigger
    const expandBtn = screen.getByTestId('expand-map-button');
    fireEvent.click(expandBtn);

    // Map modal should now be open
    expect(screen.getByTestId('close-map-modal')).toBeInTheDocument();
  });
});
