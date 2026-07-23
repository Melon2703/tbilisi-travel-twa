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
      className="w-full h-[100dvh] overflow-hidden flex flex-col justify-between bg-[#161412] touch-pan-x touch-pan-y overscroll-y-contain p-2 sm:p-4"
    >
      <div className="bg-[#1C1A17] rounded-2xl border border-[#3A342D] overflow-hidden flex flex-col h-full max-w-2xl mx-auto shadow-2xl w-full">
        {/* Header & Media Section (Top) */}
        {stop.imageUrl && (
          <div className="relative h-52 sm:h-60 w-full shrink-0 bg-[#161412] overflow-hidden">
            <Image
              src={stop.imageUrl}
              alt={stop.name}
              fill
              sizes="(max-width: 640px) 100vw, 640px"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A17] via-black/20 to-transparent z-10" />

            {/* District & Duration Floating Frosted-Glass Pills */}
            <span className="absolute top-3 left-3 backdrop-blur-md bg-black/50 bg-slate-900/80 text-xs text-[#F4F1EA] text-white px-3 py-1.5 rounded-full font-medium z-20 flex items-center gap-1.5 border border-white/15 shadow-sm">
              <svg className="w-3.5 h-3.5 text-[#D96B43]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {stop.neighborhood}
            </span>

            <span className="absolute top-3 right-3 backdrop-blur-md bg-black/50 bg-slate-900/80 text-xs text-[#F4F1EA] text-white px-3 py-1.5 rounded-full font-medium z-20 flex items-center gap-1.5 border border-white/15 shadow-sm">
              <svg className="w-3.5 h-3.5 text-[#D96B43]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 9 0 0118 0z" />
              </svg>
              {stop.estimatedMinutes} min
            </span>
          </div>
        )}

        {/* Scrollable Card Body (Middle & Lower Section) */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 pb-24 sm:pb-28 scrollbar-none">
          {/* Header info & Order badge */}
          <div className="flex items-start justify-between gap-3 min-w-0">
            <div className="min-w-0 flex-1">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#D96B43] mb-1">
                {totalStops ? `STOP ${stop.order} OF ${totalStops}` : `STOP ${stop.order}`}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#F4F1EA] tracking-wide mt-1 mb-1 leading-snug break-words min-w-0">
                {stop.name}
              </h3>
            </div>
            {stop.bestTimeOfDay && (
              <span className="shrink-0 text-xs font-medium bg-[#23201C] text-[#A69F95] px-3 py-1.5 rounded-full border border-white/10 shadow-xs">
                ⏱️ {stop.bestTimeOfDay}
              </span>
            )}
          </div>

          {/* Dual Map Deep Link Pills */}
          <div className="grid grid-cols-2 gap-3 my-3" data-testid="map-pills-row">
            {MAP_PILLS.map((provider) => (
              <a
                key={provider.id}
                href={getMapUrl(provider.id, stop.coordinates)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] py-2.5 px-4 rounded-xl border border-[#3A342D] bg-[#23201C] hover:bg-[#2E2A24] active:scale-[0.98] text-xs sm:text-sm font-semibold text-[#F4F1EA] transition-all shadow-xs"
              >
                <span className="text-base">{provider.id === 'google' ? '🗺️' : '📍'}</span>
                <span>{provider.label}</span>
              </a>
            ))}
          </div>

          {/* Olya's Tip Box */}
          <div className="bg-[#23201C] rounded-2xl p-4 my-3 border border-[#3A342D] space-y-2 shadow-xs">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#D96B43] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs font-bold text-[#D96B43] uppercase tracking-wider">
                Olya&apos;s Tip
              </span>
            </div>
            <p className="text-[#F4F1EA] text-sm leading-relaxed italic">
              &ldquo;{stop.olyaTips}&rdquo;
            </p>
          </div>

          {/* Photo Spot Recommendation Callout */}
          {stop.photoSpot && (
            <div
              data-testid="photo-spot"
              className="bg-[#23201C] rounded-2xl p-4 my-3 border border-[#3A342D] space-y-1.5 shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-[#D96B43] font-bold text-xs uppercase tracking-wider">
                <svg className="w-4 h-4 text-[#D96B43] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h0.93a2 2 0 001.664-.89l0.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l0.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Photo Spot Recommendation</span>
              </div>
              <p className="text-xs sm:text-sm text-[#F4F1EA] leading-relaxed font-medium">
                {stop.photoSpot}
              </p>
            </div>
          )}

          {/* Logistics Warning Callout */}
          {stop.logisticsWarning && (
            <div
              data-testid="logistics-warning"
              className="bg-[#2D221C] rounded-2xl p-4 my-3 border border-[#D96B43]/30 space-y-1.5 shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-[#D96B43] font-bold text-xs uppercase tracking-wider">
                <svg className="w-4 h-4 text-[#D96B43] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Logistics Warning</span>
              </div>
              <p className="text-xs sm:text-sm text-[#F4F1EA] leading-relaxed font-medium">
                {stop.logisticsWarning}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
