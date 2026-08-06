import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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

  describe('Overview control', () => {
    it('renders a leading overview control that navigates to the Route Intro Card', () => {
      const handleStopClick = vi.fn();
      render(
        <LanguageProvider initialLanguage="en">
          <TimelineBar
            stops={mockStops}
            activeIndex={2}
            visitedStopIds={[]}
            onStopClick={handleStopClick}
            onToggleVisited={() => {}}
          />
        </LanguageProvider>
      );

      const overview = screen.getByTestId('timeline-overview');
      expect(overview).toBeInTheDocument();
      overview.click();
      expect(handleStopClick).toHaveBeenCalledWith(0);
    });

    it('distinguishes the overview control from numbered Stop indicators', () => {
      render(
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

      const overview = screen.getByTestId('timeline-overview');
      const stopDot = screen.getByTestId('timeline-stop-1');

      // A different kind of destination: no Stop number, and named as the overview
      expect(overview).not.toHaveTextContent(/\d/);
      expect(overview).toHaveAccessibleName(/route overview/i);
      expect(stopDot).toHaveTextContent('1');
      expect(stopDot).toHaveAccessibleName(/jump to stop/i);
    });

    it('sits outside the scrolling Stop indicator container so it stays reachable on the longest Route', () => {
      const stops = Array.from({ length: 12 }, (_, i) => ({
        ...mockStops[0],
        id: `stop-${i + 1}`,
        order: i + 1,
        name: `Stop ${i + 1}`,
      }));

      render(
        <LanguageProvider initialLanguage="en">
          <TimelineBar
            stops={stops}
            activeIndex={7}
            visitedStopIds={[]}
            onStopClick={() => {}}
            onToggleVisited={() => {}}
          />
        </LanguageProvider>
      );

      const overview = screen.getByTestId('timeline-overview');
      const dotsContainer = screen.getByTestId('timeline-bar-container');
      expect(dotsContainer).not.toContainElement(overview);
      expect(screen.getByTestId('timeline-ellipsis-left')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-ellipsis-right')).toBeInTheDocument();
    });
  });

  describe('Maximum visible dots & sliding window continuation', () => {
    const createStops = (count: number): Stop[] =>
      Array.from({ length: count }, (_, i) => ({
        id: `stop-${i + 1}`,
        order: i + 1,
        stopType: 'attraction',
        name: `Stop ${i + 1}`,
        neighborhood: 'Tbilisi',
        coordinates: { lat: 41.7, lng: 44.8 },
        estimatedMinutes: 20,
        imageUrl: 'https://images.unsplash.com/photo',
        olyaTips: `Tip ${i + 1}`,
      }));

    it('caps visible dots to maxVisibleDots (5) and renders right continuation ellipsis when activeIndex is 1', () => {
      const stops = createStops(8);
      render(
        <LanguageProvider initialLanguage="en">
          <TimelineBar
            stops={stops}
            activeIndex={1}
            visitedStopIds={[]}
            onStopClick={() => {}}
            onToggleVisited={() => {}}
            maxVisibleDots={5}
          />
        </LanguageProvider>
      );

      // Visible stops should be 1 to 5
      expect(screen.getByTestId('timeline-stop-1')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-stop-5')).toBeInTheDocument();
      expect(screen.queryByTestId('timeline-stop-6')).not.toBeInTheDocument();

      // Right ellipsis should be present, left should not
      expect(screen.getByTestId('timeline-ellipsis-right')).toBeInTheDocument();
      expect(screen.queryByTestId('timeline-ellipsis-left')).not.toBeInTheDocument();
    });

    it('slides window and shows both left and right ellipsis when activeIndex is in middle', () => {
      const stops = createStops(8);
      render(
        <LanguageProvider initialLanguage="en">
          <TimelineBar
            stops={stops}
            activeIndex={4}
            visitedStopIds={[]}
            onStopClick={() => {}}
            onToggleVisited={() => {}}
            maxVisibleDots={5}
          />
        </LanguageProvider>
      );

      // Active is stop 4 -> window should be stops 2..6
      expect(screen.queryByTestId('timeline-stop-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('timeline-stop-2')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-stop-4')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-stop-6')).toBeInTheDocument();
      expect(screen.queryByTestId('timeline-stop-7')).not.toBeInTheDocument();

      // Both ellipsis should be rendered
      expect(screen.getByTestId('timeline-ellipsis-left')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-ellipsis-right')).toBeInTheDocument();
    });

    it('defaults to 4 visible dots when maxVisibleDots is omitted', () => {
      const stops = createStops(8);
      render(
        <LanguageProvider initialLanguage="en">
          <TimelineBar
            stops={stops}
            activeIndex={1}
            visitedStopIds={[]}
            onStopClick={() => {}}
            onToggleVisited={() => {}}
          />
        </LanguageProvider>
      );

      // Visible stops should be 1 to 4
      expect(screen.getByTestId('timeline-stop-1')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-stop-4')).toBeInTheDocument();
      expect(screen.queryByTestId('timeline-stop-5')).not.toBeInTheDocument();
      expect(screen.getByTestId('timeline-ellipsis-right')).toBeInTheDocument();
    });

    it('jumps to a Stop when tapping a visible Stop indicator', () => {
      const stops = createStops(8);
      const handleStopClick = vi.fn();

      render(
        <LanguageProvider initialLanguage="en">
          <TimelineBar
            stops={stops}
            activeIndex={4}
            visitedStopIds={[]}
            onStopClick={handleStopClick}
            onToggleVisited={() => {}}
            maxVisibleDots={5}
          />
        </LanguageProvider>
      );

      screen.getByTestId('timeline-stop-6').click();
      expect(handleStopClick).toHaveBeenCalledWith(6);
    });

    it('invokes onStopClick when tapping continuation ellipsis buttons', () => {
      const stops = createStops(8);
      const handleStopClick = vi.fn();

      render(
        <LanguageProvider initialLanguage="en">
          <TimelineBar
            stops={stops}
            activeIndex={4}
            visitedStopIds={[]}
            onStopClick={handleStopClick}
            onToggleVisited={() => {}}
            maxVisibleDots={5}
          />
        </LanguageProvider>
      );

      const leftEllipsis = screen.getByTestId('timeline-ellipsis-left');
      leftEllipsis.click();
      // Left window start was index 1 (stop 2), so tapping left jumps to stop 1 (slide index 1)
      expect(handleStopClick).toHaveBeenCalledWith(1);

      const rightEllipsis = screen.getByTestId('timeline-ellipsis-right');
      rightEllipsis.click();
      // Right window end was index 5 (stop 6), so tapping right jumps to stop 7 (slide index 7)
      expect(handleStopClick).toHaveBeenCalledWith(7);
    });
  });
});
