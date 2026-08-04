import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TelegramProvider, useTelegram } from '@/components/TelegramProvider';
import { TelegramWebApp } from '@/lib/types/telegram';

const mockBackButton = {
  isVisible: false,
  show: vi.fn(),
  hide: vi.fn(),
  onClick: vi.fn(),
  offClick: vi.fn(),
};

const mockWebApp: Partial<TelegramWebApp> = {
  ready: vi.fn(),
  expand: vi.fn(),
  close: vi.fn(),
  onEvent: vi.fn(),
  offEvent: vi.fn(),
  colorScheme: 'dark',
  themeParams: {
    bg_color: '#181818',
    text_color: '#ffffff',
    button_color: '#c85a32',
    button_text_color: '#ffffff',
    secondary_bg_color: '#242424',
  },
  BackButton: mockBackButton as any,
};

function TestConsumer() {
  const { webApp, isReady, colorScheme, showBackButton, hideBackButton } = useTelegram();

  return (
    <div>
      <span data-testid="ready">{isReady ? 'ready' : 'not-ready'}</span>
      <span data-testid="scheme">{colorScheme}</span>
      <button onClick={() => showBackButton(() => webApp?.close())}>Show Back</button>
      <button onClick={() => hideBackButton()}>Hide Back</button>
    </div>
  );
}

describe('TelegramProvider Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).Telegram;
  });

  afterEach(() => {
    delete (window as any).Telegram;
    document.documentElement.style.cssText = '';
  });

  it('renders children and initializes Telegram WebApp SDK when window.Telegram.WebApp exists', () => {
    (window as any).Telegram = { WebApp: mockWebApp };

    render(
      <TelegramProvider>
        <TestConsumer />
      </TelegramProvider>
    );

    expect(screen.getByTestId('ready')).toHaveTextContent('ready');
    expect(screen.getByTestId('scheme')).toHaveTextContent('dark');
    expect(mockWebApp.ready).toHaveBeenCalledTimes(1);
    expect(mockWebApp.expand).toHaveBeenCalledTimes(1);

    // Verify root CSS variables binding
    expect(document.documentElement.style.getPropertyValue('--twa-bg-color')).toBe('#181818');
    expect(document.documentElement.style.getPropertyValue('--twa-text-color')).toBe('#ffffff');
    expect(document.documentElement.style.getPropertyValue('--twa-button-color')).toBe('#c85a32');
  });

  it('handles environment gracefully when Telegram WebApp is unavailable (standalone web browser)', () => {
    render(
      <TelegramProvider>
        <TestConsumer />
      </TelegramProvider>
    );

    expect(screen.getByTestId('ready')).toHaveTextContent('ready');
    expect(screen.getByTestId('scheme')).toHaveTextContent('light');
  });

  it('initializes Telegram WebApp SDK when window.Telegram.WebApp becomes available after mount', async () => {
    render(
      <TelegramProvider>
        <TestConsumer />
      </TelegramProvider>
    );

    expect(screen.getByTestId('ready')).toHaveTextContent('ready');
    expect(screen.getByTestId('scheme')).toHaveTextContent('light');

    // Simulate async Telegram script loading and attaching to window
    await act(async () => {
      (window as any).Telegram = { WebApp: mockWebApp };
      window.dispatchEvent(new Event('DOMContentLoaded'));
    });

    expect(mockWebApp.ready).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('scheme')).toHaveTextContent('dark');
  });

  it('binds native Telegram BackButton handlers correctly', () => {
    (window as any).Telegram = { WebApp: mockWebApp };

    render(
      <TelegramProvider>
        <TestConsumer />
      </TelegramProvider>
    );

    const showButton = screen.getByText('Show Back');
    act(() => {
      showButton.click();
    });

    expect(mockBackButton.show).toHaveBeenCalledTimes(1);
    expect(mockBackButton.onClick).toHaveBeenCalled();

    const hideButton = screen.getByText('Hide Back');
    act(() => {
      hideButton.click();
    });

    expect(mockBackButton.hide).toHaveBeenCalledTimes(1);
  });

  describe('Telegram WebApp v6.0 Version Guards', () => {
    const createMockWebAppV6 = (overrides = {}) => ({
      version: '6.0',
      ready: vi.fn(),
      expand: vi.fn(),
      isVersionAtLeast: vi.fn((ver: string) => {
        if (ver === '6.1' || ver === '7.7') return false;
        return true;
      }),
      ...overrides,
    });

    it('does NOT invoke disableVerticalSwipes on Telegram WebApp v6.0 (where isVersionAtLeast 7.7 is false)', () => {
      const disableVerticalSwipesMock = vi.fn();
      const mockWebAppV6 = createMockWebAppV6({ disableVerticalSwipes: disableVerticalSwipesMock });

      (window as any).Telegram = { WebApp: mockWebAppV6 };

      render(
        <TelegramProvider>
          <div>Child</div>
        </TelegramProvider>
      );

      expect(mockWebAppV6.ready).toHaveBeenCalledTimes(1);
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

      const mockWebAppV6 = createMockWebAppV6({ BackButton: mockBackButton });

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

      expect(mockBackButton.show).not.toHaveBeenCalled();
    });
  });
});


