'use client';

import React from 'react';
import TimelineBar, { TimelineBarProps } from './TimelineBar';

export function ProgressBar(props: {
  totalStops: number;
  currentStopIndex: number;
  visitedStops: Set<number>;
  onStopClick: (stopIndex: number) => void;
  onMarkVisited: () => void;
  isCurrentVisited: boolean;
}) {
  const dummyStops = Array.from({ length: props.totalStops }, (_, i) => ({
    id: String(i + 1),
    order: i + 1,
    name: `Stop ${i + 1}`,
    neighborhood: '',
    coordinates: { lat: 0, lng: 0 },
    estimatedMinutes: 15,
    imageUrl: '',
    olyaTips: '',
  }));

  const visitedStopIds = Array.from(props.visitedStops).map(String);

  return (
    <TimelineBar
      stops={dummyStops}
      activeIndex={props.currentStopIndex + 1}
      visitedStopIds={visitedStopIds}
      onStopClick={(slideIndex) => props.onStopClick(slideIndex - 1)}
      onToggleVisited={props.onMarkVisited}
    />
  );
}

export default ProgressBar;
