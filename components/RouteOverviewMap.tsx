'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Route } from '@/lib/types/route';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface RouteOverviewMapProps {
  route: Route;
  onSelectStop?: (stopOrder: number) => void;
  onOpenModal?: () => void;
}

// Mercator Projection & Helper functions defined outside component body
const lngToWorldX = (lng: number, z: number) => ((lng + 180) / 360) * 256 * Math.pow(2, z);
const latToWorldY = (lat: number, z: number) => {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const clampedSin = Math.max(-0.9999, Math.min(0.9999, sinLat));
  return (0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI)) * 256 * Math.pow(2, z);
};
const roundCoord = (val: number) => Math.round(val * 1000) / 1000;

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

  // Compute bounding center
  const centerCoords = useMemo(() => {
    const lats = sortedStops.map((s) => s.coordinates.lat);
    const lngs = sortedStops.map((s) => s.coordinates.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2,
    };
  }, [sortedStops]);

  const zoom = 14;

  const centerWorldX = useMemo(() => lngToWorldX(centerCoords.lng, zoom), [centerCoords.lng, zoom]);
  const centerWorldY = useMemo(() => latToWorldY(centerCoords.lat, zoom), [centerCoords.lat, zoom]);

  // Screen Projected Stops
  const projectedStops = useMemo(() => {
    return sortedStops.map((stop) => {
      const worldX = lngToWorldX(stop.coordinates.lng, zoom);
      const worldY = latToWorldY(stop.coordinates.lat, zoom);

      const screenX = roundCoord(worldX - centerWorldX + viewportSize.width / 2);
      const screenY = roundCoord(worldY - centerWorldY + viewportSize.height / 2);

      return {
        stop,
        screenX,
        screenY,
      };
    });
  }, [sortedStops, centerWorldX, centerWorldY, viewportSize, zoom]);

  // CartoDB Voyager Tile Grid
  const tiles = useMemo(() => {
    const minWorldX = centerWorldX - viewportSize.width / 2;
    const maxWorldX = centerWorldX + viewportSize.width / 2;
    const minWorldY = centerWorldY - viewportSize.height / 2;
    const maxWorldY = centerWorldY + viewportSize.height / 2;

    const startTileX = Math.floor(minWorldX / 256);
    const endTileX = Math.floor(maxWorldX / 256);
    const startTileY = Math.floor(minWorldY / 256);
    const endTileY = Math.floor(maxWorldY / 256);

    const tileList: { key: string; url: string; left: number; top: number }[] = [];

    for (let tx = startTileX; tx <= endTileX; tx++) {
      for (let ty = startTileY; ty <= endTileY; ty++) {
        const left = roundCoord(tx * 256 - centerWorldX + viewportSize.width / 2);
        const top = roundCoord(ty * 256 - centerWorldY + viewportSize.height / 2);
        const url = `https://a.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${tx}/${ty}@2x.png`;
        tileList.push({ key: `${zoom}-${tx}-${ty}`, url, left, top });
      }
    }

    return tileList;
  }, [zoom, centerWorldX, centerWorldY, viewportSize]);

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
          <span className="text-sm">🗺️</span>
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

        {/* ── Numbered Stop Pin Markers (Without connecting lines) ── */}
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
