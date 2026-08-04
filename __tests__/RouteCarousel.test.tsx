import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RouteCarousel from '@/components/RouteCarousel';
import { Route } from '@/lib/types/route';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    back: vi.fn(),
    push: vi.fn(),
  })),
  notFound: vi.fn(),
}));

const mockRoute: Route = {
  id: 'carousel-test-route',
  title: 'Sololaki Architectural Gems',
  subtitle: 'A walking tour through 19th century mansions',
  durationCategory: '1-2h',
  accessibility: 'moderate',
  vibes: ['courtyards', 'architecture'],
  heroImage: '/images/sololaki.jpg',
  introCopy: 'Welcome to Sololaki.',
  stops: [
    {
      id: 'stop-1',
      order: 1,
      name: 'Kalantarov Mansion',
      neighborhood: 'Sololaki',
      coordinates: { lat: 41.6912, lng: 44.7989 },
      estimatedMinutes: 25,
      imageUrl: '/images/kalantarov.jpg',
      olyaTips: 'Look up at the painted ceiling.',
      stopType: 'attraction',
    },
  ],
};

describe('RouteCarousel Component', () => {
  it('renders bottom swipe hint and sticky START ROUTE CTA bar', () => {
    render(
      <LanguageProvider>
        <RouteCarousel route={mockRoute} />
      </LanguageProvider>
    );

    const swipePrompt = screen.getByTestId('swipe-prompt-container');
    expect(swipePrompt).toBeInTheDocument();
    expect(swipePrompt).toHaveTextContent(/Swipe left or tap below to begin!/i);

    const stickyStartBar = screen.getByTestId('sticky-start-container');
    expect(stickyStartBar).toBeInTheDocument();
    expect(stickyStartBar).toHaveClass('fixed');
    expect(stickyStartBar).toHaveClass('bottom-0');
    expect(stickyStartBar).toHaveClass('bg-gradient-to-t');
  });

  it('renders RouteCarousel without throwing errors when mounted with TelegramProvider', () => {
    render(
      <LanguageProvider>
        <RouteCarousel route={mockRoute} />
      </LanguageProvider>
    );

    expect(screen.getByText('Sololaki Architectural Gems')).toBeInTheDocument();
  });
});
