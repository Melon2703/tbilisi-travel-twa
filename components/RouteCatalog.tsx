'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Route,
  RouteFamily,
  DurationCategory,
  VibeCategory,
  LogisticsConstraint,
} from '@/lib/types/route';
import { sortRoutesByProximity, calculateDistance } from '@/lib/engine/matcher';
import {
  offeredDurations,
  offeredVibes,
  offeredLogisticsConstraints,
  filterRoutes,
  NO_FILTERS,
  type CatalogFilters,
} from '@/lib/engine/catalogFilters';
import type { TranslationKey } from '@/lib/i18n/translations';
import FilterChipGroup from '@/components/ui/FilterChipGroup';
import { getRouteDurationFormatted, formatAccessibilityLabel, ROUTE_FAMILIES } from '@/lib/data/routes';
import { describeRouteFamily } from '@/lib/utils/family';
import {
  getProgressPositions,
  stopAtProgressPosition,
  type ProgressPositions,
} from '@/lib/utils/progress';
import { useLanguage, getLocalizedFamilyName } from '@/lib/i18n/LanguageContext';
import { routeEntryCtaLabel } from '@/components/RouteIntroCard';
import EmojiIcon from '@/components/ui/EmojiIcon';
import GeorgianOrnament from '@/components/ui/GeorgianOrnament';

export interface RouteCatalogProps {
  initialRoutes: Route[];
  families?: RouteFamily[];
}

/*
  Chip labels only. Which chips are offered is decided against the catalog in
  lib/engine/catalogFilters — a label here never puts an option on screen by itself,
  so a duration or Vibe that no longer earns a chip cannot linger as a dead end.
*/
const DURATION_LABELS: Record<DurationCategory, { en: string; ru: string }> = {
  '1-2h': { en: '1-2 Hours', ru: '1-2 часа' },
  '3-4h': { en: '3-4 Hours', ru: '3-4 часа' },
  'half-day': { en: 'Half-Day', ru: 'Полдня' },
  'full-day': { en: 'Full-Day', ru: 'Весь день' },
};

const VIBE_LABELS: Record<VibeCategory, { en: string; ru: string }> = {
  'insta-locations': { en: 'Insta-Spots', ru: 'Инста-места' },
  cultural: { en: 'Cultural', ru: 'Культура' },
  hiking: { en: 'Hiking', ru: 'Хайкинг' },
  'food-wine': { en: 'Food & Wine', ru: 'Еда и вино' },
  courtyards: { en: 'Courtyards', ru: 'Дворики' },
  'photo-spots': { en: 'Photo Spots', ru: 'Фотолокации' },
  architecture: { en: 'Architecture', ru: 'Архитектура' },
};

/*
  Phrased as what the traveler can walk, not as a property of the Route: a Hard
  Constraint is answered by the body, not by a preference.
*/
const LOGISTICS_LABEL_KEYS: Record<LogisticsConstraint, TranslationKey> = {
  'stroller-friendly': 'logisticsStepFree',
  moderate: 'logisticsCobblestones',
  'steep-stairs': 'logisticsStairs',
};

