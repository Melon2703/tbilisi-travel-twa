'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Route } from '@/lib/types/route';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import EmojiIcon from '@/components/ui/EmojiIcon';
import { useMapLauncher } from '@/hooks/useMapLauncher';

export interface RouteOverviewMapProps {
  route: Route;
  onSelectStop?: (stopOrder: number) => void;
  onOpenModal?: () => void;
}

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

  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [zoomOffset, setZoomOffset] = useState<number>(0);

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

  const zoom = Math.min(17, Math.max(12, 14 + zoomOffset));

  // Mercator Projection
  const lngToWorldX = (lng: number, z: number) => ((lng + 180) / 360) * 256 * Math.pow(2, z);
  const latToWorldY = (lat: number, z: number) => {
    const sinLat = Math.sin((lat * Math.PI) / 180);
    const clampedSin = Math.max(-0.9999, Math.min(0.9999, sinLat));
    return (0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI)) * 256 * Math.pow(2, z);
  };

  const centerWorldX = useMemo(() => lngToWorldX(centerCoords.lng, zoom), [centerCoords.lng, zoom]);
  const centerWorldY = useMemo(() => latToWorldY(centerCoords.lat, zoom), [centerCoords.lat, zoom]);

  // Helper to round coordinates to 3 decimal places to prevent float precision hydration mismatches
  const roundCoord = (val: number) => Math.round(val * 1000) / 1000;

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

  const pathD = useMemo(() => {
    return projectedStops.reduce(
      (acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.screenX.toFixed(1)} ${p.screenY.toFixed(1)}`,
      ''
    );
  }, [projectedStops]);

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

  const selectedStop = useMemo(
    () => sortedStops.find((s) => s.id === selectedStopId) || null,
    [sortedStops, selectedStopId]
  );

  const startStop = sortedStops[0];
  const finishStop = sortedStops[sortedStops.length - 1];
  const { getLaunchUrl } = useMapLauncher();

  return (
    <div
      data-testid="route-overview-map"
      className="rounded-2xl p-4 shadow-sm space-y-3 shrink-0 bg-[#FFF8F3] border border-[#C4572A]/20 transition-all overflow-hidden"
    >
      {/* ── Header Bar with Expand Button ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">🗺️</span>
          <h3 className="text-xs font-bold text-[#C4572A]">
            {t('overviewMapTitle')}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#7A6552]">
            {sortedStops.length} {language === 'ru' ? 'остановок' : 'stops'}
          </span>
          {onOpenModal && (
            <button
              type="button"
              data-testid="expand-map-button"
              onClick={onOpenModal}
              className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#C4572A] text-white hover:bg-[#A8451E] transition-all flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
            >
              <span>🔍</span>
              <span>{t('expandMap')}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Visual Map Canvas Container ── */}
      <div
        ref={containerRef}
        data-testid="map-tile-container"
        onClick={() => {
          if (onOpenModal) onOpenModal();
        }}
        className="relative w-full h-60 sm:h-72 bg-[#EAE5D9] rounded-xl border border-black/10 overflow-hidden shadow-inner flex flex-col justify-between select-none cursor-pointer group"
      >
        {/* Seamless Sub-Pixel Mercator Tile Backdrop */}
        <div className="absolute inset-0 pointer-events-none">
          {tiles.map(({ key, url, left, top }) => (
            <div
              key={key}
              className="absolute w-[256px] h-[256px] bg-[#FAF7F2]"
              style={{ left: `${left}px`, top: `${top}px` }}
            >
              {/* eslint-disable-next-html-element-suppression */}
              <img
                src={url}
                alt="Tbilisi Cartographic Tile"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0';
                }}
              />
            </div>
          ))}
        </div>

        {/* Backdrop Gradient Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5 z-0" />

        {/* ── SVG Path Overlay Layer ── */}
        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none drop-shadow-sm">
          <path
            d={pathD}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <path
            d={pathD}
            fill="none"
            stroke="#C4572A"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* ── Start Point Callout Badge ── */}
        {projectedStops[0] && (
          <div
            data-testid="map-start-badge"
            className="absolute z-20 transform -translate-x-1/2 -translate-y-full mb-2 pointer-events-none whitespace-nowrap"
            style={{
              left: `${projectedStops[0].screenX}px`,
              top: `${projectedStops[0].screenY}px`,
            }}
          >
            <div className="flex items-center gap-1 bg-[#228255] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border border-white/40">
              <span>🏁</span>
              <span className="truncate max-w-[110px]">
                {t('startPoint')}: {language === 'ru' && startStop.nameRu ? startStop.nameRu : startStop.name}
              </span>
            </div>
          </div>
        )}

        {/* ── Finish Point Callout Badge ── */}
        {projectedStops.length > 1 && (
          <div
            data-testid="map-finish-badge"
            className="absolute z-20 transform -translate-x-1/2 -translate-y-full mb-2 pointer-events-none whitespace-nowrap"
            style={{
              left: `${projectedStops[projectedStops.length - 1].screenX}px`,
              top: `${projectedStops[projectedStops.length - 1].screenY}px`,
            }}
          >
            <div className="flex items-center gap-1 bg-[#C4572A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border border-white/40">
              <span>🎯</span>
              <span className="truncate max-w-[110px]">
                {t('finishPoint')}: {language === 'ru' && finishStop.nameRu ? finishStop.nameRu : finishStop.name}
              </span>
            </div>
          </div>
        )}

        {/* ── Numbered Stop Pin Markers ── */}
        {projectedStops.map(({ stop, screenX, screenY }) => {
          const isStart = stop.order === 1;
          const isEnd = stop.order === sortedStops.length;
          const isSelected = stop.id === selectedStopId;

          const pinBg = isStart ? '#228255' : isEnd ? '#C4572A' : isSelected ? '#C4572A' : '#FFFFFF';
          const textColor = isStart || isEnd || isSelected ? '#FFFFFF' : '#1C1008';

          return (
            <button
              key={stop.id}
              type="button"
              data-testid={`map-pin-${stop.order}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedStopId(stop.id);
                if (onSelectStop) onSelectStop(stop.order);
              }}
              className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 focus:outline-none transition-all cursor-pointer group/pin"
              style={{ left: `${screenX}px`, top: `${screenY}px` }}
              aria-label={`Stop ${stop.order}: ${stop.name}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 transition-all ${
                  isSelected ? 'ring-4 ring-[#C4572A]/40 scale-110' : 'group-hover/pin:scale-110'
                }`}
                style={{
                  backgroundColor: pinBg,
                  color: textColor,
                  borderColor: isStart ? '#155B3A' : isEnd ? '#8C3514' : '#C4572A',
                }}
              >
                {stop.order}
              </div>
            </button>
          );
        })}

        {/* ── Floating Controls (Zoom & Reset) ── */}
        <div
          className="absolute top-2.5 right-2.5 z-30 flex flex-col gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            data-testid="map-control-zoom-in"
            onClick={() => setZoomOffset((prev) => Math.min(prev + 1, 3))}
            className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur-md border border-black/15 text-black font-bold text-sm shadow-xs flex items-center justify-center hover:bg-white active:scale-95 transition-all"
            aria-label="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            data-testid="map-control-zoom-out"
            onClick={() => setZoomOffset((prev) => Math.max(prev - 1, -2))}
            className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur-md border border-black/15 text-black font-bold text-sm shadow-xs flex items-center justify-center hover:bg-white active:scale-95 transition-all"
            aria-label="Zoom Out"
          >
            −
          </button>
          <button
            type="button"
            data-testid="map-control-reset"
            onClick={() => {
              setZoomOffset(0);
              setSelectedStopId(null);
            }}
            className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur-md border border-black/15 text-black font-semibold text-xs shadow-xs flex items-center justify-center hover:bg-white active:scale-95 transition-all"
            aria-label="Reset Map"
          >
            ↺
          </button>
        </div>

        {/* ── Selected Stop Popover OR Tap Prompt ── */}
        {selectedStop ? (
          <div
            data-testid="map-stop-popover"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-2 left-2 right-2 z-40 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-[#C4572A]/30 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-neutral-100 border border-black/10">
                {selectedStop.imageUrl && (
                  <Image
                    src={selectedStop.imageUrl}
                    alt={selectedStop.name}
                    fill
                    className="object-cover"
                  />
                )}
                <span className="absolute top-0.5 left-0.5 bg-[#C4572A] text-white text-[9px] font-bold px-1 rounded-sm">
                  #{selectedStop.order}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#1C1008] truncate">
                  {language === 'ru' && selectedStop.nameRu ? selectedStop.nameRu : selectedStop.name}
                </p>
                <p className="text-[11px] text-[#7A6552] truncate mt-0.5">
                  {language === 'ru' && selectedStop.neighborhoodRu
                    ? selectedStop.neighborhoodRu
                    : selectedStop.neighborhood}{' '}
                  • <span className="font-semibold text-[#C4572A]">{selectedStop.estimatedMinutes} {t('min')}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={getLaunchUrl(selectedStop.coordinates)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#C4572A] text-white hover:bg-[#A8451E] transition-all flex items-center gap-1 shadow-2xs active:scale-95"
              >
                <span>📍</span>
                <span>Open</span>
              </a>
              <button
                type="button"
                onClick={() => setSelectedStopId(null)}
                className="w-6 h-6 rounded-full bg-black/5 text-[#7A6552] text-xs font-bold flex items-center justify-center hover:bg-black/10 transition-all"
                aria-label="Close Popover"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-2 left-2 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white font-semibold flex items-center gap-1.5 shadow-md">
            <span>🔍</span>
            <span>{t('expandMap')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
