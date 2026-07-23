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

export default function TimelineBar({
  stops,
  activeIndex,
  visitedStopIds,
  onStopClick,
  onToggleVisited,
  isCompleted = false,
}: TimelineBarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeStopRef = useRef<HTMLButtonElement | null>(null);

  // Auto-center active stop indicator in scrollable container
  useEffect(() => {
    if (activeStopRef.current) {
      activeStopRef.current.scrollIntoView?.({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeIndex]);

  const currentStopIndex = activeIndex - 1;
  const currentStop = currentStopIndex >= 0 && currentStopIndex < stops.length ? stops[currentStopIndex] : null;
  const isCurrentVisited = currentStop ? visitedStopIds.includes(currentStop.id) : false;

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto h-16 rounded-full bg-[#1C1A17]/90 backdrop-blur-lg border border-white/10 px-4 flex items-center justify-between shadow-2xl z-50 transition-all duration-200">
      {/* Route Completion Banner */}
      {isCompleted && (
        <div
          data-testid="completion-feedback"
          className="absolute -top-12 left-4 right-4 p-2 bg-[#2E7D59] border border-[#2E7D59] text-[#F4F1EA] rounded-full text-xs text-center font-semibold shadow-lg animate-fade-in flex items-center justify-center gap-2 backdrop-blur-md"
        >
          <span>🎉</span>
          <span>Route completed! All stops visited!</span>
        </div>
      )}

      {/* Scrollable Stop Indicator Timeline with Connecting Line */}
      <div
        ref={containerRef}
        data-testid="timeline-bar-container"
        className="flex-1 flex items-center gap-1.5 overflow-x-auto py-1 px-2.5 sm:px-3 scrollbar-none scroll-smooth"
      >
        {stops.map((stop, index) => {
          const slideIndex = index + 1;
          const isActive = activeIndex === slideIndex;
          const isVisited = visitedStopIds.includes(stop.id);
          const isPrevVisited = index > 0 && visitedStopIds.includes(stops[index - 1].id);

          return (
            <React.Fragment key={stop.id}>
              {/* Connecting Line Segment between stops */}
              {index > 0 && (
                <div
                  data-testid="timeline-connecting-line"
                  className={`h-0.5 w-3 sm:w-5 shrink-0 transition-colors duration-200 ${
                    isVisited && isPrevVisited ? 'bg-[#2E7D59]' : 'bg-[#3A342D]'
                  }`}
                />
              )}

              {/* Progress Stop Button */}
              <button
                type="button"
                ref={isActive ? activeStopRef : null}
                data-testid={`timeline-stop-${stop.order}`}
                onClick={() => onStopClick(slideIndex)}
                aria-label={`Jump to stop ${stop.order}: ${stop.name}`}
                className={`w-10 h-10 min-w-[48px] min-h-[48px] shrink-0 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 cursor-pointer focus:outline-none relative ${
                  isVisited
                    ? 'bg-[#2E7D59] bg-emerald-600 text-[#F4F1EA] text-white border-2 border-[#2E7D59]'
                    : 'bg-[#23201C] text-[#A69F95] border border-[#3A342D] hover:bg-[#2E2A24]'
                } ${
                  isActive
                    ? 'ring-4 ring-[var(--terracotta,#e07a5f)]/40 border-2 border-[var(--terracotta,#e07a5f)] border-[#D96B43] font-bold scale-105 z-10 text-[#F4F1EA]'
                    : ''
                }`}
              >
                <span className="flex items-center gap-0.5">
                  {isVisited && (
                    <svg
                      className="w-3 h-3 stroke-[3] shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span>{stop.order}</span>
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* 56x56px Terracotta FAB button [ ✓ ] with clear visual label / tooltip */}
      <div className="relative flex flex-col items-center shrink-0 ml-2">
        <span
          data-testid="visited-fab-label"
          className="absolute -top-7 right-0 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md bg-[#161412]/90 backdrop-blur-xs text-[#F4F1EA] border border-white/10 shadow-xs pointer-events-none transition-all duration-200 whitespace-nowrap z-20 flex items-center gap-1"
        >
          {isCurrentVisited ? 'Visited ✓' : 'Mark Visited'}
        </span>
        <button
          type="button"
          data-testid="visited-fab"
          onClick={onToggleVisited}
          aria-label={isCurrentVisited ? 'Mark as unvisited' : 'Mark as visited'}
          title={isCurrentVisited ? 'Mark as unvisited' : 'Mark as visited'}
          className={`w-[56px] h-[56px] min-w-[56px] min-h-[56px] rounded-full flex items-center justify-center font-bold shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
            isCurrentVisited
              ? 'bg-[#2E7D59] text-white hover:bg-[#256849] shadow-[#2E7D59]/30 ring-2 ring-[#2E7D59]/50'
              : 'bg-[#D96B43] text-white hover:bg-[#C05A34] shadow-[#D96B43]/30'
          }`}
        >
          <svg
            className="w-6 h-6 stroke-[3]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