export default function RouteCatalog({
  initialRoutes,
  families = ROUTE_FAMILIES,
}: RouteCatalogProps) {
  const { language, t, getLocalizedStop } = useLanguage();

  /**
   * Progress Position lives in browser storage, so it is unknown while the catalog
   * renders on the server and on the first client render — null until it resolves here,
   * in one storage read for the whole catalog. Until then a card shows no entry CTA at
   * all rather than guessing at one: a partly-walked Route that opened on the default
   * CTA would flash the wrong one. The slot keeps its size throughout, so nothing moves.
   */
  const [progressPositions, setProgressPositions] = useState<ProgressPositions | null>(null);

  useEffect(() => {
    setProgressPositions(getProgressPositions());
  }, []);

  const [filters, setFilters] = useState<CatalogFilters>(NO_FILTERS);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleRequestLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      setLocationError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
        },
        (error) => {
          setIsLocating(false);
          setLocationError(
            language === 'ru' ? 'Не удалось определить геолокацию' : 'Could not retrieve location'
          );
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocationError(
        language === 'ru' ? 'Геолокация не поддерживается' : 'Geolocation not supported'
      );
    }
  };

  /*
    Offered options are read from the catalog on every render, not from a hand-kept
    list: a chip is on screen only if tapping it changes what the traveler sees.
  */
  const locale = language === 'ru' ? 'ru' : 'en';
  const durationOptions = offeredDurations(initialRoutes).map((duration) => ({
    value: duration,
    label: DURATION_LABELS[duration][locale],
  }));
  const vibeOptions = offeredVibes(initialRoutes).map((vibe) => ({
    value: vibe,
    label: `#${VIBE_LABELS[vibe][locale]}`,
  }));
  const logisticsOptions = offeredLogisticsConstraints(initialRoutes).map((constraint) => ({
    value: constraint,
    label: t(LOGISTICS_LABEL_KEYS[constraint]),
  }));

  let filteredRoutes = filterRoutes(initialRoutes, filters);

  if (userLocation) {
    filteredRoutes = sortRoutesByProximity(filteredRoutes, userLocation);
  }

  return (
    <div className="space-y-6">
      {/* ── Filter Controls Panel ── */}
      <div
        data-testid="filter-controls-panel"
        className="bg-[#FFF8F3] rounded-3xl p-5 border border-[#C4572A]/15 shadow-xs space-y-4 text-[#1C1008]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-[#1C1008]">
              {language === 'ru' ? 'Фильтры и сортировки' : 'Route filters & sorting'}
            </h3>
          </div>

          {/* Geo-Proximity Location Button */}
          <button
            type="button"
            data-testid="geo-location-button"
            onClick={handleRequestLocation}
            disabled={isLocating}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs min-h-[36px] ${userLocation
                ? 'bg-[#228255] text-white ring-2 ring-[#228255]/30'
                : 'bg-[#C4572A] text-white active:scale-95'
              }`}
          >
            <span>📍</span>
            <span>
              {isLocating
                ? t('locating')
                : userLocation
                  ? language === 'ru'
                    ? 'Сортировка поблизости (Вкл)'
                    : 'Nearest First (Active)'
                  : t('useMyLocation')}
            </span>
          </button>
        </div>

        {locationError && (
          <p className="text-xs text-red-600 font-medium">{locationError}</p>
        )}

        {/*
          ── Hard Constraint ──
          Leads the panel and is boxed off from the pills below it. A traveler with a
          stroller or bad knees is answering a question about their body, not stating a
          preference, so the block says outright that it is never relaxed.
        */}
        {logisticsOptions.length > 0 && (
          <FilterChipGroup
            kind="hard"
            testIdPrefix="logistics"
            icon="♿"
            label={t('logisticsFilterLabel')}
            note={t('hardConstraintNote')}
            unconstrainedLabel={t('anyLogistics')}
            options={logisticsOptions}
            selected={filters.logistics}
            onSelect={(logistics) => setFilters((f) => ({ ...f, logistics }))}
          />
        )}

        {/* ── Soft Constraints ── */}
        <FilterChipGroup
          kind="soft"
          testIdPrefix="duration"
          icon="⏱️"
          label={language === 'ru' ? 'Длительность' : 'Duration'}
          unconstrainedLabel={t('allDurations')}
          options={durationOptions}
          selected={filters.duration}
          onSelect={(duration) => setFilters((f) => ({ ...f, duration }))}
        />

        <FilterChipGroup
          kind="soft"
          testIdPrefix="vibe"
          icon="✨"
          label={language === 'ru' ? 'Атмосфера' : 'Vibe'}
          unconstrainedLabel={t('allVibes')}
          options={vibeOptions}
          selected={filters.vibe}
          onSelect={(vibe) => setFilters((f) => ({ ...f, vibe }))}
        />

        {filteredRoutes.length !== initialRoutes.length && (
          <div className="pt-2 flex justify-end">
            <span data-testid="filter-match-count" className="text-[11px] font-semibold text-[#C4572A]">
              {filteredRoutes.length} / {initialRoutes.length} {language === 'ru' ? 'маршрутов' : 'routes'}
            </span>
          </div>
        )}
      </div>

      {/* ── Catalog Section Header ── */}
      <div className="flex items-center justify-between">
        <h2
          className="text-xl font-black tracking-tight text-[#1C1008] font-sans"
        >
          {t('catalogTitle')}
        </h2>
      </div>

      {/* ── Route Grid ── */}
      {filteredRoutes.length === 0 ? (
        <div className="p-8 text-center bg-[#FFF8F3] rounded-2xl border border-[#C4572A]/15 text-[#7A6552] space-y-2">
          <p className="text-base font-bold text-[#1C1008]">
            {language === 'ru' ? 'Маршруты не найдены' : 'No matching routes found'}
          </p>
          <p className="text-xs">
            {language === 'ru'
              ? 'Попробуйте ослабить фильтры для просмотра всех вариантов.'
              : 'Try clearing some filters to see all available walking routes.'}
          </p>
          {/* Clears the Hard Constraint along with the rest — one reset, no leftovers. */}
          <button
            type="button"
            data-testid="reset-filters"
            onClick={() => setFilters(NO_FILTERS)}
            className="mt-2 px-4 py-2 bg-[#C4572A] text-white text-xs font-bold rounded-full shadow-xs"
          >
            {t('resetFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route) => {
            const formattedTime = getRouteDurationFormatted(route);
            const accessibilityText = formatAccessibilityLabel(route.accessibility);

            const distanceKm = userLocation
              ? calculateDistance(
                userLocation.lat,
                userLocation.lng,
                route.stops[0]?.coordinates?.lat || 0,
                route.stops[0]?.coordinates?.lng || 0
              ).toFixed(1)
              : null;

            /*
              Read against the whole catalog, not the filtered view: a Route keeps its
              place in its Route Family whether or not its siblings are on screen.
            */
            const familyStanding = describeRouteFamily(route, initialRoutes, families);

            const progressPosition = progressPositions?.[route.id] ?? null;
            const resumedStop = stopAtProgressPosition(route.stops, progressPosition);

            return (
              <Link
                key={route.id}
                data-testid={`route-card-${route.id}`}
                href={resumedStop ? `/twa/${route.id}?at=${progressPosition}` : `/twa/${route.id}`}
                className="flex flex-col bg-[#FFF8F3] rounded-2xl overflow-hidden border border-[#C4572A]/15 shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4572A] active:scale-[0.99]"
              >
                {/* Hero Card Image */}
                <div className="relative w-full h-48 bg-[#FAF7F2] overflow-hidden">
                  {route.heroImage && (
                    <Image
                      src={route.heroImage}
                      alt={route.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* Top Badges (Max 2 essential badges: Duration and Difficulty/Accessibility) */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 gap-1.5">
                    <div className="flex flex-wrap gap-1.5" data-testid="essential-badges">
                      <span className="bg-[#C4572A] text-white text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-xs tracking-[0.06em]">
                        {route.durationCategory}
                      </span>
                      <span className="bg-black/60 text-[#FAF7F2] text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-xs tracking-[0.06em]">
                        {accessibilityText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3
                      className="text-lg font-black text-[#1C1008] transition-colors leading-snug font-sans"
                    >
                      {route.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#7A6552] leading-relaxed">
                      {route.subtitle}
                    </p>
                    {/*
                      One line, label only. It says which shared Stop pool this Route is
                      drawn from and how much of it this Route walks — never what the
                      traveler gave up by choosing it (ADR 0005).
                    */}
                    {familyStanding && (
                      <p
                        data-testid={`route-family-${route.id}`}
                        className="text-[11px] font-semibold text-[#7A6552]/90 leading-snug"
                      >
                        {familyStanding.role === 'full-version'
                          ? t('familyFullVersion', {
                            family: getLocalizedFamilyName(familyStanding.family, language),
                          })
                          : t('familyVariant', {
                            family: getLocalizedFamilyName(familyStanding.family, language),
                            count: familyStanding.stopCount,
                            total: familyStanding.fullVersionStopCount,
                          })}
                      </p>
                    )}
                  </div>

                  <GeorgianOrnament />

                  {/* Card Footer Meta & CTA */}
                  <div className="pt-3 border-t border-[#C4572A]/12 text-xs font-semibold text-[#7A6552]">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <EmojiIcon name="mapPin" size="xs" />{' '}
                        <span className="text-[#1C1008] font-bold">
                          {t('stopsCount', { count: route.stops.length })}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <EmojiIcon name="clock" size="xs" />{' '}
                        <span className="text-[#1C1008] font-bold">{formattedTime}</span>
                      </span>
                      {distanceKm !== null && (
                        <span
                          data-testid="route-distance-badge"
                          className="flex items-center gap-0.5 text-[#228255] font-bold"
                        >
                          📍 {distanceKm} km
                        </span>
                      )}
                    </div>
                    {/*
                      A full-width row of its own: the label changes with progress, its
                      geometry never does, and the reached Stop gets the whole card width
                      to be named in.
                    */}
                    <span
                      data-testid={`route-cta-${route.id}`}
                      className="text-[#C4572A] transition-transform flex items-center justify-end gap-1 font-bold min-h-[48px] w-full truncate whitespace-nowrap text-right"
                    >
                      {progressPositions === null
                        ? null
                        : routeEntryCtaLabel(
                          t,
                          resumedStop ? getLocalizedStop(resumedStop).name : null,
                          'viewRoute'
                        )}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
