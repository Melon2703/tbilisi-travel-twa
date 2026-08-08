'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Route } from '@/lib/types/route';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import RouteSequenceConnector from '@/components/RouteSequenceConnector';
import EmojiIcon from '@/components/ui/EmojiIcon';
import { buildTileGrid, frameStops, projectCoordinates } from '@/lib/utils/mapFraming';

export interface RouteOverviewMapProps {
  route: Route;
  onSelectStop?: (stopOrder: number) => void;
  onOpenModal?: () => void;
}

/** Room kept clear for the pin and its shadow. */
const PREVIEW_PADDING = 48;

export default function RouteOverviewMap({
  route,
  onSelectStop,
  onOpenModal,
}: RouteOverviewMapProps) {
  const { language, t } = useLanguage();
  const sortedStops = useMemo(
    () => [...route.stops].sort((a, b) => a.order - b.order),
    [route.stops]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({
    width: 600,
    height: 250,
  });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setViewportSize({
          width: containerRef.current.clientWidth || 600,
          height: containerRef.current.clientHeight || 250,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Framing that puts the whole Route on canvas, longest Route included
  const framing = useMemo(
    () =>
      frameStops(
        sortedStops.map((s) => s.coordinates),
        viewportSize,
        { padding: PREVIEW_PADDING }
      ),
    [sortedStops, viewportSize]
  );

  // Screen Projected Stops
  const projectedStops = useMemo(
    () =>
      sortedStops.map((stop) => {
        const { x, y } = projectCoordinates(stop.coordinates, framing, viewportSize);
        return { stop, screenX: x, screenY: y };
      }),
    [sortedStops, framing, viewportSize]
  );

  const connectorPoints = useMemo(
    () => projectedStops.map(({ screenX, screenY }) => ({ x: screenX, y: screenY })),
    [projectedStops]
  );

  // CartoDB Voyager Tile Grid
  const tiles = useMemo(() => buildTileGrid(framing, viewportSize), [framing, viewportSize]);

  const handleContainerClick = () => {
    if (onOpenModal) {
      onOpenModal();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleContainerClick();
    }
  };

  return (
    <div
      data-testid="route-overview-map"
      className="rounded-2xl p-4 shadow-sm space-y-3 shrink-0 bg-[#FFF8F3] border border-[#C4572A]/20 transition-all overflow-hidden"
    >
      {/* ── Header Bar ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <EmojiIcon name="map" size="sm" />
          <h3 className="text-xs font-bold text-[#C4572A]">
            {t('overviewMapTitle')}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#7A6552]">
            {t('stopsCount', { count: sortedStops.length })}
          </span>
        </div>
      </div>

      {/* ── Visual Map Canvas Container (Tap to Expand) ── */}
      <div
        ref={containerRef}
        data-testid="map-tile-container"
        role={onOpenModal ? 'button' : undefined}
        tabIndex={onOpenModal ? 0 : undefined}
        onClick={handleContainerClick}
        onKeyDown={handleKeyDown}
        className="relative w-full h-60 sm:h-72 bg-[#EAE5D9] rounded-xl border border-black/10 overflow-hidden shadow-inner flex flex-col justify-between select-none cursor-pointer group active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C4572A]/50"
      >
        {/* Seamless Sub-Pixel Mercator Tile Backdrop */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {tiles.map(({ key, url, left, top }) => (
            <div
              key={key}
              className="absolute w-[256px] h-[256px] bg-[#FAF7F2]"
              style={{ left: `${left}px`, top: `${top}px` }}
            >
              {/* eslint-disable-next-html-element-suppression */}
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Backdrop Gradient Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5 z-0" />

        {/* ── Dashed Sequence Connector (behind the pins) ── */}
        <RouteSequenceConnector
          points={connectorPoints}
          viewport={viewportSize}
          testId="map-sequence-connector"
        />

        {/* ── Numbered Stop Pin Markers ── */}
        {projectedStops.map(({ stop, screenX, screenY }) => {
          const isStart = stop.order === 1;
          const isEnd = stop.order === sortedStops.length;

          const pinBg = isStart ? '#228255' : isEnd ? '#C4572A' : '#FFFFFF';
          const textColor = isStart || isEnd ? '#FFFFFF' : '#1C1008';

          return (
            <div
              key={stop.id}
              data-testid={`map-pin-${stop.order}`}
              className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all"
              style={{ left: `${screenX}px`, top: `${screenY}px` }}
              aria-label={`Stop ${stop.order}: ${stop.name}`}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2"
                style={{
                  backgroundColor: pinBg,
                  color: textColor,
                  borderColor: isStart ? '#155B3A' : isEnd ? '#8C3514' : '#C4572A',
                }}
              >
                {stop.order}
              </div>
            </div>
          );
        })}

        {/* ── Full-width Glassmorphism Bottom Action Bar ── */}
        <div
          data-testid="tap-to-view-full-map-bar"
          className="absolute bottom-0 left-0 right-0 z-30 bg-[#1C1008]/60 backdrop-blur-md border-t border-white/20 px-4 py-2.5 flex items-center justify-center gap-2 text-white font-bold text-xs text-center shadow-lg transition-colors"
        >
          <span>{t('tapToViewFullMap')}</span>
        </div>
      </div>
    </div>
  );
}
