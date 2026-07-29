'use client';

import React, { useEffect, useRef } from 'react';
import { Stop } from '@/lib/types/route';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface TimelineBarProps {
  stops: Stop[];
  activeIndex: number;
  visitedStopIds: string[];
  onStopClick: (slideIndex: number) => void;
  onToggleVisited: () => void;
  isCompleted?: boolean;
}

const GEORGIAN_WAVE_PATH =
  'M0,8 C10,4 15,12 25,8 C35,4 40,12 50,8 C60,4 65,12 75,8 C85,4 90,12 100,8 C110,4 115,12 125,8 C135,4 140,12 150,8 C160,4 165,12 175,8 C185,4 190,12 200,8 C210,4 215,12 225,8 C235,4 240,12 250,8 C260,4 265,12 275,8 C285,4 290,12 300,8';

function TimelineBar({
  stops,
  activeIndex,
  visitedStopIds,
  onStopClick,
  onToggleVisited,
  isCompleted = false,
}: TimelineBarProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeStopRef = useRef<HTMLButtonElement | null>(null);

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
  }, [activeIndex]);

  const currentStopIndex = activeIndex > 0 ? activeIndex - 1 : 0;
  const currentStop = currentStopIndex < stops.length ? stops[currentStopIndex] : null;
  const isCurrentVisited = currentStop ? visitedStopIds.includes(currentStop.id) : false;

  const totalStops = stops.length;
  const filledFraction = totalStops > 1 ? Math.min(1, Math.max(0, currentStopIndex / (totalStops - 1))) : 0;

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
      {/* Route Completion Banner */}
      {isCompleted && (
        <div
          data-testid="completion-feedback"
          className="absolute -top-11 left-0 right-0 mx-auto w-max px-3 py-1 bg-[#228255] border border-white/20 text-[#FAF7F2] rounded-full text-xs text-center font-bold shadow-lg flex items-center justify-center gap-1.5 backdrop-blur-md pointer-events-auto z-10"
        >
          <span>🎉</span>
          <span>{t('routeCompleted')}</span>
        </div>
      )}

      <div className="flex items-center gap-3 px-4 py-3.5 max-w-2xl mx-auto w-full">
        {/* Track + dots container */}
        <div
          ref={containerRef}
          data-testid="timeline-bar-container"
          className="relative flex items-center justify-between flex-1 overflow-x-auto py-1.5 px-3 scrollbar-none scroll-smooth"
          style={{ minHeight: 46 }}
        >
          {/* Georgian ornament track line (repeating wave SVG) */}
          <div
            className="absolute overflow-hidden pointer-events-none"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
              left: DOT / 2,
              right: DOT / 2,
              height: 16,
              zIndex: 0,
            }}
            aria-hidden="true"
          >
            {/* Unfilled track line */}
            <svg
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 300 16"
            >
              <path
                d={GEORGIAN_WAVE_PATH}
                stroke="rgba(196,87,42,0.15)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>

            {/* Filled progress track line with clip */}
            <div
              className="absolute inset-0 overflow-hidden transition-all duration-700 ease-out"
              style={{ width: `${filledFraction * 100}%` }}
            >
              <svg
                className="w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 300 16"
              >
                {/* Glow behind colored line */}
                <path
                  d={GEORGIAN_WAVE_PATH}
                  stroke="rgba(196,87,42,0.25)"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Main colored line */}
                <path
                  d={GEORGIAN_WAVE_PATH}
                  stroke="#C4572A"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Stop dots */}
          {stops.map((stop, index) => {
            const slideIndex = index + 1;
            const stopOrder = stop.order ?? slideIndex;
            const isActive = activeIndex === slideIndex;
            const isVisited = visitedStopIds.includes(stop.id);
            const isPitstop = stop.stopType === 'venue' || Boolean((stop as any).isOptional);

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
        </div>

        {/* Vertical Divider */}
        <div
          className="w-px self-stretch shrink-0"
          style={{ background: 'rgba(196,87,42,0.18)', minHeight: 30 }}
          aria-hidden="true"
        />

        {/* FAB Button */}
        <button
          type="button"
          data-testid="visited-fab"
          onClick={onToggleVisited}
          aria-label={isCurrentVisited ? t('markAsUnvisited') : t('markAsVisited')}
          title={isCurrentVisited ? t('markAsUnvisited') : t('markAsVisited')}
          className="shrink-0 flex items-center justify-center w-[56px] h-[56px] min-w-[44px] min-h-[44px] rounded-full transition-all duration-300 active:scale-90 cursor-pointer"
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
