'use client';

import React from 'react';
import Image from 'next/image';
import { Stop } from '@/lib/types/route';
import { getMapUrl } from '@/lib/utils/maps';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import EmojiIcon from '@/components/ui/EmojiIcon';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Callout from '@/components/ui/Callout';

import { getStopRatings, fetchPlaceRatingsFromAPI } from '@/lib/services/places';

export interface StopCardProps {
  stop: Stop;
  isLast?: boolean;
  totalStops?: number;
  isVisited?: boolean;
}

// Centered Georgian vine ornament
const GeorgianDivider = () => (
  <div className="flex justify-center my-1">
    <svg
      viewBox="0 0 120 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[120px]"
      aria-hidden="true"
    >
      <line x1="0" y1="6" x2="38" y2="6" stroke="#C4572A" strokeWidth="1" strokeOpacity="0.3" />
      <path
        d="M42 6 C44 3, 46 3, 48 6 C50 9, 52 9, 54 6 C56 3, 58 3, 60 6 C62 9, 64 9, 66 6 C68 3, 70 3, 72 6 C74 9, 76 9, 78 6"
        stroke="#C4572A"
        strokeWidth="1.2"
        strokeOpacity="0.6"
        fill="none"
        strokeLinecap="round"
      />
      <line x1="82" y1="6" x2="120" y2="6" stroke="#C4572A" strokeWidth="1" strokeOpacity="0.3" />
    </svg>
  </div>
);

// Star rating row component using emoji format
function StarRating({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < full) return 'full';
    if (i === full && hasHalf) return 'half';
    return 'empty';
  });
  const formatted = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
  return (
    <div className="flex items-center gap-1 mt-0.5">
      <span className="text-xs font-bold text-[#C4572A]">{rating.toFixed(1)}</span>
      <span className="flex items-center gap-[1px]">
        {stars.map((type, i) => (
          <EmojiIcon
            key={i}
            name="star"
            className={`text-[10px] ${
              type === 'full' ? 'opacity-100' : type === 'half' ? 'opacity-70' : 'opacity-25'
            }`}
          />
        ))}
      </span>
      <span className="text-[10px] text-[#9A7A68]">({formatted})</span>
    </div>
  );
}

function StopCard({ stop: rawStop, totalStops, isVisited = false }: StopCardProps) {
  const { t, getLocalizedStop } = useLanguage();
  const stop = getLocalizedStop(rawStop);

  const googleMapsUrl = getMapUrl('google', stop.coordinates);
  const yandexMapsUrl = getMapUrl('yandex', stop.coordinates);

  const initialRatings = getStopRatings(stop);
  const [ratings, setRatings] = React.useState(initialRatings);

  React.useEffect(() => {
    const currentRatings = getStopRatings(stop);
    setRatings(currentRatings);
    if (stop.placeIds) {
      let isMounted = true;
      fetchPlaceRatingsFromAPI(stop).then((liveRatings) => {
        if (isMounted) setRatings(liveRatings);
      });
      return () => {
        isMounted = false;
      };
    }
  }, [stop]);

  const stopLabel = totalStops
    ? t('stopOf', { order: stop.order, total: totalStops })
    : t('stopNumber', { order: stop.order });

  return (
    <div
      data-testid="stop-card-container"
      className="relative flex flex-col h-[100dvh] w-full bg-[#FAF7F2] text-[#1C1008] overflow-hidden justify-between touch-pan-x touch-pan-y overscroll-y-contain transform-gpu"
    >
      {/* ── Hero image — full-bleed header section ── */}
      {stop.imageUrl && (
        <div className="relative w-full h-52 sm:h-60 shrink-0 bg-[#FAF7F2] overflow-hidden">
          <Image
            src={stop.imageUrl}
            alt={stop.name}
            fill
            sizes="(max-width: 640px) 100vw, 640px"
            className="object-cover"
            priority={stop.order === 1}
          />

          {/* Top scrim gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 45%, rgba(250,247,242,0) 75%, rgba(250,247,242,1) 100%)',
            }}
          />

          {/* Floating frosted-glass badges */}
          <span className="absolute top-3 left-3 backdrop-blur-md bg-black/50 bg-slate-900/80 text-xs text-[#FAF7F2] text-white px-3 py-1.5 rounded-full font-semibold z-20 flex items-center gap-1.5 border border-white/20 shadow-xs">
            <EmojiIcon name="mapPin" size="xs" />
            {stop.neighborhood}
          </span>

          <span className="absolute top-3 right-3 backdrop-blur-md bg-black/50 bg-slate-900/80 text-xs text-[#FAF7F2] text-white px-3 py-1.5 rounded-full font-semibold z-20 flex items-center gap-1.5 border border-white/20 shadow-xs">
            <EmojiIcon name="clock" size="xs" />
            {stop.estimatedMinutes} {t('min')}
          </span>
        </div>
      )}

      {/* ── Scrollable Card Content Body ── */}
      <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 pb-24 sm:pb-28 scrollbar-none max-w-2xl mx-auto w-full">
        {/* Header & Order Badge */}
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C4572A] mb-1">
              {stopLabel}
            </p>
            <h2
              className="text-xl sm:text-2xl font-black text-[#1C1008] tracking-tight leading-snug break-words min-w-0"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              {stop.name}
            </h2>
          </div>
          {isVisited && (
            <Badge variant="visited">
              {t('visited')}
            </Badge>
          )}
        </div>

        {/* Georgian Divider */}
        <GeorgianDivider />

        {/* Branded Map Provider Deep Link Buttons */}
        <div className="grid grid-cols-2 gap-3 my-2" data-testid="map-pills-row">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 py-3 px-3 rounded-2xl border transition-all active:scale-[0.97] min-h-[48px] bg-white border-[#E8EAF0] shadow-xs"
            aria-label="Open in Google Maps"
          >
            <div className="flex items-center gap-1.5">
              <EmojiIcon name="googleMaps" size="md" />
              <span className="text-[13px] font-semibold text-[#1C1008]">Google Maps</span>
            </div>
            <StarRating rating={ratings.google.rating} count={ratings.google.count} />
          </a>

          <a
            href={yandexMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 py-3 px-3 rounded-2xl border transition-all active:scale-[0.97] min-h-[48px] bg-white border-[#E8EAF0] shadow-xs"
            aria-label="Open in Yandex Maps"
          >
            <div className="flex items-center gap-1.5">
              <EmojiIcon name="yandexMaps" size="md" />
              <span className="text-[13px] font-semibold text-[#1C1008]">Yandex Maps</span>
            </div>
            <StarRating rating={ratings.yandex.rating} count={ratings.yandex.count} />
          </a>
        </div>

        {/* Olya's Tip Box */}
        <Callout emoji="chat" title={t('olyaTip')} className="my-2">
          <p
            className="text-sm italic leading-relaxed text-[#4A3828]"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            &ldquo;{stop.olyaTips}&rdquo;
          </p>
        </Callout>

        {/* Photo Spot Recommendation Callout */}
        {stop.photoSpot && (
          <div data-testid="photo-spot">
            <Callout emoji="camera" title={t('photoSpotRec')} className="my-2">
              {stop.photoSpot}
            </Callout>
          </div>
        )}

        {/* Logistics Warning Callout */}
        {stop.logisticsWarning && (
          <div data-testid="logistics-warning">
            <Callout emoji="warning" title={t('logisticsWarning')} variant="warning" className="my-2">
              {stop.logisticsWarning}
            </Callout>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(StopCard);
