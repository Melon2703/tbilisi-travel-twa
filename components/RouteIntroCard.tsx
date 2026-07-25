import React from 'react';
import Image from 'next/image';
import { Route } from '@/lib/types/route';

export interface RouteIntroCardProps {
  route: Route;
  onStartRoute?: () => void;
  showStartButton?: boolean;
}

// Georgian-inspired vine/knot ornament divider
const GeorgianOrnament = () => (
  <svg
    viewBox="0 0 240 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full max-w-[240px] mx-auto"
    aria-hidden="true"
  >
    <line x1="0" y1="10" x2="90" y2="10" stroke="#C4572A" strokeWidth="1" strokeOpacity="0.3" />
    <circle cx="95" cy="10" r="2" fill="#C4572A" fillOpacity="0.5" />
    <path
      d="M105 10 C108 5, 112 5, 115 10 C118 15, 122 15, 125 10 C128 5, 132 5, 135 10"
      stroke="#C4572A"
      strokeWidth="1.5"
      strokeOpacity="0.7"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="145" cy="10" r="2" fill="#C4572A" fillOpacity="0.5" />
    <line x1="150" y1="10" x2="240" y2="10" stroke="#C4572A" strokeWidth="1" strokeOpacity="0.3" />
    <rect x="117" y="7" width="6" height="6" fill="#C4572A" fillOpacity="0.6" transform="rotate(45 120 10)" />
  </svg>
);

const MAP_PIN_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const FOOTPRINTS_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3-2 4-2 6.5v2" />
    <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3 2 4 2 6.5v2" />
  </svg>
);

const ARROW_RIGHT_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const FUNICULAR_ICON = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="5" y="8" width="14" height="10" rx="2" />
    <path d="M3 6l18-2" />
    <circle cx="9" cy="18" r="2" />
    <circle cx="15" cy="18" r="2" />
    <line x1="12" y1="8" x2="12" y2="18" />
  </svg>
);

export default function RouteIntroCard({
  route,
  onStartRoute,
  showStartButton = true,
}: RouteIntroCardProps) {
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
    <div className="relative flex flex-col h-[100dvh] w-full bg-[#FAF7F2] text-[#1C1008] overflow-hidden justify-between touch-pan-x touch-pan-y">
      {/* ── Full-bleed hero image — fixed height ── */}
      <div className="relative w-full h-44 sm:h-52 shrink-0 bg-[#FAF7F2] overflow-hidden">
        {route.heroImage && (
          <Image
            src={route.heroImage}
            alt={route.title}
            fill
            priority
            className="w-full h-full object-cover"
          />
        )}
        {/* Soft bottom fade into cream */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 50%, rgba(250,247,242,0.6) 85%, rgba(250,247,242,1) 100%)',
          }}
        />
      </div>

      {/* ── Scrollable content body ── */}
      <div className="p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full flex-1 flex flex-col justify-between overflow-y-auto pb-24 sm:pb-28 scrollbar-none">
        {/* 1. Pill Badges Row */}
        <div className="relative w-full overflow-hidden shrink-0">
          <div
            data-testid="pill-badges-row"
            className="flex items-center gap-2 overflow-x-auto py-1 pl-0.5 pr-8 text-xs font-semibold scrollbar-none scroll-smooth whitespace-nowrap flex-nowrap touch-pan-x no-scrollbar"
          >
            <span
              className="shrink-0 text-white px-3 py-1 rounded-full uppercase tracking-wide shadow-xs text-xs font-bold"
              style={{ background: '#C4572A' }}
            >
              {route.durationCategory}
            </span>
            <span
              className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide border border-black/10"
              style={{ background: 'rgba(28,16,8,0.08)', color: '#1C1008' }}
            >
              {route.accessibility.replace('-', ' ')}
            </span>
            {route.vibes.map((vibe) => (
              <span
                key={vibe}
                className="shrink-0 text-xs font-medium px-3 py-1 rounded-full border border-black/10 capitalize"
                style={{ background: 'rgba(28,16,8,0.05)', color: '#7A6552' }}
              >
                #{vibe}
              </span>
            ))}
          </div>
          <div
            data-testid="pill-badges-scroll-indicator"
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#FAF7F2] to-transparent z-10"
          />
        </div>

        {/* 2. Title & Subtitle Block */}
        <div className="space-y-1 min-w-0 max-w-full shrink-0">
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-[#1C1008] break-words min-w-0 max-w-full"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            {route.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6552] font-medium break-words min-w-0 leading-relaxed">
            {route.subtitle}
          </p>
        </div>

        {/* Georgian ornament divider */}
        <div className="py-0.5 shrink-0">
          <GeorgianOrnament />
        </div>

        {/* 3. Olya's Welcome Quote Card */}
        {route.introCopy && (
          <div
            data-testid="olya-welcome-card"
            className="rounded-2xl p-4 shadow-xs relative shrink-0 space-y-1.5"
            style={{
              background: '#FFF8F3',
              border: '1px solid rgba(196,87,42,0.18)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: '#C4572A' }}
                aria-hidden="true"
              >
                O
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  className="text-xs font-bold uppercase tracking-wider text-[#C4572A] mb-1"
                >
                  Olya&apos;s Route Welcome
                </h3>
                <p
                  className="text-xs sm:text-sm text-[#4A3828] leading-relaxed italic"
                  style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                >
                  &ldquo;{route.introCopy}&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Route At A Glance Summary Box */}
        <div
          data-testid="route-at-a-glance"
          className="rounded-2xl p-4 shadow-xs space-y-3 shrink-0"
          style={{
            background: '#FFF8F3',
            border: '1px solid rgba(196,87,42,0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="h-px bg-[#C4572A]/20 flex-1" />
            <h2 className="text-xs font-bold text-[#C4572A] uppercase tracking-wider">
              Route at a Glance
            </h2>
            <span className="h-px bg-[#C4572A]/20 flex-1" />
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-3 text-xs font-medium text-[#7A6552]">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[#C4572A]"
                style={{ background: 'rgba(196,87,42,0.1)' }}
              >
                {MAP_PIN_ICON}
              </div>
              <div>
                <p className="text-sm font-bold leading-none text-[#1C1008]">
                  {sortedStops.length} Curated Stops
                </p>
                <p className="text-[11px] mt-0.5 text-[#A0876E]">Curated</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[#7A6552]"
                style={{ background: 'rgba(28,16,8,0.06)' }}
              >
                {FOOTPRINTS_ICON}
              </div>
              <div>
                <p className="text-sm font-bold leading-none text-[#1C1008]">~{approxKm} km</p>
                <p className="text-[11px] mt-0.5 text-[#A0876E]">{formattedTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[#7A6552]"
                style={{ background: 'rgba(28,16,8,0.06)' }}
              >
                {FUNICULAR_ICON}
              </div>
              <div>
                <p className="text-sm font-bold leading-none text-[#1C1008]">{transitModeStr}</p>
                <p className="text-[11px] mt-0.5 text-[#A0876E]">Transit included</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Swipe Prompt */}
        <div className="text-center py-1 shrink-0" data-testid="swipe-prompt-container">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#C4572A]/80">
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
            className="w-full text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-sm uppercase tracking-[0.18em] transition-all active:scale-[0.98] cursor-pointer min-h-[48px]"
            style={{
              background: '#C4572A',
              boxShadow: '0 6px 24px rgba(196,87,42,0.35)',
            }}
          >
            <span>START ROUTE</span>
            {ARROW_RIGHT_ICON}
          </button>

        </div>
      )}
    </div>
  );
}
