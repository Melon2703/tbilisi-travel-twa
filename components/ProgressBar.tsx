'use client';

import React from 'react';
import TimelineBar from './TimelineBar';
import { Stop } from '@/lib/types/route';

export interface ProgressBarProps {
  totalStops: number;
  currentStopIndex: number;
  visitedStops: Set<number | string>;
  onStopClick: (stopIndex: number) => void;
  onMarkVisited: () => void;
  isCurrentVisited: boolean;
}

export function ProgressBar({
  totalStops,
  currentStopIndex,
  visitedStops,
  onStopClick,
  onMarkVisited,
  isCurrentVisited,
}: ProgressBarProps) {
  const dummyStops: Stop[] = Array.from({ length: totalStops }, (_, i) => ({
    id: String(i + 1),
    order: i + 1,
    name: `Stop ${i + 1}`,
    neighborhood: '',
    coordinates: { lat: 0, lng: 0 },
    estimatedMinutes: 15,
    imageUrl: '',
    olyaTips: '',
  }));

  const visitedStopIds = Array.from(visitedStops).map(String);

  return (
    <TimelineBar
      stops={dummyStops}
      activeIndex={currentStopIndex + 1}
      visitedStopIds={visitedStopIds}
      onStopClick={(slideIndex) => onStopClick(slideIndex - 1)}
      onToggleVisited={onMarkVisited}
    />
  );
}

export default ProgressBar;

