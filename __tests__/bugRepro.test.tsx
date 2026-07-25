import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TelegramProvider, useTelegram } from '@/components/TelegramProvider';
import RouteCarousel from '@/components/RouteCarousel';
import { TelegramWebApp } from '@/lib/types/telegram';
import { Route } from '@/lib/types/route';

const sampleRoute: Route = {
  id: 'heartbeat-express-1-2h',
  title: 'Heartbeat Express',
  subtitle: 'Classic landmarks route',
  durationCategory: '1-2h',
  accessibility: 'wheelchair-accessible',
  vibes: ['landmarks', 'panoramic-views'],
  heroImage: '/images/hero.jpg',
  introCopy: 'Welcome to the heartbeat of Tbilisi.',
  stops: [
    {
      id: 'hb-stop-1',
      order: 1,
      name: 'Liberty Square',
      neighborhood: 'Sololaki',
      coordinates: { lat: 41.6934, lng: 44.8015 },
      estimatedMinutes: 15,
      imageUrl: '/images/stop1.jpg',
      olyaTips: 'Start near the column.',
    },
    {
      id: 'hb-stop-2',
      order: 2,
      name: 'Fresh Pomegranate Juice Stand',
      neighborhood: 'Old Town',
      coordinates: { lat: 41.6912, lng: 44.8061 },
      estimatedMinutes: 10,
      imageUrl: '/images/stop2.jpg',
      olyaTips: 'Get a fresh cup.',
    },
  ],
};

describe('Bug Diagnostics & Regression Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).Telegram;
    localStorage.clear();
  });

  afterEach(() => {
    delete (window as any).Telegram;
    localStorage.clear();
  });

  describe('Telegram WebApp v6.0 Version Guards', () => {
    it('does NOT invoke disableVerticalSwipes on Telegram WebApp v6.0 (where isVersionAtLeast 7.7 is false)', () => {
      const disableVerticalSwipesMock = vi.fn();
      const mockWebAppV6: Partial<TelegramWebApp> = {
        version: '6.0',
        ready: vi.fn(),
        expand: vi.fn(),
        disableVerticalSwipes: disableVerticalSwipesMock,
        isVersionAtLeast: vi.fn((ver: string) => {
          if (ver === '6.1' || ver === '7.7') return false;
          return true;
        }),
      };

      (window as any).Telegram = { WebApp: mockWebAppV6 };

      render(
        <TelegramProvider>
          <div>Child</div>
        </TelegramProvider>
      );

      expect(mockWebAppV6.ready).toHaveBeenCalledTimes(1);
      // disableVerticalSwipes should NOT be called on v6.0
      expect(disableVerticalSwipesMock).not.toHaveBeenCalled();
    });

    it('does NOT invoke BackButton.show() on Telegram WebApp v6.0 when isVersionAtLeast(6.1) is false', () => {
      const mockBackButton = {
        isVisible: false,
        show: vi.fn(),
        hide: vi.fn(),
        onClick: vi.fn(),
        offClick: vi.fn(),
      };

      const mockWebAppV6: Partial<TelegramWebApp> = {
        version: '6.0',
        ready: vi.fn(),
        expand: vi.fn(),
        BackButton: mockBackButton as any,
        isVersionAtLeast: vi.fn((ver: string) => {
          if (ver === '6.1' || ver === '7.7') return false;
          return true;
        }),
      };

      (window as any).Telegram = { WebApp: mockWebAppV6 };

      function Consumer() {
        const { showBackButton } = useTelegram();
        return <button onClick={() => showBackButton()}>Show Back</button>;
      }

      render(
        <TelegramProvider>
          <Consumer />
        </TelegramProvider>
      );

      const btn = screen.getByText('Show Back');
      act(() => {
        btn.click();
      });

      // BackButton.show should NOT be called on v6.0
      expect(mockBackButton.show).not.toHaveBeenCalled();
    });
  });

  describe('RouteCarousel Visited Stops SSR & Initial Render Consistency', () => {
    it('initializes visitedStopIds safely to prevent SSR hydration mismatch when localStorage has saved stops', () => {
      // Simulate existing visited stops in localStorage prior to render
      localStorage.setItem(
        'tbilisi_visited_heartbeat-express-1-2h',
        JSON.stringify(['hb-stop-2'])
      );

      // Render RouteCarousel
      render(<RouteCarousel route={sampleRoute} />);

      // Visited badge for hb-stop-2 should be present
      expect(screen.getByText('Visited')).toBeInTheDocument();
    });
  });
});
