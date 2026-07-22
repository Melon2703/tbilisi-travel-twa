'use client';

import React, { useEffect, useRef } from 'react';
import { Stop } from '@/lib/types/route';

export interface TimelineBarProps {
  stops: Stop[];
  activeIndex: number;
  visitedStopIds: string[];
  onNodeClick: (slideIndex: number) => void;
  onToggleVisited: () => void;
  isCompleted?: boolean;
}

export default function TimelineBar({
  stops,
  activeIndex,
  visitedStopIds,
  onNodeClick,
  onToggleVisited,
  isCompleted = false,
}: TimelineBarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeNodeRef = useRef<HTMLButtonElement | null>(null);

  // Auto-center active stop node in scrollable container
  useEffect(() => {
    if (activeNodeRef.current) {
      activeNodeRef.current.scrollIntoView?.({
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
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg px-3 py-2.5 sm:px-6">
      {/* Optional Completion Banner */}
      {isCompleted && (
        <div
          data-testid="completion-feedback"
          className="mb-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs sm:text-sm text-center font-medium shadow-sm animate-fade-in flex items-center justify-center gap-1.5"
        >
          <span>🎉</span>
          <span>Route completed! All stops visited!</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        {/* Scrollable Node Timeline */}
        <div
          ref={containerRef}
          data-testid="timeline-bar-container"
          className="flex-1 flex items-center gap-1.5 overflow-x-auto py-1 px-1 scrollbar-none scroll-smooth"
        >
          {stops.map((stop, index) => {
            const slideIndex = index + 1;
            const isActive = activeIndex === slideIndex;
            const isVisited = visitedStopIds.includes(stop.id);

            return (
              <React.Fragment key={stop.id}>
                {index > 0 && (
                  <div
                    className={`w-3 h-0.5 shrink-0 transition-colors ${
                      visitedStopIds.includes(stops[index - 1].id) && isVisited
                        ? 'bg-emerald-500'
                        : 'bg-stone-300'
                    }`}
                  />
                )}
                <button
                  type="button"
                  ref={isActive ? activeNodeRef : null}
                  data-testid={`timeline-node-${stop.order}`}
                  onClick={() => onNodeClick(slideIndex)}
                  aria-label={`Jump to stop ${stop.order}: ${stop.name}`}
                  className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 cursor-pointer focus:outline-none ${
                    isVisited
                      ? 'bg-emerald-600 text-white border-2 border-emerald-600'
                      : 'bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200'
                  } ${
                    isActive
                      ? 'ring-4 ring-[#e07a5f]/40 border-2 border-[#e07a5f] font-bold scale-110 z-10'
                      : ''
                  }`}
                >
                  {isVisited ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="w-4 h-4 stroke-[3]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  ) : (
                    stop.order
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* 56x56px Visited Floating Action Button (FAB) */}
        <button
          type="button"
          data-testid="visited-fab"
          onClick={onToggleVisited}
          aria-label={isCurrentVisited ? 'Mark as unvisited' : 'Mark as visited'}
          className={`w-[56px] h-[56px] min-w-[56px] min-h-[56px] rounded-full flex items-center justify-center font-bold shadow-md transition-all duration-200 active:scale-95 cursor-pointer shrink-0 ${
            isCurrentVisited
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30 ring-2 ring-emerald-400/50'
              : 'bg-[#e07a5f] text-white hover:bg-[#d0694e] shadow-orange-500/30'
          }`}
        >
          <svg
            className="w-7 h-7 stroke-[3]"
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
