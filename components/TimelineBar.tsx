'use client';

import React, { useEffect, useRef } from 'react';
import { Stop } from '@/lib/types/route';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Icon from '@/components/ui/Icon';
import { COLORS } from '@/lib/theme/tokens';

/** Slide 0 of the carousel is the Route Intro Card. */
const ROUTE_INTRO_SLIDE_INDEX = 0;

export interface TimelineBarProps {
  stops: Stop[];
  activeIndex: number;
  visitedStopIds: string[];
  onStopClick: (slideIndex: number) => void;
  onToggleVisited: () => void;
  isCompleted?: boolean;
  maxVisibleDots?: number;
}

function TimelineBar({
  stops,
  activeIndex,
  visitedStopIds,
  onStopClick,
  onToggleVisited,
  isCompleted = false,
  maxVisibleDots = 4,
}: TimelineBarProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeStopRef = useRef<HTMLButtonElement | null>(null);

  const currentStopIndex = activeIndex > 0 ? activeIndex - 1 : 0;
  const currentStop = currentStopIndex < stops.length ? stops[currentStopIndex] : null;
  const isCurrentVisited = currentStop ? visitedStopIds.includes(currentStop.id) : false;

  const totalStops = stops.length;
  const MAX_VISIBLE = maxVisibleDots;

  let startIndex = 0;
  let endIndex = totalStops - 1;

  if (totalStops > MAX_VISIBLE) {
    const half = Math.floor(MAX_VISIBLE / 2);
    startIndex = Math.max(0, currentStopIndex - half);
    if (startIndex + MAX_VISIBLE > totalStops) {
      startIndex = totalStops - MAX_VISIBLE;
    }
    endIndex = startIndex + MAX_VISIBLE - 1;
  }

  const visibleStops = stops.slice(startIndex, endIndex + 1);
  const hasLeftContinuation = startIndex > 0;
  const hasRightContinuation = endIndex < totalStops - 1;

  // Auto-center active stop indicator smoothly inside timeline container
  useEffect(() => {
    if (activeStopRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeStopRef.current;
      const targetLeft = element.offsetLeft - container.offsetWidth / 2 + element.offsetWidth / 2;
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({
          left: targetLeft,
          behavior: 'smooth',
        });
      } else {
        container.scrollLeft = targetLeft;
      }
    }
  }, [activeIndex, startIndex]);

  const visibleCount = visibleStops.length;
  const activePositionInVisible = currentStopIndex - startIndex;
  const filledFraction =
    visibleCount > 1
      ? Math.min(1, Math.max(0, activePositionInVisible / (visibleCount - 1)))
      : 0;

  const DOT = 38;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-200"
      style={{
        background: 'rgba(250,247,242,0.96)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderTop: '1px solid rgba(196,87,42,0.12)',
      }}
    >

      <div className="flex items-center gap-3 px-4 py-3.5 max-w-2xl mx-auto w-full">
        {/* Leading overview control — a different kind of destination than a numbered Stop,
            so it is a squircle carrying a map glyph rather than a round numbered dot. */}
        <button
          type="button"
          data-testid="timeline-overview"
          onClick={() => onStopClick(ROUTE_INTRO_SLIDE_INDEX)}
          aria-label={t('routeOverview')}
          title={t('routeOverview')}
          className="shrink-0 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 select-none"
          style={{
            width: DOT,
            // 48px touch height (DESIGN_SYSTEM 4.3) without stealing width from the Stop indicators
            height: 48,
            background: COLORS.canvasBg,
            border: `1.5px solid ${COLORS.tipBoxBorder}`,
          }}
        >
          <Icon name="routeOverview" size="sm" />
        </button>

        {/* Vertical Divider */}
        <div
          className="w-px self-stretch shrink-0"
          style={{ background: 'rgba(196,87,42,0.10)', minHeight: 30 }}
          aria-hidden="true"
        />

        {/* Track + dots container */}
        <div
          ref={containerRef}
          data-testid="timeline-bar-container"
          className="relative flex items-center justify-between flex-1 overflow-x-auto py-1.5 px-3 scrollbar-none scroll-smooth"
          style={{ minHeight: 46 }}
        >
          {/* Straight 2px horizontal progress track line */}
          <div
            className="absolute overflow-hidden pointer-events-none rounded-full"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
              left: DOT / 2,
              right: DOT / 2,
              height: 2,
              zIndex: 0,
              background: 'rgba(196,87,42,0.15)',
            }}
            aria-hidden="true"
          >
            {/* Filled progress track line */}
            <div
              className="h-full transition-all duration-700 ease-out bg-[#C4572A] rounded-full"
              style={{ width: `${filledFraction * 100}%` }}
            />
          </div>

          {/* Left continuation indicator */}
          {hasLeftContinuation && (
            <button
              type="button"
              data-testid="timeline-ellipsis-left"
              onClick={() => onStopClick(startIndex)}
              aria-label={t('previousStops')}
              title={t('previousStops')}
              className="relative flex items-center justify-center rounded-full text-xs font-bold transition-all duration-200 active:scale-90 select-none shrink-0 bg-[#FAF7F2] text-[#C4572A]"
              style={{
                width: 28,
                height: 28,
                zIndex: 1,
                border: '1.5px dashed rgba(196,87,42,0.4)',
              }}
            >
              •••
            </button>
          )}

          {/* Visible Stop dots */}
          {visibleStops.map((stop, vIndex) => {
            const realIndex = startIndex + vIndex;
            const slideIndex = realIndex + 1;
            const stopOrder = stop.order ?? slideIndex;
            const isActive = activeIndex === slideIndex;
            const isVisited = visitedStopIds.includes(stop.id);
            const isPitstop = stop.stopType === 'venue' && Boolean(stop.isOptional);

            return (
              <button
                key={stop.id}
                type="button"
                ref={isActive ? activeStopRef : null}
                data-testid={`timeline-stop-${stopOrder}`}
                data-pitstop={isPitstop ? 'true' : undefined}
                onClick={() => onStopClick(slideIndex)}
                aria-label={`${t('jumpToStop', { order: stopOrder, name: stop.name })}${isPitstop ? ' (' + t('pitstop') + ')' : ''}`}
                aria-current={isActive ? 'step' : undefined}
                className={`relative flex items-center justify-center rounded-full text-xs font-bold transition-all duration-200 active:scale-90 select-none shrink-0 ${
                  isActive
                    ? 'ring-2 ring-[#C4572A] scale-110 min-w-[36px]'
                    : 'min-w-[28px]'
                } ${
                  isVisited
                    ? 'bg-[#228255] bg-emerald-600 text-white'
                    : isActive
                      ? 'bg-[#FAF7F2] text-[#C4572A]'
                      : 'bg-[#FAF7F2] text-[#7A6552]'
                }`}
                style={{
                  width: DOT,
                  height: DOT,
                  zIndex: 1,
                  borderStyle: isPitstop ? 'dashed' : 'solid',
                  ...(isVisited
                    ? {
                        background: '#228255',
                        border: isPitstop ? '2px dashed #228255' : '2px solid #228255',
                        color: '#fff',
                        boxShadow: isActive ? '0 0 0 3px rgba(34,130,85,0.2)' : 'none',
                      }
                    : isActive
                      ? {
                          background: '#FAF7F2',
                          border: isPitstop ? '2.5px dashed #C4572A' : '2.5px solid #C4572A',
                          color: '#C4572A',
                          boxShadow: '0 0 0 3px rgba(196,87,42,0.15)',
                        }
                      : {
                          background: '#FAF7F2',
                          border: isPitstop ? '1.5px dashed rgba(196,87,42,0.5)' : '1.5px solid rgba(196,87,42,0.25)',
                          color: 'rgba(28,16,8,0.3)',
                        }),
                }}
              >
                {stopOrder}
              </button>
            );
          })}

          {/* Right continuation indicator */}
          {hasRightContinuation && (
            <button
              type="button"
              data-testid="timeline-ellipsis-right"
              onClick={() => onStopClick(endIndex + 2)}
              aria-label={t('moreStops')}
              title={t('moreStops')}
              className="relative flex items-center justify-center rounded-full text-xs font-bold transition-all duration-200 active:scale-90 select-none shrink-0 bg-[#FAF7F2] text-[#C4572A]"
              style={{
                width: 28,
                height: 28,
                zIndex: 1,
                border: '1.5px dashed rgba(196,87,42,0.4)',
              }}
            >
              •••
            </button>
          )}
        </div>

        {/* Vertical Divider */}
        <div
          className="w-px self-stretch shrink-0"
          style={{ background: 'rgba(196,87,42,0.10)', minHeight: 30 }}
          aria-hidden="true"
        />

        {/* FAB Button */}
        <button
          type="button"
          data-testid="visited-fab"
          onClick={onToggleVisited}
          aria-label={isCurrentVisited ? t('markAsUnvisited') : t('markAsVisited')}
          title={isCurrentVisited ? t('markAsUnvisited') : t('markAsVisited')}
          className="shrink-0 flex items-center justify-center w-[56px] h-[56px] min-w-[48px] min-h-[48px] rounded-full transition-all duration-300 active:scale-90 cursor-pointer"
          style={
            isCurrentVisited
              ? {
                  background: '#228255',
                  boxShadow: '0 0 0 3px rgba(34,130,85,0.2), 0 4px 14px rgba(34,130,85,0.3)',
                }
              : {
                  background: '#C4572A',
                  boxShadow: '0 0 0 3px rgba(196,87,42,0.18), 0 4px 14px rgba(196,87,42,0.3)',
                }
          }
        >
          <svg
            className="w-6 h-6 text-white stroke-[2.5]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default React.memo(TimelineBar);
