/**
 * Progress Position: the furthest Card the traveler has reached on a Route,
 * recorded by any navigation including swipe.
 *
 * Distinct from Visited State (`lib/utils/visited.ts`), which records the Stops a
 * traveler deliberately marked done and keeps its own per-Route keys. Progress
 * Position lives under one key holding a Route-id-to-position map, so the catalog
 * can read every Route's progress in a single read.
 *
 * A position is a carousel slide index: 0 is the Route Intro Card, 1..N are the
 * Stop Cards. Slide 0 is not progress worth resuming, so it is never stored.
 */

import type { Stop } from '@/lib/types/route';

export const PROGRESS_STORAGE_KEY = 'tbilisi_progress';

/** The first slide index that counts as progress — Slide 0 is the Route Intro Card. */
export const FIRST_RESUMABLE_POSITION = 1;

export type ProgressPositions = Record<string, number>;

export function getProgressPositions(): ProgressPositions {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!data) return {};
    const parsed = JSON.parse(data);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    const positions: ProgressPositions = {};
    for (const [routeId, position] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof position === 'number' && Number.isInteger(position) && position >= FIRST_RESUMABLE_POSITION) {
        positions[routeId] = position;
      }
    }
    return positions;
  } catch (error) {
    console.error('Error reading progress positions from localStorage:', error);
    return {};
  }
}

export function getProgressPosition(routeId: string): number | null {
  return getProgressPositions()[routeId] ?? null;
}

/**
 * The Stop a Progress Position names, or null when it names none — a Route that lost
 * Stops since the traveler walked it leaves a position past its end, which no longer
 * resumes anywhere.
 */
export function stopAtProgressPosition(stops: Stop[], position: number | null): Stop | null {
  if (position === null || position < FIRST_RESUMABLE_POSITION || position > stops.length) {
    return null;
  }
  return [...stops].sort((a, b) => a.order - b.order)[position - 1] ?? null;
}

/**
 * Record that the traveler reached `position` on `routeId`, keeping whichever is
 * furthest. Returns the stored position, or null if the Route has none.
 */
export function recordProgressPosition(routeId: string, position: number): number | null {
  if (typeof window === 'undefined') return null;

  const positions = getProgressPositions();
  const existing = positions[routeId] ?? null;

  if (!Number.isInteger(position) || position < FIRST_RESUMABLE_POSITION) return existing;
  if (existing !== null && existing >= position) return existing;

  try {
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ ...positions, [routeId]: position })
    );
    return position;
  } catch (error) {
    console.error('Error writing progress position to localStorage:', error);
    return existing;
  }
}
