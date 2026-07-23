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
  const approxKm = (sortedStops.length * 0.35 + totalMinutes * 0.02).toFixed(1);

  const hasCableCar = sortedStops.some(
    (s) => s.name.toLowerCase().includes('cable car') || s.olyaTips.toLowerCase().includes('cable car')
  );
  const hasFunicular = sortedStops.some(
    (s) => s.name.toLowerCase().includes('funicular') || s.olyaTips.toLowerCase().includes('funicular')
  );
  const transitModes = [
    hasCableCar ? 'Cable Car' : null,
    hasFunicular ? 'Funicular' : null,
  ].filter(Boolean);
  const transitModeStr = transitModes.length > 0 ? transitModes.join(' + ') : 'Pedestrian Walkway';

  return (
    <div className="relative flex flex-col min-h-screen w-full bg-[var(--twa-bg-color,#fafaf7)] text-[var(--twa-text-color,#1f2421)] overflow-y-auto touch-pan-x touch-pan-y pb-36 sm:pb-40">
      {/* Clean Hero Cover Image Header (no text overlays) */}
      <div className="relative w-full h-64 sm:h-72 bg-[var(--tbilisi-slate,#1f2421)] overflow-hidden">
        {route.heroImage && (
          <Image
            src={route.heroImage}
            alt={route.title}
            fill
            priority
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Main Content Body */}
      <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto w-full flex-1">
        {/* 1. Pill Badges Row */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold" data-testid="pill-badges-row">
          <span className="bg-[var(--terracotta,#e07a5f)] text-white px-3 py-1 rounded-full uppercase tracking-wide shadow-xs">
            {route.durationCategory}
          </span>
          <span className="bg-stone-200 text-stone-800 px-3 py-1 rounded-full uppercase tracking-wide border border-[var(--neutral-border,#e5e5e0)]">
            {route.accessibility.replace('-', ' ')}
          </span>
          {route.vibes.map((vibe) => (
            <span
              key={vibe}
              className="bg-stone-200 text-stone-800 px-3 py-1 rounded-full capitalize border border-[var(--neutral-border,#e5e5e0)]"
            >
              #{vibe}
            </span>
          ))}
        </div>

        {/* 2. Title & Subtitle Block */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-[var(--twa-text-color,#1f2421)]">
            {route.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-medium">
            {route.subtitle}
          </p>
        </div>

        {/* 3. Olya's Welcome Quote Card with subtle 1px border */}
        {route.introCopy && (
          <div
            data-testid="olya-welcome-card"
            className="bg-white rounded-2xl p-4 sm:p-5 border border-[var(--neutral-border,#e5e5e0)] shadow-xs relative"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--terracotta,#e07a5f)] mb-1">
                  Olya&apos;s Route Welcome
                </h3>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed italic">
                  &quot;{route.introCopy}&quot;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Route At A Glance Summary Line */}
        <div
          data-testid="route-at-a-glance"
          className="bg-white rounded-2xl p-5 border border-[var(--neutral-border,#e5e5e0)] shadow-xs space-y-3"
        >
          <h2 className="text-xs font-bold text-[var(--tbilisi-slate,#1f2421)] uppercase tracking-wider border-b border-[var(--neutral-border,#e5e5e0)] pb-2">
            ── ROUTE AT A GLANCE ──
          </h2>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-medium text-stone-700">
            <div className="flex items-center gap-2">
              <span className="text-base">📍</span>
              <span>
                <strong className="text-stone-900">{sortedStops.length}</strong> Curated Stops
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">👟</span>
              <span>
                ~<strong className="text-stone-900">{approxKm} km</strong> ({formattedTime})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">🚠</span>
              <span>
                <strong className="text-stone-900">{transitModeStr}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 5. Swipe Prompt */}
        <div className="text-center pt-2 pb-4">
          <p className="text-xs sm:text-sm font-semibold text-[var(--terracotta,#e07a5f)] animate-pulse">
            👉 Swipe left or tap below to begin!
          </p>
        </div>
      </div>

      {/* 6. Sticky Bottom CTA Button */}
      {showStartButton && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--twa-bg-color,#fafaf7)] via-[var(--twa-bg-color,#fafaf7)]/90 to-transparent z-30 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={onStartRoute}
            className="w-full bg-[var(--terracotta,#e07a5f)] hover:bg-orange-700 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-base tracking-wide transition-all cursor-pointer"
          >
            <span>START ROUTE</span>
            <span className="text-lg">➔</span>
          </button>
        </div>
      )}
    </div>
  );
}

