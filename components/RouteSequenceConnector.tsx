'use client';

import React from 'react';
import { ScreenPoint, Viewport, buildConnectorPoints } from '@/lib/utils/mapFraming';

export interface RouteSequenceConnectorProps {
  /** Projected Stop positions, in Route order. */
  points: ScreenPoint[];
  viewport: Viewport;
  /** Distinguishes the preview and full-screen instances in the DOM. */
  testId: string;
}

/**
 * The dashed line joining a Route's Stops in order. Deliberately not road-like:
 * a straight segment through Tbilisi's terrain would be a lie, so the connector
 * conveys order and shape only, and turn-by-turn stays with the Map Providers
 * (ADR 0005). Renders nothing when there is nothing to connect.
 */
export default function RouteSequenceConnector({
  points,
  viewport,
  testId,
}: RouteSequenceConnectorProps) {
  const connectorPoints = buildConnectorPoints(points);

  if (!connectorPoints) return null;

  return (
    <svg
      data-testid={`${testId}-layer`}
      className="absolute inset-0 z-10 pointer-events-none overflow-visible"
      width={viewport.width}
      height={viewport.height}
      aria-hidden="true"
    >
      <polyline
        data-testid={testId}
        points={connectorPoints}
        fill="none"
        stroke="#C4572A"
        strokeWidth={3}
        strokeDasharray="8 7"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
    </svg>
  );
}
