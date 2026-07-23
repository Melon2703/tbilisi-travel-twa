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
    <div className="relative flex flex-col h-[100dvh] w-full bg-[#161412] text-[#F4F1EA] overflow-hidden justify-between touch-pan-x touch-pan-y">
      {/* Clean Hero Cover Image Header with Smooth Fade */}
      <div className="relative w-full h-44 sm:h-52 shrink-0 bg-[#161412] overflow-hidden">
        {route.heroImage && (
          <Image
            src={route.heroImage}
            alt={route.title}
            fill
            priority
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161412] via-[#161412]/30 to-transparent z-10" />
      </div>

      {/* Main Content Body - Balanced Fit */}
      <div className="p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full flex-1 flex flex-col justify-between overflow-y-auto pb-24 sm:pb-28">
        {/* 1. Pill Badges Row */}
        <div className="relative w-full overflow-hidden shrink-0">
          <div
            data-testid="pill-badges-row"
            className="flex items-center gap-2 overflow-x-auto py-1 pl-0.5 pr-8 text-xs font-semibold scrollbar-none scroll-smooth whitespace-nowrap flex-nowrap touch-pan-x no-scrollbar"
          >
            <span className="shrink-0 bg-[#D96B43] text-white px-3 py-1 rounded-full uppercase tracking-wide shadow-xs">
              {route.durationCategory}
            </span>
            <span className="shrink-0 bg-[#23201C] text-[#A69F95] px-3 py-1 rounded-full uppercase tracking-wide border border-[#3A342D]">
              {route.accessibility.replace('-', ' ')}
            </span>
            {route.vibes.map((vibe) => (
              <span
                key={vibe}
                className="shrink-0 bg-[#23201C] text-[#A69F95] px-3 py-1 rounded-full capitalize border border-[#3A342D]"
              >
                #{vibe}
              </span>
            ))}
          </div>
          <div
            data-testid="pill-badges-scroll-indicator"
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#161412] to-transparent z-10"
          />
        </div>

        {/* 2. Title & Subtitle Block */}
        <div className="space-y-1 min-w-0 max-w-full shrink-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-[#F4F1EA] break-words min-w-0 max-w-full">
            {route.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#A69F95] font-medium break-words min-w-0 leading-relaxed">
            {route.subtitle}
          </p>
        </div>

        {/* 3. Olya's Welcome Quote Card */}
        {route.introCopy && (
          <div
            data-testid="olya-welcome-card"
            className="bg-[#1C1A17] rounded-2xl p-4 border border-[#3A342D] shadow-sm relative shrink-0 space-y-1.5"
          >
            <div className="flex items-start gap-2.5">
              <span className="text-xl shrink-0">💬</span>
              <div className="min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#D96B43] mb-1">
                  Olya&apos;s Route Welcome
                </h3>
                <p className="text-xs sm:text-sm text-[#F4F1EA] leading-relaxed italic">
                  &quot;{route.introCopy}&quot;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Route At A Glance Summary Line */}
        <div
          data-testid="route-at-a-glance"
          className="bg-[#1C1A17] rounded-2xl p-4 border border-[#3A342D] shadow-sm space-y-3 shrink-0"
        >
          <div className="flex items-center gap-3">
            <span className="h-px bg-[#3A342D] flex-1" />
            <h2 className="text-xs font-bold text-[#D96B43] uppercase tracking-wider">
              Route at a Glance
            </h2>
            <span className="h-px bg-[#3A342D] flex-1" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-[#A69F95]">
            <div className="flex items-center gap-2">
              <span className="text-base">📍</span>
              <span>
                <strong className="text-[#F4F1EA]">{sortedStops.length}</strong> Curated Stops
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">👟</span>
              <span>
                ~<strong className="text-[#F4F1EA]">{approxKm} km</strong> ({formattedTime})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">🚠</span>
              <span>
                <strong className="text-[#F4F1EA]">{transitModeStr}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 5. Swipe Prompt */}
        <div className="text-center py-1 shrink-0" data-testid="swipe-prompt-container">
          <p className="text-xs font-semibold text-[#D96B43] animate-pulse">
            👉 Swipe left or tap below to begin!
          </p>
        </div>
      </div>

      {/* 6. Sticky Bottom CTA Button */}
      {showStartButton && (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-30 pointer-events-auto">
          <button
            type="button"
            onClick={onStartRoute}
            className="w-full bg-[#D96B43] hover:bg-[#C05A34] active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-full shadow-2xl flex items-center justify-center gap-2 text-base tracking-wide transition-all cursor-pointer min-h-[48px] min-w-[48px]"
          >
            <span>START ROUTE</span>
            <span className="text-lg">➔</span>
          </button>
        </div>
      )}
    </div>
  );
}

