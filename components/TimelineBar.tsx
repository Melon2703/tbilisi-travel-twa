'use client';

import React, { useEffect, useRef } from 'react';
import { Stop } from '@/lib/types/route';

export interface TimelineBarProps {
  stops: Stop[];
  activeIndex: number;
  visitedStopIds: string[];
  onStopClick: (slideIndex: number) => void;
  onToggleVisited: () => void;
  isCompleted?: boolean;
}

const CHECK_ICON = (
  <svg
    className="w-3 h-3 stroke-[3] shrink-0 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const FAB_CHECK_ICON = (
  <svg
    className="w-5 h-5 stroke-[3]"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

function TimelineBar({
  stops,
  activeIndex,
  visitedStopIds,
  onStopClick,
  onToggleVisited,
  isCompleted = false,
}: TimelineBarProps) {
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

  const currentStopIndex = activeIndex - 1;
  const currentStop = currentStopIndex >= 0 && currentStopIndex < stops.length ? stops[currentStopIndex] : null;
  const isCurrentVisited = currentStop ? visitedStopIds.includes(currentStop.id) : false;

  const totalStops = stops.length;
  const filledFraction = totalStops > 1 ? currentStopIndex / (totalStops - 1) : 0;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center transition-all duration-200 pointer-events-none max-w-[95vw]">
      {/* Route Completion Banner */}
      {isCompleted && (
        <div
          data-testid="completion-feedback"
          className="absolute -top-11 left-0 right-0 mx-auto w-max px-3 py-1 bg-[#228255] border border-white/20 text-[#FAF7F2] rounded-full text-xs text-center font-bold shadow-lg flex items-center justify-center gap-1.5 backdrop-blur-md pointer-events-auto"
        >
          <span>🎉</span>
          <span>Route completed! All stops visited!</span>
        </div>
      )}

      {/* Floating Georgian Styled Navigation Bar */}
      <div
        className="pointer-events-auto flex items-center gap-3 rounded-full px-4 py-2.5 shadow-[0_8px_32px_rgba(28,16,8,0.15)] border border-[#C4572A]/20"
        style={{
          background: 'rgba(250,247,242,0.96)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        {/* Timeline Sequence Nodes Container */}
        <div className="relative flex items-center">
          {/* Georgian Ornament Wave Track Line */}
          <div
            className="absolute overflow-hidden pointer-events-none left-3 right-3"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
              height: 12,
              zIndex: 0,
            }}
            aria-hidden="true"
          >
            {/* Unfilled track */}
            <svg
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 300 16"
            >
              <path
                d="M0,8 C10,4 15,12 25,8 C35,4 40,12 50,8 C60,4 65,12 75,8 C85,4 90,12 100,8 C110,4 115,12 125,8 C135,4 140,12 150,8 C160,4 165,12 175,8 C185,4 190,12 200,8 C210,4 215,12 225,8 C235,4 240,12 250,8 C260,4 265,12 275,8 C285,4 290,12 300,8"
                stroke="rgba(196,87,42,0.2)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>

            {/* Filled progress track */}
            <div
              className="absolute inset-0 overflow-hidden transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, filledFraction * 100))}%` }}
            >
              <svg
                className="w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 300 16"
              >
                <path
                  d="M0,8 C10,4 15,12 25,8 C35,4 40,12 50,8 C60,4 65,12 75,8 C85,4 90,12 100,8 C110,4 115,12 125,8 C135,4 140,12 150,8 C160,4 165,12 175,8 C185,4 190,12 200,8 C210,4 215,12 225,8 C235,4 240,12 250,8 C260,4 265,12 275,8 C285,4 290,12 300,8"
                  stroke="#C4572A"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div
            ref={containerRef}
            data-testid="timeline-bar-container"
            className="flex items-center gap-2 overflow-x-auto py-1 px-3 max-w-[60vw] sm:max-w-[65vw] scrollbar-none scroll-smooth relative z-10"
          >
            {stops.map((stop, index) => {
              const slideIndex = index + 1;
              const isActive = activeIndex === slideIndex;
              const isVisited = visitedStopIds.includes(stop.id);

              return (
                <button
                  key={stop.id}
                  type="button"
                  ref={isActive ? activeStopRef : null}
                  data-testid={`timeline-stop-${stop.order}`}
                  onClick={() => onStopClick(slideIndex)}
                  aria-label={`Jump to stop ${stop.order}: ${stop.name}`}
                  className={`shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ease-out cursor-pointer focus:outline-none relative select-none ${
                    isActive
                      ? 'w-9 h-9 min-w-[36px] min-h-[36px] text-sm font-bold scale-110 z-10 shadow-md ring-2 ring-[#C4572A]'
                      : 'w-7 h-7 min-w-[28px] min-h-[28px] text-xs font-semibold scale-90 z-0 opacity-90 hover:opacity-100'
                  } ${
                    isVisited
                      ? isActive
                        ? 'bg-[#228255] bg-emerald-600 text-white border-2 border-[#228255]'
                        : 'bg-[#228255] bg-emerald-600 text-white border border-[#228255]'
                      : isActive
                        ? 'bg-[#FAF7F2] text-[#C4572A] border-2 border-[#C4572A]'
                        : 'bg-[#FAF7F2] text-[#7A6552] border border-[#C4572A]/30 hover:border-[#C4572A]'
                  }`}
                >
                  <span className="flex items-center gap-0.5">
                    {isVisited && CHECK_ICON}
                    <span>{stop.order}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vertical Separator */}
        <div className="w-px h-6 bg-[#C4572A]/20 mx-0.5 shrink-0" />

        {/* Visited Checkmark FAB Button */}
        <button
          type="button"
          data-testid="visited-fab"
          onClick={onToggleVisited}
          aria-label={isCurrentVisited ? 'Mark as unvisited' : 'Mark as visited'}
          title={isCurrentVisited ? 'Mark as unvisited' : 'Mark as visited'}
          className={`w-[56px] h-[56px] min-w-[56px] min-h-[56px] rounded-full flex items-center justify-center font-bold shadow-lg transition-all duration-300 active:scale-95 cursor-pointer shrink-0 text-white ${
            isCurrentVisited
              ? 'bg-[#228255] hover:bg-[#1C6C46] ring-2 ring-[#228255]/40'
              : 'bg-[#C4572A] hover:bg-[#B04C23] ring-2 ring-[#C4572A]/30'
          }`}
        >
          {FAB_CHECK_ICON}
        </button>
      </div>
    </div>
  );
}

export default React.memo(TimelineBar);
