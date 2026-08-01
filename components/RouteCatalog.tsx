'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Route, DurationCategory, VibeCategory } from '@/lib/types/route';
import { sortRoutesByProximity, calculateDistance } from '@/lib/engine/matcher';
import { getRouteDurationFormatted, formatAccessibilityLabel } from '@/lib/data/routes';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import EmojiIcon from '@/components/ui/EmojiIcon';
import GeorgianOrnament from '@/components/ui/GeorgianOrnament';

export interface RouteCatalogProps {
  initialRoutes: Route[];
}

const DURATIONS: { id: DurationCategory; label: string; labelRu: string }[] = [
  { id: '1-2h', label: '1-2 Hours', labelRu: '1-2 часа' },
  { id: '3-4h', label: '3-4 Hours', labelRu: '3-4 часа' },
  { id: 'half-day', label: 'Half-Day', labelRu: 'Полдня' },
  { id: 'full-day', label: 'Full-Day', labelRu: 'Весь день' },
];

const VIBES: { id: VibeCategory; label: string; labelRu: string }[] = [
  { id: 'insta-locations', label: 'Insta-Spots', labelRu: 'Инста-места' },
  { id: 'cultural', label: 'Cultural', labelRu: 'Культура' },
  { id: 'hiking', label: 'Hiking', labelRu: 'Хайкинг' },
  { id: 'food-wine', label: 'Food & Wine', labelRu: 'Еда и вино' },
  { id: 'courtyards', label: 'Courtyards', labelRu: 'Дворики' },
  { id: 'photo-spots', label: 'Photo Spots', labelRu: 'Фотолокации' },
  { id: 'architecture', label: 'Architecture', labelRu: 'Архитектура' },
];

export default function RouteCatalog({ initialRoutes }: RouteCatalogProps) {
  const { language, t } = useLanguage();

  const [selectedDuration, setSelectedDuration] = useState<DurationCategory | 'all'>('all');
  const [selectedVibe, setSelectedVibe] = useState<VibeCategory | 'all'>('all');
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

  let filteredRoutes = initialRoutes.filter((route) => {
    if (selectedDuration !== 'all' && route.durationCategory !== selectedDuration) {
      return false;
    }
    if (selectedVibe !== 'all' && !route.vibes.includes(selectedVibe)) {
      return false;
    }
    return true;
  });

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
                : 'bg-[#C4572A] text-white hover:bg-[#a84720] active:scale-95'
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

        {/* Duration Filters Row */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#7A6552] flex items-center gap-1">
            <span>⏱️</span> {language === 'ru' ? 'Длительность' : 'Duration'}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              data-testid="duration-filter-all"
              onClick={() => setSelectedDuration('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all min-h-[36px] ${selectedDuration === 'all'
                  ? 'bg-[#1C1008] text-white shadow-xs'
                  : 'bg-[#F3EFEA] text-[#7A6552] border-0 hover:text-[#1C1008]'
                }`}
            >
              {t('allDurations')}
            </button>
            {DURATIONS.map((d) => (
              <button
                key={d.id}
                type="button"
                data-testid={`duration-filter-${d.id}`}
                onClick={() => setSelectedDuration(d.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all min-h-[36px] ${selectedDuration === d.id
                    ? 'bg-[#C4572A] text-white shadow-xs'
                    : 'bg-[#F3EFEA] text-[#7A6552] border-0 hover:text-[#1C1008]'
                  }`}
              >
                {language === 'ru' ? d.labelRu : d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vibe Filters Row */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#7A6552] flex items-center gap-1">
            <span>✨</span> {language === 'ru' ? 'Атмосфера' : 'Vibe'}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              data-testid="vibe-filter-all"
              onClick={() => setSelectedVibe('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all min-h-[36px] ${selectedVibe === 'all'
                  ? 'bg-[#1C1008] text-white shadow-xs'
                  : 'bg-[#F3EFEA] text-[#7A6552] border-0 hover:text-[#1C1008]'
                }`}
            >
              {t('allVibes')}
            </button>
            {VIBES.map((v) => (
              <button
                key={v.id}
                type="button"
                data-testid={`vibe-filter-${v.id}`}
                onClick={() => setSelectedVibe(v.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all min-h-[36px] ${selectedVibe === v.id
                    ? 'bg-[#C4572A] text-white shadow-xs'
                    : 'bg-[#F3EFEA] text-[#7A6552] border-0 hover:text-[#1C1008]'
                  }`}
              >
                #{language === 'ru' ? v.labelRu : v.label}
              </button>
            ))}
          </div>
        </div>

        {filteredRoutes.length !== initialRoutes.length && (
          <div className="pt-2 flex justify-end">
            <span className="text-[11px] font-semibold text-[#C4572A]">
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
          <button
            type="button"
            onClick={() => {
              setSelectedDuration('all');
              setSelectedVibe('all');
            }}
            className="mt-2 px-4 py-2 bg-[#C4572A] text-white text-xs font-bold rounded-full shadow-xs"
          >
            {language === 'ru' ? 'Сбросить фильтры' : 'Reset Filters'}
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

            return (
              <Link
                key={route.id}
                href={`/twa/${route.id}`}
                className="group flex flex-col bg-[#FFF8F3] rounded-2xl overflow-hidden border border-[#C4572A]/15 shadow-xs hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4572A] active:scale-[0.99]"
              >
                {/* Hero Card Image */}
                <div className="relative w-full h-48 bg-[#FAF7F2] overflow-hidden">
                  {route.heroImage && (
                    <Image
                      src={route.heroImage}
                      alt={route.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
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
                      className="text-lg font-black text-[#1C1008] group-hover:text-[#C4572A] transition-colors leading-snug font-sans"
                    >
                      {route.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#7A6552] leading-relaxed">
                      {route.subtitle}
                    </p>
                  </div>

                  <GeorgianOrnament />

                  {/* Card Footer Meta & CTA */}
                  <div className="pt-3 border-t border-[#C4572A]/12 flex items-center justify-between text-xs font-semibold text-[#7A6552]">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <EmojiIcon name="mapPin" size="xs" />{' '}
                        <span className="text-[#1C1008] font-bold">{route.stops.length} stops</span>
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
                    <span className="text-[#C4572A] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold min-h-[44px]">
                      {t('viewRoute')}
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
