'use client';

import React from 'react';
import { Route } from '@/lib/types/route';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import RouteCatalog from '@/components/RouteCatalog';
import LanguageToggle from '@/components/LanguageToggle';
import EmojiIcon from '@/components/ui/EmojiIcon';

export interface CatalogShellProps {
  routes: Route[];
}

/**
 * The catalog's own chrome, client-side because it carries the language toggle — the
 * traveler can change language before they have opened any Route, and everything the
 * page says changes with it, not just the cards.
 */
export default function CatalogShell({ routes }: CatalogShellProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#1C1008] overflow-x-hidden antialiased font-sans">
      {/* Header / Hero Section */}
      <header className="border-b border-[#C4572A]/15 bg-[#FAF7F2]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <EmojiIcon name="georgiaFlag" className="text-2xl" ariaLabel="Georgia Flag" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-[#1C1008] font-sans">
                {t('headerTitle')}
              </h1>
              <p className="text-xs text-[#7A6552] font-medium">{t('headerSubtitle')}</p>
            </div>
          </div>

          {/* Reachable from the catalog, not only from inside a Route. */}
          <LanguageToggle tone="plain" className="shrink-0" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-8 overflow-hidden">
        {/* Intro Hero Banner */}
        <section
          className="rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden text-[#1C1008]"
          style={{
            background: '#FFF8F3',
            border: '1px solid rgba(196,87,42,0.18)',
          }}
        >
          <div className="relative z-10 space-y-3 max-w-2xl">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1C1008] leading-tight font-sans">
              {t('heroTitle')}
            </h2>
            <p className="text-[#7A6552] text-sm sm:text-base leading-relaxed">{t('heroDesc')}</p>
          </div>
        </section>

        {/* Route Cards Catalog Grid & Filter Controls */}
        <section className="space-y-4">
          <RouteCatalog initialRoutes={routes} />
        </section>
      </main>

      {/* Page Footer */}
      <footer className="border-t border-[#C4572A]/15 py-6 mt-12 text-center text-xs text-[#7A6552]">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-[#1C1008]">{t('footerTitle')}</p>
          <p>{t('footerRights', { year: new Date().getFullYear() })}</p>
        </div>
      </footer>
    </div>
  );
}
