'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Route } from '@/lib/types/route';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { TranslationKey } from '@/lib/i18n/translations';
import GeorgianOrnament from '@/components/ui/GeorgianOrnament';
import EmojiIcon from '@/components/ui/EmojiIcon';
import Button from '@/components/ui/Button';
import RouteOverviewMap from '@/components/RouteOverviewMap';
import RouteMapModal from '@/components/RouteMapModal';

/**
 * The entry CTA for a Route: Continue, naming the Stop the traveler reached, once the
 * Route has a Progress Position — otherwise the surface's own default label. Shared by
 * every surface that offers entry into a Route: this card, the carousel's sticky bar
 * over Slide 0, and the catalog card, which defaults to `viewRoute` instead.
 */
export function routeEntryCtaLabel(
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
  progressStopName?: string | null,
  defaultLabel: TranslationKey = 'startRoute'
): string {
  return progressStopName ? t('continueRoute', { name: progressStopName }) : t(defaultLabel);
}

export interface RouteIntroCardProps {
  route: Route;
  onStartRoute?: () => void;
  showStartButton?: boolean;
  /** Name of the Stop at this Route's Progress Position, if it has one. */
  progressStopName?: string | null;
}

export default function RouteIntroCard({
  route,
  onStartRoute,
  showStartButton = true,
  progressStopName = null,
}: RouteIntroCardProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const sortedStops = [...route.stops].sort((a, b) => a.order - b.order);
  const totalMinutes = sortedStops.reduce((acc, stop) => acc + stop.estimatedMinutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const formattedTime =
    language === 'ru'
      ? hours > 0
        ? `${hours}ч ${mins > 0 ? `${mins}м` : ''}`
        : `${mins}м`
      : hours > 0
        ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`
        : `${mins}m`;

  const approxKm = (sortedStops.length * 0.35 + totalMinutes * 0.02).toFixed(1);

  const hasCableCar = sortedStops.some(
    (s) =>
      s.name.toLowerCase().includes('cable car') ||
      s.name.toLowerCase().includes('канатная') ||
      s.olyaTips.toLowerCase().includes('cable car')
  );
  const hasFunicular = sortedStops.some(
    (s) =>
      s.name.toLowerCase().includes('funicular') ||
      s.name.toLowerCase().includes('фуникулёр') ||
      s.olyaTips.toLowerCase().includes('funicular')
  );
  const transitModes = [
    hasCableCar ? t('cableCar') : null,
    hasFunicular ? t('funicular') : null,
  ].filter(Boolean);
  const transitModeStr = transitModes.length > 0 ? transitModes.join(' + ') : t('pedestrianWalkway');

  return (
    <div className="relative flex flex-col h-[100dvh] w-full bg-[#FAF7F2] text-[#1C1008] overflow-hidden justify-between touch-pan-x touch-pan-y">
      {/* ── Unified Scrollable Container ── */}
      <div className="w-full flex-1 overflow-y-auto pb-28 sm:pb-32 scrollbar-none">
        {/* ── Full-bleed hero image header ── */}
        <div className="relative w-full h-44 sm:h-56 shrink-0 bg-[#FAF7F2] overflow-hidden">
          {route.heroImage && (
            <Image
              src={route.heroImage}
              alt={route.title}
              fill
              priority
              className="w-full h-full object-cover"
            />
          )}
          {/* Soft bottom fade into cream */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%, rgba(250,247,242,0.6) 85%, rgba(250,247,242,1) 100%)',
            }}
          />

          {/* Top Language Toggle Switch */}
          <div className="absolute top-3 right-3 z-20 flex items-center bg-black/60 backdrop-blur-md rounded-full p-1 border border-white/20 shadow-md">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all min-h-[48px] min-w-[48px] flex items-center justify-center ${
                language === 'en' ? 'bg-[#C4572A] text-white' : 'text-white/80'
              }`}
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ru')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all min-h-[48px] min-w-[48px] flex items-center justify-center ${
                language === 'ru' ? 'bg-[#C4572A] text-white' : 'text-white/80'
              }`}
              aria-label="Переключить на русский"
            >
              RU
            </button>
          </div>
        </div>

        {/* ── Scrollable content body ── */}
        <div className="p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full flex flex-col justify-between">
        {/* 1. Pill Badges Row */}
        <div className="relative w-full overflow-hidden shrink-0">
          <div
            data-testid="pill-badges-row"
            className="flex items-center gap-2 overflow-x-auto py-1 pl-0.5 pr-8 text-xs font-semibold scrollbar-none scroll-smooth whitespace-nowrap flex-nowrap touch-pan-x no-scrollbar"
          >
            <span
              className="shrink-0 text-white px-3 py-1 rounded-full uppercase tracking-[0.06em] shadow-xs text-[11px] font-bold"
              style={{ background: '#C4572A' }}
            >
              {t(route.durationCategory as keyof typeof import('@/lib/i18n/translations').TRANSLATIONS.en) || route.durationCategory}
            </span>
            <span
              className="shrink-0 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.06em] border border-black/10"
              style={{ background: 'rgba(28,16,8,0.08)', color: '#1C1008' }}
            >
              {t(route.accessibility as keyof typeof import('@/lib/i18n/translations').TRANSLATIONS.en) || route.accessibility.replace('-', ' ')}
            </span>
            {route.vibes && route.vibes.map((vibe) => (
              <span
                key={vibe}
                className="shrink-0 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.06em] border border-black/10"
                style={{ background: 'rgba(196,87,42,0.08)', color: '#C4572A' }}
              >
                {t(vibe as keyof typeof import('@/lib/i18n/translations').TRANSLATIONS.en) || vibe.replace('-', ' ')}
              </span>
            ))}
          </div>
          <div
            data-testid="pill-badges-scroll-indicator"
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#FAF7F2] to-transparent z-10"
          />
        </div>

        {/* 2. Title & Subtitle Block */}
        <div className="space-y-1 min-w-0 max-w-full shrink-0">
          <h1
            className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight text-[#1C1008] break-words min-w-0 max-w-full font-sans"
          >
            {route.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6552] font-medium break-words min-w-0 leading-relaxed">
            {route.subtitle}
          </p>
        </div>

        {/* Georgian ornament divider */}
        <GeorgianOrnament />

        {/* 3. Upfront Cartographic Visual Route Overview Map */}
        <RouteOverviewMap route={route} onOpenModal={() => setIsMapModalOpen(true)} />

        {/* 4. Olya's Welcome Quote Card */}
        {route.introCopy && (
          <div
            data-testid="olya-welcome-card"
            className="rounded-2xl p-4 sm:p-5 shadow-xs relative shrink-0 space-y-1.5 bg-[#F3EFEA] border-0"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: '#C4572A' }}
                aria-hidden="true"
              >
                O
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold text-[#C4572A] mb-1">
                  {t('olyaWelcome')}
                </h3>
                <p
                  className="text-xs sm:text-sm text-[#4A3828] leading-relaxed italic"
                >
                  &ldquo;{route.introCopy}&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. Route At A Glance Summary Box */}
        <div
          data-testid="route-at-a-glance"
          className="rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 shrink-0 bg-[#F3EFEA] border-0"
        >
          <div className="flex items-center gap-3">
            <span className="h-px bg-[#C4572A]/10 flex-1" />
            <h2 className="text-xs font-bold text-[#C4572A]">
              {t('routeAtAGlance')}
            </h2>
            <span className="h-px bg-[#C4572A]/10 flex-1" />
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-3 text-xs font-medium text-[#7A6552]">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[#C4572A]"
                style={{ background: 'rgba(196,87,42,0.1)' }}
              >
                <EmojiIcon name="mapPin" size="md" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none text-[#1C1008]">
                  {sortedStops.length} {t('curatedStops')}
                </p>
                <p className="text-[11px] mt-0.5 text-[#A0876E]">{language === 'ru' ? 'Отобрано' : 'Curated'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[#7A6552]"
                style={{ background: 'rgba(28,16,8,0.06)' }}
              >
                <EmojiIcon name="footprints" size="md" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none text-[#1C1008]">~{approxKm} km</p>
                <p className="text-[11px] mt-0.5 text-[#A0876E]">{formattedTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[#7A6552]"
                style={{ background: 'rgba(28,16,8,0.06)' }}
              >
                <EmojiIcon name="funicular" size="md" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none text-[#1C1008]">{transitModeStr}</p>
                <p className="text-[11px] mt-0.5 text-[#A0876E]">{t('transitIncluded')}</p>
              </div>
            </div>
          </div>
        </div>


        {/* 7. Logistics & Terrain Highlights */}
        <div
          data-testid="logistics-terrain-highlights"
          className="rounded-2xl p-4 shadow-xs space-y-3 shrink-0 bg-[#FFF8F3] border border-[#C4572A]/10"
        >
          <h3 className="text-xs font-bold text-[#C4572A]">
            {t('logisticsTerrainTitle')}
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-[#FAF7F2] text-[#1C1008] border border-black/10 font-medium">
              🏷️ {t(route.accessibility as keyof typeof import('@/lib/i18n/translations').TRANSLATIONS.en) || route.accessibility.replace('-', ' ')}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#FAF7F2] text-[#1C1008] border border-black/10 font-medium">
              ⏱️ {t(route.durationCategory as keyof typeof import('@/lib/i18n/translations').TRANSLATIONS.en) || route.durationCategory}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#FAF7F2] text-[#1C1008] border border-black/10 font-medium">
              👟 ~{approxKm} km
            </span>
          </div>

          {(() => {
            const warnings = sortedStops
              .map((s) => (language === 'ru' ? s.logisticsWarningRu || s.logisticsWarning : s.logisticsWarning))
              .filter(Boolean);

            if (warnings.length === 0) return null;

            return (
              <div
                data-testid="logistics-notes-callout"
                className="p-4 sm:p-5 rounded-2xl bg-[#F3EFEA] border-0 space-y-1 text-xs text-[#8A3614]"
              >
                <p className="font-bold text-[10px] text-[#C4572A]">
                  {t('logisticsWarning')}
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {warnings.map((w, idx) => (
                    <li key={idx} className="leading-tight">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
        </div>

        </div>
      </div>

      {/* 6. Sticky Bottom CTA Button */}
      {showStartButton && (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-30 pointer-events-auto">
          <Button onClick={onStartRoute} emoji="arrowRight">
            {routeEntryCtaLabel(t, progressStopName)}
          </Button>
        </div>
      )}

      {/* Fullscreen Interactive Map Modal */}
      <RouteMapModal
        route={route}
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
      />
    </div>
  );
}
