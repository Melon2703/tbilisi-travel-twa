'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Script from 'next/script';
import { TelegramWebApp, TelegramThemeParams, TelegramUser } from '@/lib/types/telegram';

interface TelegramContextValue {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isReady: boolean;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
  showBackButton: (onBackClick?: () => void) => void;
  hideBackButton: () => void;
}

const TelegramContext = createContext<TelegramContextValue>({
  webApp: null,
  user: null,
  isReady: false,
  colorScheme: 'light',
  themeParams: {},
  showBackButton: () => {},
  hideBackButton: () => {},
});

export const useTelegram = () => useContext(TelegramContext);

interface TelegramProviderProps {
  children: React.ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [themeParams, setThemeParams] = useState<TelegramThemeParams>({});
  const [user, setUser] = useState<TelegramUser | null>(null);
  const backButtonHandlerRef = React.useRef<(() => void) | null>(null);

  const applyTheme = useCallback((tp?: TelegramThemeParams) => {
    if (!tp || typeof document === 'undefined') return;
    const root = document.documentElement;

    if (tp.bg_color) root.style.setProperty('--twa-bg-color', tp.bg_color);
    if (tp.text_color) root.style.setProperty('--twa-text-color', tp.text_color);
    if (tp.hint_color) root.style.setProperty('--twa-hint-color', tp.hint_color);
    if (tp.link_color) root.style.setProperty('--twa-link-color', tp.link_color);
    if (tp.button_color) root.style.setProperty('--twa-button-color', tp.button_color);
    if (tp.button_text_color) root.style.setProperty('--twa-button-text-color', tp.button_text_color);
    if (tp.secondary_bg_color) root.style.setProperty('--twa-secondary-bg-color', tp.secondary_bg_color);
    if (tp.header_bg_color) root.style.setProperty('--twa-header-bg-color', tp.header_bg_color);
  }, []);

  const initTelegram = useCallback(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const app = window.Telegram.WebApp;
      setWebApp(app);
      if (app.colorScheme) setColorScheme(app.colorScheme);
      if (app.themeParams) {
        setThemeParams(app.themeParams);
        applyTheme(app.themeParams);
      }
      if (app.initDataUnsafe?.user) {
        setUser(app.initDataUnsafe.user);
      }

      app.ready();
      app.expand();

      const handleThemeChange = () => {
        if (app.themeParams) {
          setThemeParams(app.themeParams);
          applyTheme(app.themeParams);
        }
        if (app.colorScheme) setColorScheme(app.colorScheme);
      };

      if (app.onEvent) {
        app.onEvent('themeChanged', handleThemeChange);
      }
    }
    setIsReady(true);
  }, [applyTheme]);

  useEffect(() => {
    initTelegram();
  }, [initTelegram]);

  const showBackButton = useCallback(
    (onBackClick?: () => void) => {
      if (webApp?.BackButton) {
        if (backButtonHandlerRef.current && webApp.BackButton.offClick) {
          webApp.BackButton.offClick(backButtonHandlerRef.current);
        }
        const handler = onBackClick || (() => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
          } else {
            webApp.close();
          }
        });
        backButtonHandlerRef.current = handler;
        webApp.BackButton.onClick(handler);
        webApp.BackButton.show();
      }
    },
    [webApp]
  );

  const hideBackButton = useCallback(() => {
    if (webApp?.BackButton) {
      if (backButtonHandlerRef.current && webApp.BackButton.offClick) {
        webApp.BackButton.offClick(backButtonHandlerRef.current);
        backButtonHandlerRef.current = null;
      }
      webApp.BackButton.hide();
    }
  }, [webApp]);

  return (
    <TelegramContext.Provider
      value={{
        webApp,
        user,
        isReady,
        colorScheme,
        themeParams,
        showBackButton,
        hideBackButton,
      }}
    >
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
        onLoad={initTelegram}
      />
      {children}
    </TelegramContext.Provider>
  );
}
