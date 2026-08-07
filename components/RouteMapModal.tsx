'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Route, Stop } from '@/lib/types/route';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import EmojiIcon from '@/components/ui/EmojiIcon';
import { buildGoogleMapLink, buildYandexMapLink, getPlaceIdentity } from '@/lib/utils/mapLinks';
import RouteSequenceConnector from '@/components/RouteSequenceConnector';
import {
  buildTileGrid,
  clampZoom,
  frameStops,
  projectCoordinates,
} from '@/lib/utils/mapFraming';

/** Room kept clear for the pin and its start/finish badge. */
const MODAL_PADDING = 72;

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

  // Framing that puts the whole Route on canvas; the traveler zooms from there
  const fitFraming = useMemo(
    () =>
      frameStops(
        sortedStops.map((s) => s.coordinates),
        viewportSize,
        { padding: MODAL_PADDING }
      ),
    [sortedStops, viewportSize]
  );

  const [zoomSteps, setZoomSteps] = useState<number>(0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // The native gesture listener reads the pan through this ref, never through
  // the closure it was registered with.
  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

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

  // Drag-panning runs on this same capture-phase listener: the interceptor below
  // swallows the gesture before React's delegated handlers ever see it, so the
  // pan has to be driven from here rather than from props on the viewport.
  useEffect(() => {
    if (!isOpen || !mounted || !modalRootRef.current) return;
    const el = modalRootRef.current;

    const gesturePoint = (e: Event): { x: number; y: number } | null => {
      if ('touches' in e) {
        const touches = (e as TouchEvent).touches;
        if (touches.length !== 1) return null;
        return { x: touches[0].clientX, y: touches[0].clientY };
      }
      const mouse = e as MouseEvent;
      return { x: mouse.clientX, y: mouse.clientY };
    };

    /**
     * A drag anywhere on the canvas pans, pins included — the pin still gets
     * its click on release. Only the floating controls opt out, since a drag
     * that started on the zoom button is not a pan.
     */
    const startsPan = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target || !containerRef.current?.contains(target)) return false;
      return !target.closest('[data-map-controls]');
    };

    const beginPan = (e: Event) => {
      const point = startsPan(e) ? gesturePoint(e) : null;
      if (!point) return;
      isDraggingRef.current = true;
      dragStartRef.current = point;
      panStartRef.current = { ...panOffsetRef.current };
    };

    const continuePan = (e: Event) => {
      if (!isDraggingRef.current) return;
      const point = gesturePoint(e);
      if (!point) return;
      setPanOffset({
        x: panStartRef.current.x + point.x - dragStartRef.current.x,
        y: panStartRef.current.y + point.y - dragStartRef.current.y,
      });
    };

    const endPan = () => {
      isDraggingRef.current = false;
    };

    const handleNative = (e: Event) => {
      if (e.type === 'mousedown' || e.type === 'touchstart') beginPan(e);
      else if (e.type === 'mousemove' || e.type === 'touchmove') continuePan(e);
      else if (e.type === 'mouseup' || e.type === 'touchend' || e.type === 'touchcancel') endPan();

      // Keep the gesture off Swiper, which listens above the modal.
      e.stopPropagation();
      if ('stopImmediatePropagation' in e) {
        (e as Event & { stopImmediatePropagation: () => void }).stopImmediatePropagation();
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
      el.addEventListener(evt, handleNative, { capture: true, passive: false });
    });

    // A button released outside the window never reaches the modal.
    window.addEventListener('mouseup', endPan);
    window.addEventListener('blur', endPan);

    return () => {
      events.forEach((evt) => {
        el.removeEventListener(evt, handleNative, { capture: true });
      });
      window.removeEventListener('mouseup', endPan);
      window.removeEventListener('blur', endPan);
    };
  }, [isOpen, mounted]);

  // The fitted framing, moved by however far the traveler has zoomed
  const framing = useMemo(
    () => ({ zoom: clampZoom(fitFraming.zoom + zoomSteps), center: fitFraming.center }),
    [fitFraming, zoomSteps]
  );

  // Projected Screen Coordinates for all Stops
  const projectedStops = useMemo(
    () =>
      sortedStops.map((stop) => {
        const { x, y } = projectCoordinates(stop.coordinates, framing, viewportSize, panOffset);
        return { stop, screenX: x, screenY: y };
      }),
    [sortedStops, framing, viewportSize, panOffset]
  );

  const connectorPoints = useMemo(
    () => projectedStops.map(({ screenX, screenY }) => ({ x: screenX, y: screenY })),
    [projectedStops]
  );

  // Calculate CartoDB Voyager Tile Grid
  const tiles = useMemo(
    () => buildTileGrid(framing, viewportSize, panOffset),
    [framing, viewportSize, panOffset]
  );

  /**
   * Zoom is counted in steps away from the fitted framing, clamped so the steps
   * never drift past the tile range and leave a button pressing on nothing.
   */
  const stepZoom = (steps: number, delta: number) =>
    clampZoom(fitFraming.zoom + steps + delta) - fitFraming.zoom;

  const resetView = () => {
    setZoomSteps(0);
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


        {/* ── Dashed Sequence Connector (behind the pins) ── */}
        <RouteSequenceConnector
          points={connectorPoints}
          viewport={viewportSize}
          testId="modal-map-sequence-connector"
        />

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
              data-testid={`modal-map-pin-position-${stop.order}`}
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
        <div
          data-map-controls
          className="absolute top-4 right-4 z-40 flex flex-col gap-2 pointer-events-auto"
        >
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
            onClick={() => setZoomSteps((s) => stepZoom(s, +1))}
            className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md border border-black/15 text-black font-extrabold text-lg shadow-md flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            aria-label="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            data-testid="modal-map-zoom-out"
            onClick={() => setZoomSteps((s) => stepZoom(s, -1))}
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
