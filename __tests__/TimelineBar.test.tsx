import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TimelineBar from '@/components/TimelineBar';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { Stop } from '@/lib/types/route';

const mockStops: Stop[] = [
  {
    id: 'stop-1',
    order: 1,
    stopType: 'attraction',
    name: 'Fabrika Courtyard',
    neighborhood: 'Marjanishvili',
    coordinates: { lat: 41.71, lng: 44.80 },
    estimatedMinutes: 30,
    imageUrl: 'https://images.unsplash.com/photo-1555246050-8957960659b4',
    olyaTips: 'Try the filter coffee.',
  },
  {
    id: 'stop-2',
    order: 2,
    stopType: 'attraction',
    name: 'Dry Bridge Market',
    neighborhood: 'Chugureti',
    coordinates: { lat: 41.70, lng: 44.80 },
    estimatedMinutes: 45,
    imageUrl: 'https://images.unsplash.com/photo-1555246050-8957960659b4',
    olyaTips: 'Bargain politely.',
  },
];

describe('TimelineBar Component', () => {
  it('renders a straight 2px horizontal track without Georgian wave SVG path', () => {
    const { container } = render(
      <LanguageProvider initialLanguage="en">
        <TimelineBar
          stops={mockStops}
          activeIndex={1}
          visitedStopIds={[]}
          onStopClick={() => {}}
          onToggleVisited={() => {}}
        />
      </LanguageProvider>
    );

    const timelineContainer = screen.getByTestId('timeline-bar-container');
    expect(timelineContainer).toBeInTheDocument();

    const wavePathElements = container.querySelectorAll('path[d*="M0,8 C10,4"]');
    expect(wavePathElements.length).toBe(0);

    const trackContainer = timelineContainer.querySelector('.absolute.overflow-hidden.pointer-events-none');
    expect(trackContainer).toBeInTheDocument();
    expect(trackContainer).toHaveStyle({ height: '2px' });
  });
});
