'use client';

import React from 'react';
import Image from 'next/image';
import { Stop } from '@/lib/types/route';
import { getMapUrl } from '@/lib/utils/maps';

export interface StopCardProps {
  stop: Stop;
  isLast?: boolean;
  totalStops?: number;
  isVisited?: boolean;
}

const CLOCK_ICON = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const CHAT_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CAMERA_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const WARNING_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

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

// Star rating row component
function StarRating({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.3;
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < full) return 'full';
    if (i === full && half) return 'half';
    return 'empty';
  });
  const formatted = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
  return (
    <div className="flex items-center gap-1 mt-0.5">
      <span className="text-xs font-bold text-[#C4572A]">{rating.toFixed(1)}</span>
      <span className="flex items-center gap-[1px]">
        {stars.map((type, i) => (
          <svg key={i} width="10" height="10" viewBox="0 0 24 24" aria-hidden="true">
            {type === 'full' && (
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill="#C4572A"
              />
            )}
            {type === 'half' && (
              <>
                <defs>
                  <linearGradient id={`star-grad-${i}`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="50%" stopColor="#C4572A" />
                    <stop offset="50%" stopColor="#E8D5C8" />
                  </linearGradient>
                </defs>
                <polygon
                  points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                  fill={`url(#star-grad-${i})`}
                />
              </>
            )}
            {type === 'empty' && (
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill="#E8D5C8"
              />
            )}
          </svg>
        ))}
      </span>
      <span className="text-[10px] text-[#9A7A68]">({formatted})</span>
    </div>
  );
}

function StopCard({ stop, totalStops, isVisited = false }: StopCardProps) {
  const googleMapsUrl = getMapUrl('google', stop.coordinates);
  const yandexMapsUrl = getMapUrl('yandex', stop.coordinates);

  const rating = stop.rating ?? 4.7;
  const ratingCount = stop.ratingCount ?? 1250;

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
            <svg className="w-3.5 h-3.5 text-[#F4B57A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {stop.neighborhood}
          </span>

          <span className="absolute top-3 right-3 backdrop-blur-md bg-black/50 bg-slate-900/80 text-xs text-[#FAF7F2] text-white px-3 py-1.5 rounded-full font-semibold z-20 flex items-center gap-1.5 border border-white/20 shadow-xs">
            <span style={{ color: '#F4B57A' }}>{CLOCK_ICON}</span>
            {stop.estimatedMinutes} min
          </span>
        </div>
      )}

      {/* ── Scrollable Card Content Body ── */}
      <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 pb-24 sm:pb-28 scrollbar-none max-w-2xl mx-auto w-full">
        {/* Header & Order Badge */}
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C4572A] mb-1">
              {totalStops ? `STOP ${stop.order} OF ${totalStops}` : `STOP ${stop.order}`}
            </p>
            <h2
              className="text-xl sm:text-2xl font-black text-[#1C1008] tracking-tight leading-snug break-words min-w-0"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              {isVisited && (
                <span
                  className="text-xs font-sans font-semibold uppercase tracking-widest mr-2 align-middle px-2 py-0.5 rounded-md bg-[#228255]/10"
                  style={{ color: '#228255' }}
                >
                  Visited
                </span>
              )}
              {stop.name}
            </h2>
          </div>
          {stop.bestTimeOfDay && (
            <span className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full border border-black/10 text-[#7A6552] bg-black/5">
              ⏱️ {stop.bestTimeOfDay}
            </span>
          )}
        </div>

        {/* Georgian Divider */}
        <GeorgianDivider />

        {/* Branded Navigation App Deep Link Buttons */}
        <div className="grid grid-cols-2 gap-3 my-2" data-testid="map-pills-row">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 py-3 px-3 rounded-2xl border transition-all active:scale-[0.97] min-h-[48px] bg-white border-[#E8EAF0] shadow-xs"

            aria-label="Open in Google Maps"
          >
            <div className="flex items-center gap-1.5">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" />
                <path d="M12 2C8.13 2 5 5.13 5 9c0 2 .8 3.8 2.1 5.1L12 2z" fill="#FBBC04" />
                <path d="M12 2v7l5.5-4.1A7 7 0 0 0 12 2z" fill="#34A853" />
                <circle cx="12" cy="9" r="2.8" fill="white" />
              </svg>
              <span className="text-[13px] font-semibold text-[#1C1008]">Google Maps</span>
            </div>
            <StarRating rating={rating} count={ratingCount} />
          </a>

          <a
            href={yandexMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 py-3 px-3 rounded-2xl border transition-all active:scale-[0.97] min-h-[48px] bg-white border-[#E8EAF0] shadow-xs"

            aria-label="Open in Yandex Maps"
          >
            <div className="flex items-center gap-1.5">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                <circle cx="12" cy="12" r="10" fill="#FC3F1D" />
                <path d="M13.4 7H11.6V13.5L8.5 7H6.7L10.4 15H9V17H13.4V15H12V9.2L15.3 17H17L13.4 7Z" fill="white" />
              </svg>
              <span className="text-[13px] font-semibold text-[#1C1008]">Yandex Maps</span>
            </div>
            <StarRating rating={rating} count={ratingCount} />
          </a>
        </div>

        {/* Olya's Tip Box */}
        <div
          className="rounded-2xl p-4 my-2 shadow-xs space-y-2"
          style={{
            background: '#FFF8F3',
            border: '1px solid rgba(196,87,42,0.18)',
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: '#C4572A' }}>{CHAT_ICON}</span>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#C4572A]">
              Olya&apos;s Tip
            </span>
          </div>
          <p
            className="text-sm italic leading-relaxed text-[#4A3828]"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            &ldquo;{stop.olyaTips}&rdquo;
          </p>
        </div>

        {/* Photo Spot Recommendation Callout */}
        {stop.photoSpot && (
          <div
            data-testid="photo-spot"
            className="rounded-2xl p-4 my-2 shadow-xs space-y-1.5"
            style={{
              background: '#FFF8F3',
              border: '1px solid rgba(196,87,42,0.15)',
            }}
          >
            <div className="flex items-center gap-2 text-[#C4572A] font-bold text-xs uppercase tracking-[0.16em]">
              <span style={{ color: '#C4572A' }}>{CAMERA_ICON}</span>
              <span>Photo Spot Recommendation</span>
            </div>
            <p className="text-xs sm:text-sm text-[#4A3828] leading-relaxed font-medium">
              {stop.photoSpot}
            </p>
          </div>
        )}

        {/* Logistics Warning Callout */}
        {stop.logisticsWarning && (
          <div
            data-testid="logistics-warning"
            className="rounded-2xl p-4 my-2 shadow-xs space-y-1.5"
            style={{
              background: '#FFF8F3',
              border: '1px solid rgba(196,87,42,0.3)',
            }}
          >
            <div className="flex items-center gap-2 text-[#C4572A] font-bold text-xs uppercase tracking-[0.16em]">
              <span style={{ color: '#C4572A' }}>{WARNING_ICON}</span>
              <span>Logistics Warning</span>
            </div>
            <p className="text-xs sm:text-sm text-[#4A3828] leading-relaxed font-medium">
              {stop.logisticsWarning}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(StopCard);
