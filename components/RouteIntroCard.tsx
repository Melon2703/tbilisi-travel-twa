import React from 'react';
import Image from 'next/image';
import { Route } from '@/lib/types/route';

export interface RouteIntroCardProps {
  route: Route;
  onStartRoute?: () => void;
  showStartButton?: boolean;
}

export default function RouteIntroCard({ route, onStartRoute, showStartButton = true }: RouteIntroCardProps) {
  const sortedStops = [...route.stops].sort((a, b) => a.order - b.order);
  const totalMinutes = sortedStops.reduce((acc, stop) => acc + stop.estimatedMinutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const formattedTime = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;

  return (
    <div className="relative flex flex-col justify-between min-h-screen w-full bg-[var(--twa-bg-color,#f7f4ef)] text-[var(--twa-text-color,#1f2421)] overflow-y-auto touch-pan-x pan-y pb-36 sm:pb-40">
      {/* Hero Cover Image Header */}
      <div className="relative w-full h-72 sm:h-80 bg-[var(--tbilisi-slate)] overflow-hidden shadow-lg">
        {route.heroImage && (
          <Image
            src={route.heroImage}
            alt={route.title}
            fill
            priority
            className="w-full h-full object-cover filter brightness-90"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--tbilisi-slate)] via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="bg-[var(--terracotta)] text-white px-3 py-1 rounded-full uppercase tracking-wide shadow-xs">
            {route.durationCategory}
          </span>
          <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full uppercase tracking-wide shadow-xs">
            {route.accessibility}
          </span>
          {route.vibes.map((vibe) => (
            <span
              key={vibe}
              className="bg-black/40 backdrop-blur-md text-white/90 px-3 py-1 rounded-full capitalize"
            >
              #{vibe}
            </span>
          ))}
        </div>

        {/* Hero Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-10 text-white space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight drop-shadow-md">
            {route.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-200 font-medium drop-shadow-xs">
            {route.subtitle}
          </p>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto w-full flex-1">
        {/* Intro Copy / Olya's Welcome Quote */}
        {route.introCopy && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-stone-200/80 relative">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--terracotta)] mb-1">
                  Olya&apos;s Route Welcome
                </h3>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed italic">
                  &quot;{route.introCopy}&quot;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Route At A Glance Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-stone-200/80 space-y-4">
          <h2 className="text-xs font-bold text-[var(--tbilisi-slate)] uppercase tracking-wider border-b border-stone-100 pb-2">
            ── ROUTE AT A GLANCE ──
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 font-medium text-stone-700">
              <span className="text-base">📍</span>
              <span>
                <strong className="text-stone-900">{sortedStops.length}</strong> Curated Stops
              </span>
            </div>
            <div className="flex items-center gap-2.5 font-medium text-stone-700">
              <span className="text-base">⏱️</span>
              <span>
                ~<strong className="text-stone-900">{formattedTime}</strong> Total Walking
              </span>
            </div>
            <div className="flex items-center gap-2.5 font-medium text-stone-700">
              <span className="text-base">👟</span>
              <span className="capitalize">
                <strong className="text-stone-900">{route.accessibility.replace('-', ' ')}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5 font-medium text-stone-700">
              <span className="text-base">🏛️</span>
              <span>
                <strong className="text-stone-900">Old Tbilisi</strong> Core
              </span>
            </div>
          </div>
        </div>

        {/* Swipe Prompt */}
        <div className="text-center pt-2 pb-4">
          <p className="text-xs sm:text-sm font-semibold text-[var(--terracotta)] animate-pulse">
            👉 Swipe left or tap below to begin!
          </p>
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      {showStartButton && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--twa-bg-color,#f7f4ef)] via-[var(--twa-bg-color,#f7f4ef)]/90 to-transparent z-30 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={onStartRoute}
            className="w-full bg-[var(--terracotta)] hover:bg-orange-700 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-base tracking-wide transition-all cursor-pointer"
          >
            <span>START ROUTE</span>
            <span className="text-lg">➔</span>
          </button>
        </div>
      )}
    </div>
  );
}
