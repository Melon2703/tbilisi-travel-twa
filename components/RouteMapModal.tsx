'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Route, Stop } from '@/lib/types/route';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import EmojiIcon from '@/components/ui/EmojiIcon';
import { buildGoogleMapLink, buildYandexMapLink, getPlaceIdentity } from '@/lib/utils/mapLinks';

export interface RouteMapModalProps {
  route: Route;
  isOpen: boolean;
  onClose: () => void;
  initialStopOrder?: number;
}

export default function RouteMapModal({
  route,
  isOpen,
  onClose,
  initialStopOrder = 1,
}: RouteMapModalProps) {
  const { language, t } = useLanguage();
  const sortedStops = useMemo(
    () => [...route.stops].sort((a, b) => a.order - b.order),
    [route.stops]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const modalRootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({
    width: 800,
    height: 600,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const [selectedStopId, setSelectedStopId] = useState<string | null>(
    sortedStops.find((s) => s.order === initialStopOrder)?.id || sortedStops[0]?.id || null
  );

  // Map center bounds
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

  const [zoom, setZoom] = useState<number>(15);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update container size on mount & window resize
  useEffect(() => {
    if (!isOpen) return;

    const updateSize = () => {
      if (containerRef.current) {
        setViewportSize({
          width: containerRef.current.clientWidth || 800,
          height: containerRef.current.clientHeight || 600,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll & Swiper swiping when map modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    // Disable all Swiper instances while modal is open to prevent page swiping
    const swiperElements = document.querySelectorAll('.swiper');
    const disabledSwipers: { el: any; prevAllow: boolean }[] = [];

    swiperElements.forEach((el: any) => {
      if (el.swiper) {
        disabledSwipers.push({ el, prevAllow: el.swiper.allowTouchMove });
        el.swiper.allowTouchMove = false;
      }
    });

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;

      disabledSwipers.forEach(({ el, prevAllow }) => {
        if (el.swiper) {
          el.swiper.allowTouchMove = prevAllow;
        }
      });
    };
  }, [isOpen]);

  // Native capture-phase touch event interceptor to prevent touch bubbling to Swiper
  useEffect(() => {
    if (!isOpen || !mounted || !modalRootRef.current) return;
    const el = modalRootRef.current;

    const stopNative = (e: Event) => {
      e.stopPropagation();
      if ('stopImmediatePropagation' in e) {
        (e as any).stopImmediatePropagation();
      }
    };

    const events = [
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel',
      'pointerdown',
      'pointermove',
      'pointerup',
      'pointercancel',
      'mousedown',
      'mousemove',
      'mouseup',
    ];

    events.forEach((evt) => {
      el.addEventListener(evt, stopNative, { capture: true, passive: false });
    });

    return () => {
      events.forEach((evt) => {
        el.removeEventListener(evt, stopNative, { capture: true });
      });
    };
  }, [isOpen, mounted]);

  // Exact Web Mercator Projection Functions
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

  // Projected Screen Coordinates for all Stops
  const projectedStops = useMemo(() => {
    return sortedStops.map((stop) => {
      const worldX = lngToWorldX(stop.coordinates.lng, zoom);
      const worldY = latToWorldY(stop.coordinates.lat, zoom);

      const screenX = roundCoord(worldX - centerWorldX + viewportSize.width / 2 + panOffset.x);
      const screenY = roundCoord(worldY - centerWorldY + viewportSize.height / 2 + panOffset.y);

      return {
        stop,
        screenX,
        screenY,
      };
    });
  }, [sortedStops, centerWorldX, centerWorldY, viewportSize, panOffset, zoom]);



  // Calculate CartoDB Voyager Tile Grid
  const tiles = useMemo(() => {
    const minScreenX = 0;
    const maxScreenX = viewportSize.width;
    const minScreenY = 0;
    const maxScreenY = viewportSize.height;

    const minWorldX = centerWorldX - viewportSize.width / 2 - panOffset.x + minScreenX;
    const maxWorldX = centerWorldX - viewportSize.width / 2 - panOffset.x + maxScreenX;
    const minWorldY = centerWorldY - viewportSize.height / 2 - panOffset.y + minScreenY;
    const maxWorldY = centerWorldY - viewportSize.height / 2 - panOffset.y + maxScreenY;

    const startTileX = Math.floor(minWorldX / 256);
    const endTileX = Math.floor(maxWorldX / 256);
    const startTileY = Math.floor(minWorldY / 256);
    const endTileY = Math.floor(maxWorldY / 256);

    const tileList: { key: string; url: string; left: number; top: number }[] = [];

    for (let tx = startTileX; tx <= endTileX; tx++) {
      for (let ty = startTileY; ty <= endTileY; ty++) {
        const left = roundCoord(tx * 256 - centerWorldX + viewportSize.width / 2 + panOffset.x);
        const top = roundCoord(ty * 256 - centerWorldY + viewportSize.height / 2 + panOffset.y);
        const url = `https://a.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${tx}/${ty}@2x.png`;
        tileList.push({ key: `${zoom}-${tx}-${ty}`, url, left, top });
      }
    }

    return tileList;
  }, [zoom, centerWorldX, centerWorldY, viewportSize, panOffset]);

  // Mouse & Touch Drag-Pan Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...panOffset };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...panOffset };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setPanOffset({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(15);
    setPanOffset({ x: 0, y: 0 });
    setSelectedStopId(sortedStops[0]?.id || null);
  };

  const selectedStop = useMemo(
    () => sortedStops.find((s) => s.id === selectedStopId) || null,
    [sortedStops, selectedStopId]
  );

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={modalRootRef}
      data-testid="route-map-modal"
      className="fixed inset-0 z-50 bg-[#FAF7F2] text-[#1C1008] flex flex-col overflow-hidden animate-in fade-in duration-200 touch-none select-none"
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    >
      {/* ── Main Canvas Viewport ── */}
      <div
        ref={containerRef}
        data-testid="interactive-map-viewport"
        className="relative flex-1 bg-[#EAE5D9] overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Seamless Sub-Pixel Mercator Cartographic Tiles */}
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
                alt="Cartographic Tile"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0';
                }}
              />
            </div>
          ))}
        </div>



        {/* ── Numbered Stop Pin Markers ── */}
        {projectedStops.map(({ stop, screenX, screenY }) => {
          const isStart = stop.order === 1;
          const isEnd = stop.order === sortedStops.length;
          const isSelected = stop.id === selectedStopId;

          const pinBg = isStart ? '#228255' : isEnd ? '#C4572A' : isSelected ? '#C4572A' : '#FFFFFF';
          const textColor = isStart || isEnd || isSelected ? '#FFFFFF' : '#1C1008';

          return (
            <div
              key={stop.id}
              className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{ left: `${screenX}px`, top: `${screenY}px` }}
            >
              {/* Start Badge */}
              {isStart && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none whitespace-nowrap z-40">
                  <span className="bg-[#228255] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border border-white/40">
                    🏁 {t('startPoint')}
                  </span>
                </div>
              )}

              {/* Finish Badge */}
              {isEnd && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none whitespace-nowrap z-40">
                  <span className="bg-[#C4572A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border border-white/40">
                    🎯 {t('finishPoint')}
                  </span>
                </div>
              )}

              {/* Pin Button */}
              <button
                type="button"
                data-testid={`modal-map-pin-${stop.order}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStopId(stop.id);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm shadow-lg border-2 transition-all cursor-pointer active:scale-125 ${
                  isSelected ? 'ring-4 ring-[#C4572A]/40 scale-110 z-40' : ''
                }`}
                style={{
                  backgroundColor: pinBg,
                  color: textColor,
                  borderColor: isStart ? '#155B3A' : isEnd ? '#8C3514' : '#C4572A',
                }}
                aria-label={`Select Stop ${stop.order}`}
              >
                {stop.order}
              </button>
            </div>
          );
        })}

        {/* ── Floating Controls (Close, Zoom & Reset) ── */}
        <div className="absolute top-4 right-4 z-40 flex flex-col gap-2 pointer-events-auto">
          <button
            type="button"
            data-testid="close-map-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md border border-black/15 text-black font-extrabold text-lg shadow-md flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            aria-label="Close map modal"
          >
            ✕
          </button>
          <button
            type="button"
            data-testid="modal-map-zoom-in"
            onClick={() => setZoom((z) => Math.min(z + 1, 18))}
            className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md border border-black/15 text-black font-extrabold text-lg shadow-md flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            aria-label="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            data-testid="modal-map-zoom-out"
            onClick={() => setZoom((z) => Math.max(z - 1, 13))}
            className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md border border-black/15 text-black font-extrabold text-lg shadow-md flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            aria-label="Zoom Out"
          >
            −
          </button>
          <button
            type="button"
            data-testid="modal-map-reset"
            onClick={resetView}
            className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md border border-black/15 text-black font-extrabold text-sm shadow-md flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            aria-label="Reset View"
          >
            ↺
          </button>
        </div>

        {/* ── Floating Bottom Stop Card Sheet ── */}
        {selectedStop && (
          <div
            data-testid="modal-stop-card"
            className="absolute bottom-4 left-4 right-4 max-w-xl mx-auto z-40 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-[#C4572A]/25 pointer-events-auto animate-in slide-in-from-bottom-4 duration-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-neutral-100 border border-black/10 shadow-xs">
                  {selectedStop.imageUrl && (
                    <Image
                      src={selectedStop.imageUrl}
                      alt={selectedStop.name}
                      fill
                      className="object-cover"
                    />
                  )}
                  <span className="absolute top-1 left-1 bg-[#C4572A] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
                    #{selectedStop.order}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-extrabold tracking-wide text-[#C4572A]">
                      {language === 'ru' && selectedStop.neighborhoodRu
                        ? selectedStop.neighborhoodRu
                        : selectedStop.neighborhood}
                    </span>
                    <span className="text-[11px] font-bold text-[#7A6552]">
                      • {selectedStop.estimatedMinutes} {t('min')}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#1C1008] truncate mt-0.5">
                    {language === 'ru' && selectedStop.nameRu ? selectedStop.nameRu : selectedStop.name}
                  </h3>

                  <p className="text-xs text-[#7A6552] line-clamp-1 italic mt-0.5">
                    &ldquo;
                    {language === 'ru' && selectedStop.olyaTipsRu
                      ? selectedStop.olyaTipsRu
                      : selectedStop.olyaTips}
                    &rdquo;
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStopId(null)}
                className="w-7 h-7 rounded-full bg-black/5 text-[#7A6552] font-bold flex items-center justify-center transition-all shrink-0 cursor-pointer"
                aria-label="Dismiss stop details"
              >
                ✕
              </button>
            </div>

            {/* Action Bar */}
            <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-[#A0876E]">
                {t('stopsCount', { count: sortedStops.length })}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={buildGoogleMapLink(getPlaceIdentity(selectedStop))}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open in Google Maps"
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#C4572A] text-white transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                >
                  <span>📍</span>
                  <span>Google</span>
                </a>
                <a
                  href={buildYandexMapLink(getPlaceIdentity(selectedStop))}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open in Yandex Maps"
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-white text-[#C4572A] border border-[#C4572A]/30 transition-all flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                >
                  <span>📍</span>
                  <span>Yandex</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (mounted && typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
