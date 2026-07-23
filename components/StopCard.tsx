'use client';

import React from 'react';
import Image from 'next/image';
import { Stop } from '@/lib/types/route';
import { getMapUrl } from '@/lib/utils/maps';

export interface StopCardProps {
  stop: Stop;
  isLast?: boolean;
  totalStops?: number;
}

const MAP_PILLS = [
  { id: 'google' as const, label: 'Google Maps' },
  { id: 'yandex' as const, label: 'Yandex Maps' },
];

export default function StopCard({ stop, totalStops }: StopCardProps) {
  return (
    <div
      data-testid="stop-card-container"
      className="w-full touch-pan-x touch-pan-y overscroll-y-contain"
    >
      <div className="bg-white rounded-2xl shadow-xs border border-[var(--neutral-border)] overflow-hidden hover:shadow-md transition-all duration-200">
        {/* Hero Image */}
        {stop.imageUrl && (
          <div className="relative h-48 sm:h-56 w-full bg-slate-100 overflow-hidden">
            <Image
              src={stop.imageUrl}
              alt={stop.name}
              fill
              sizes="(max-width: 640px) 100vw, 640px"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium z-20">
              <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {stop.neighborhood}
              </span>
              <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 9 0 0118 0z" />
                </svg>
                {stop.estimatedMinutes} min
              </span>
            </div>
          </div>
        )}

        {/* Card Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Dual Map Deep Link Pills (Directly Under Head Photo) */}
          <div className="flex items-center gap-2" data-testid="map-pills-row">
            {MAP_PILLS.map((provider) => (
              <a
                key={provider.id}
                href={getMapUrl(provider.id, stop.coordinates)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[48px] min-w-[48px] py-3 px-4 rounded-xl border border-[var(--neutral-border)] bg-[var(--warm-stone)] hover:bg-slate-100 text-xs font-semibold text-[var(--tbilisi-slate)] transition-colors shadow-2xs"
              >
                <span>📍</span>
                <span>{provider.label}</span>
              </a>
            ))}
          </div>

          {/* Header info & Order badge */}
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[var(--terracotta)] mb-1">
                {totalStops ? `STOP ${stop.order} OF ${totalStops}` : `STOP ${stop.order}`}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--tbilisi-slate)] leading-snug break-words min-w-0">
                {stop.name}
              </h3>
            </div>
            {stop.bestTimeOfDay && (
              <span className="shrink-0 text-[11px] font-medium bg-[var(--warm-stone)] text-[var(--tbilisi-slate)] px-2.5 py-1 rounded-full border border-[var(--neutral-border)]">
                ⏱️ {stop.bestTimeOfDay}
              </span>
            )}
          </div>

          {/* Olya's Tips Callout */}
          <div className="bg-[var(--warm-stone)] rounded-xl p-3.5 sm:p-4 border border-[var(--neutral-border)] space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--terracotta)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs font-bold text-[var(--terracotta)] uppercase tracking-wider">
                Olya&apos;s Tip
              </span>
            </div>
            <p className="text-sm text-[var(--tbilisi-slate)] leading-relaxed italic">
              &ldquo;{stop.olyaTips}&rdquo;
            </p>
          </div>

          {/* Photo Spot Recommendation Callout */}
          {stop.photoSpot && (
            <div
              data-testid="photo-spot"
              className="bg-[var(--warm-stone)] rounded-xl p-3.5 sm:p-4 border border-[var(--neutral-border)] space-y-1 shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-[var(--tbilisi-slate)] font-semibold text-xs uppercase tracking-wider">
                <svg className="w-4 h-4 text-[var(--terracotta)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h0.93a2 2 0 001.664-.89l0.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l0.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Photo Spot Recommendation</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--tbilisi-slate)] leading-normal font-medium opacity-90">
                {stop.photoSpot}
              </p>
            </div>
          )}

          {/* Logistics Warning Callout */}
          {stop.logisticsWarning && (
            <div
              data-testid="logistics-warning"
              className="bg-[var(--warm-stone)] rounded-xl p-3.5 sm:p-4 border border-[var(--neutral-border)] space-y-1 shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-[var(--tbilisi-slate)] font-semibold text-xs uppercase tracking-wider">
                <svg className="w-4 h-4 text-[var(--terracotta)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Logistics Warning</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--tbilisi-slate)] leading-normal font-medium opacity-90">
                {stop.logisticsWarning}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
