import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import RouteIntroCard from '@/components/RouteIntroCard';
import RouteCarousel from '@/components/RouteCarousel';
import TimelineBar from '@/components/TimelineBar';
import StopCard from '@/components/StopCard';
import Button from '@/components/ui/Button';
import { Route } from '@/lib/types/route';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

const mockRoute: Route = {
  id: 'sololaki-architecture-tour',
  title: 'Sololaki Architectural Gems & Hidden Courtyards Long Title Test',
  subtitle: 'A walking tour through 19th century merchant mansions and ornate wooden balconies',
  durationCategory: '1-2h',
  accessibility: 'moderate',
  vibes: ['courtyards', 'architecture', 'photo-spots'],
  heroImage: '/images/sololaki.jpg',
  introCopy: 'Welcome to Sololaki, the heart of Old Tbilisi aristocracy.',
  stops: [
    {
      id: 'stop-1',
      order: 1,
      name: 'Kalantarov Mansion',
      neighborhood: 'Sololaki',
      coordinates: { lat: 41.6912, lng: 44.7989 },
      estimatedMinutes: 25,
      imageUrl: '/images/kalantarov.jpg',
      olyaTips: 'Look up at the painted ceiling in the entrance hall.',
      stopType: 'attraction',
      historicalSummary: 'Built in 1908 by merchant Mikhail Kalantarov.',
    },
    {
      id: 'stop-2',
      order: 2,
      name: 'Linville Cafe',
      neighborhood: 'Sololaki',
      coordinates: { lat: 41.692, lng: 44.7995 },
      estimatedMinutes: 25,
      imageUrl: '/images/linville.jpg',
      olyaTips: 'Try the homemade lemonade on the balcony.',
      stopType: 'venue',
      isOptional: true,
      venueDetails: {
        category: 'cafe',
        cuisines: ['georgian'],
        isVegetarianFriendly: true,
        recommendedDishes: ['Tarragon Lemonade', 'Honey Cake'],
      },
    },
  ],
};

describe('Issue 02 — Mobile Layout & Carousel Polish', () => {
  it('1. Route titles (h1) wrap cleanly on 390px screens without right-edge truncation', () => {
    render(
      <LanguageProvider>
        <RouteIntroCard route={mockRoute} />
      </LanguageProvider>
    );

    const titleHeading = screen.getByRole('heading', { level: 1 });
    expect(titleHeading).toBeInTheDocument();
    expect(titleHeading).toHaveClass('break-words');
    expect(titleHeading).toHaveClass('min-w-0');
    expect(titleHeading).toHaveClass('max-w-full');
  });

  it('2. Bottom swipe hint text remains visible and not overlapped by sticky START ROUTE CTA bar', () => {
    const { container } = render(
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

  it('3. Vibe and duration tags scroll horizontally with smooth padding and visual indicators', () => {
    render(
      <LanguageProvider>
        <RouteIntroCard route={mockRoute} />
      </LanguageProvider>
    );

    const badgesRow = screen.getByTestId('pill-badges-row');
    expect(badgesRow).toBeInTheDocument();
    expect(badgesRow).toHaveClass('overflow-x-auto');
    expect(badgesRow).toHaveClass('pr-8');

    // Should include duration tag, accessibility tag, and vibe tags
    expect(badgesRow).toHaveTextContent('1-2h');
    expect(badgesRow).toHaveTextContent('moderate');
    expect(badgesRow).toHaveTextContent('courtyards');
    expect(badgesRow).toHaveTextContent('architecture');

    const scrollIndicator = screen.getByTestId('pill-badges-scroll-indicator');
    expect(scrollIndicator).toBeInTheDocument();
  });

  it('4. Mobile button tap target sizes meet minimum 48x48px accessibility guidelines', () => {
    render(
      <LanguageProvider>
        <div>
          <Button variant="primary">Primary CTA</Button>
          <Button variant="secondary">Secondary CTA</Button>
          <Button variant="outline">Outline CTA</Button>
          <Button variant="visited">Visited CTA</Button>
          <RouteIntroCard route={mockRoute} />
          <TimelineBar
            stops={mockRoute.stops}
            activeIndex={1}
            visitedStopIds={[]}
            onStopClick={() => {}}
            onToggleVisited={() => {}}
          />
          <StopCard stop={mockRoute.stops[0]} />
        </div>
      </LanguageProvider>
    );

    const primaryBtn = screen.getByRole('button', { name: /Primary CTA/i });
    expect(primaryBtn).toHaveClass('min-h-[48px]');

    const secondaryBtn = screen.getByRole('button', { name: /Secondary CTA/i });
    expect(secondaryBtn).toHaveClass('min-h-[48px]');

    const langEnBtn = screen.getByRole('button', { name: /Switch to English/i });
    expect(langEnBtn).toHaveClass('min-h-[48px]');
    expect(langEnBtn).toHaveClass('min-w-[48px]');

    const fabBtn = screen.getByTestId('visited-fab');
    expect(fabBtn).toHaveClass('min-h-[48px]');
    expect(fabBtn).toHaveClass('min-w-[48px]');

    const mapActionLinks = screen.getAllByRole('link', { name: /Open in/i });
    mapActionLinks.forEach((link) => {
      expect(link).toHaveClass('min-h-[48px]');
      expect(link).toHaveClass('min-w-[48px]');
    });
  });
});
