'use client';

import React from 'react';
import Image from 'next/image';
import { Stop } from '@/lib/types/route';
import { getMapUrl } from '@/lib/utils/maps';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import EmojiIcon from '@/components/ui/EmojiIcon';
import GeorgianOrnament from '@/components/ui/GeorgianOrnament';
import Badge from '@/components/ui/Badge';
import Callout from '@/components/ui/Callout';

import { getStopRatings, fetchPlaceRatingsFromAPI, ResolvedRatings } from '@/lib/services/places';

export interface StopCardProps {
  stop: Stop;
  isLast?: boolean;
  totalStops?: number;
  isVisited?: boolean;
}

function StopCard({ stop: rawStop, totalStops, isVisited = false }: StopCardProps) {
  const { t, getLocalizedStop } = useLanguage();
  const stop = getLocalizedStop(rawStop);

  const googleMapsUrl = getMapUrl('google', stop.coordinates);
  const yandexMapsUrl = getMapUrl('yandex', stop.coordinates);

  const staticRatings = getStopRatings(stop);
  const [liveRatings, setLiveRatings] = React.useState<{ stopId: string; ratings: ResolvedRatings } | null>(null);

  const ratings = (liveRatings && liveRatings.stopId === stop.id) ? liveRatings.ratings : staticRatings;

  React.useEffect(() => {
    if (stop.placeIds?.google) {
      let isMounted = true;
      fetchPlaceRatingsFromAPI(stop).then((fetchedRatings) => {
        if (isMounted) {
          setLiveRatings({ stopId: stop.id, ratings: fetchedRatings });
        }
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
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C4572A]">
              {stopLabel}
            </p>
            <h2
              className="text-2xl sm:text-3xl font-black text-[#1C1008] tracking-tight leading-tight break-words min-w-0 max-w-full"
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
        <GeorgianOrnament />

        {/* Standalone Google Rating Badge */}
        <div
          data-testid="google-rating-badge"
          className="flex items-center justify-center gap-1.5 text-xs text-[#5C4D42] font-medium"
        >
          <span className="text-[#C4572A] font-bold text-sm">★ {ratings.google.rating.toFixed(1)}</span>
          <span> ({ratings.google.count.toLocaleString()} reviews on Google)</span>
        </div>

        {/* Branded Map Provider Deep Link Buttons */}
        <div className="grid grid-cols-2 gap-3" data-testid="map-pills-row">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border transition-all active:scale-[0.97] min-h-[48px] bg-white border-[#E8EAF0] shadow-xs hover:border-[#C4572A]/30 text-sm font-semibold text-[#1C1008]"
            aria-label="Open in Google Maps"
          >
            <EmojiIcon name="googleMaps" size="md" />
            <span>Google Maps</span>
          </a>

          <a
            href={yandexMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border transition-all active:scale-[0.97] min-h-[48px] bg-white border-[#E8EAF0] shadow-xs hover:border-[#C4572A]/30 text-sm font-semibold text-[#1C1008]"
            aria-label="Open in Yandex Maps"
          >
            <EmojiIcon name="yandexMaps" size="md" />
            <span>Yandex Maps</span>
          </a>
        </div>

        {/* Olya's Tip Box */}
        <Callout emoji="chat" title={t('olyaTip')}>
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
            <Callout emoji="camera" title={t('photoSpotRec')}>
              {stop.photoSpot}
            </Callout>
          </div>
        )}

        {/* Logistics Warning Callout */}
        {stop.logisticsWarning && (
          <div data-testid="logistics-warning">
            <Callout emoji="warning" title={t('logisticsWarning')} variant="warning">
              {stop.logisticsWarning}
            </Callout>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(StopCard);
