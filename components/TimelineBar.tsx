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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center transition-all duration-200 pointer-events-none max-w-[90vw]">
      {/* Route Completion Banner */}
      {isCompleted && (
        <div
          data-testid="completion-feedback"
          className="absolute -top-11 left-0 right-0 mx-auto w-max px-3 py-1 bg-[#2E7D59] border border-white/10 text-[#F4F1EA] rounded-full text-xs text-center font-medium shadow-xl flex items-center justify-center gap-1.5 backdrop-blur-md pointer-events-auto"
        >
          <span>🎉</span>
          <span>Route completed! All stops visited!</span>
        </div>
      )}

      {/* Ultra-Compact Minimal Floating Capsule */}
      <div className="pointer-events-auto flex items-center gap-1.5 bg-[#1C1A17]/85 backdrop-blur-xl border border-white/10 rounded-full px-2.5 py-1.5 shadow-2xl">
        {/* Timeline Sequence Nodes */}
        <div
          ref={containerRef}
          data-testid="timeline-bar-container"
          className="flex items-center gap-1.5 overflow-x-auto py-1 px-2.5 max-w-[65vw] scrollbar-none scroll-smooth"
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
                    className={`h-0.5 w-3 sm:w-4 shrink-0 transition-colors duration-200 ${
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
                  className={`w-9 h-9 min-w-[48px] min-h-[48px] shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 cursor-pointer focus:outline-none relative ${
                    isVisited
                      ? 'bg-[#2E7D59] bg-emerald-600 text-white border border-[#2E7D59] shadow-xs'
                      : 'bg-[#23201C] text-[#A69F95] border border-[#3A342D] hover:bg-[#2E2A24]'
                  } ${
                    isActive
                      ? 'ring-4 ring-[var(--terracotta,#e07a5f)]/40 border-[var(--terracotta,#e07a5f)] border-2 border-[#D96B43] text-[#F4F1EA] scale-105 z-10 shadow-md'
                      : ''
                  }`}
                >
                  <span className="flex items-center gap-0.5">
                    {isVisited && (
                      <svg
                        className="w-3 h-3 stroke-[3] shrink-0 text-white"
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

        {/* Vertical Separator Line */}
        <div className="w-px h-5 bg-white/20 mx-1 shrink-0" />

        {/* Visited Checkmark FAB Button */}
        <button
          type="button"
          data-testid="visited-fab"
          onClick={onToggleVisited}
          aria-label={isCurrentVisited ? 'Mark as unvisited' : 'Mark as visited'}
          title={isCurrentVisited ? 'Mark as unvisited' : 'Mark as visited'}
          className={`w-[56px] h-[56px] min-w-[56px] min-h-[56px] rounded-full flex items-center justify-center font-bold shadow-lg transition-all duration-200 active:scale-95 cursor-pointer shrink-0 ${
            isCurrentVisited
              ? 'bg-[#2E7D59] text-white hover:bg-[#256849] ring-2 ring-[#2E7D59]/50'
              : 'bg-[#D96B43] text-white hover:bg-[#C05A34] shadow-terracotta/20'
          }`}
        >
          <svg
            className="w-5 h-5 stroke-[3]"
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

