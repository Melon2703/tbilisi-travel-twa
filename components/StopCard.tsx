'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Stop } from '@/lib/types/route';
import MapProviderSheet from '@/components/MapProviderSheet';

interface StopCardProps {
  stop: Stop;
  isLast?: boolean;
}

export default function StopCard({ stop, isLast = false }: StopCardProps) {
  const [isMapSheetOpen, setIsMapSheetOpen] = useState(false);

  return (
    <>
      <div className="relative flex gap-4 sm:gap-6 group">
        {/* Timeline spine and node indicator */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--terracotta)] text-white text-xs sm:text-sm font-bold shadow-sm shrink-0 z-10">
            {stop.order}
          </div>
          {!isLast && (
            <div className="w-0.5 grow bg-gradient-to-b from-[var(--terracotta)] to-transparent opacity-40 my-2" />
          )}
        </div>

        {/* Stop Card Content */}
        <div className="grow pb-8">
          <div className="bg-[var(--twa-secondary-bg-color,#ffffff)] rounded-2xl shadow-sm border border-[var(--warm-stone)] overflow-hidden hover:shadow-md transition-all duration-200">
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
              {/* Header info & Order badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--terracotta)] mb-1">
                    Stop {stop.order}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--tbilisi-slate)] leading-snug">
                    {stop.name}
                  </h3>
                </div>
                {stop.bestTimeOfDay && (
                  <span className="shrink-0 text-[11px] font-medium bg-[var(--warm-stone)] text-[var(--tbilisi-slate)] px-2.5 py-1 rounded-full border border-[var(--golden-amber)]">
                    {stop.bestTimeOfDay}
                  </span>
                )}
              </div>

              {/* Olya's Tips Callout */}
              <div className="bg-[var(--warm-stone)] rounded-xl p-3.5 sm:p-4 border-l-4 border-[var(--terracotta)] space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[var(--terracotta)] text-white text-[10px] font-bold flex items-center justify-center">
                    O
                  </div>
                  <span className="text-xs font-bold text-[var(--terracotta)] uppercase tracking-wider">
                    Olya&apos;s Tip
                  </span>
                </div>
                <p className="text-sm text-[var(--tbilisi-slate)] leading-relaxed italic">
                  &ldquo;{stop.olyaTips}&rdquo;
                </p>
              </div>

              {/* Logistics Warning Callout */}
              {stop.logisticsWarning && (
                <div
                  data-testid="logistics-warning"
                  className="bg-amber-50 rounded-xl p-3.5 sm:p-4 border border-amber-200 space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs uppercase tracking-wider">
                    <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Logistics Warning</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-900 leading-normal font-medium">
                    {stop.logisticsWarning}
                  </p>
                </div>
              )}

              {/* Navigation Action */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsMapSheetOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--terracotta)] text-white hover:opacity-90 active:scale-[0.98] transition-all font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>Open in Maps</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MapProviderSheet
        isOpen={isMapSheetOpen}
        onClose={() => setIsMapSheetOpen(false)}
        stopName={stop.name}
        coordinates={stop.coordinates}
      />
    </>
  );
}
