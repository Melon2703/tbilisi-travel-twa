/**
 * Utility functions for persisting visited route stops in localStorage.
 * Format key: tbilisi_visited_[routeId]
 */

export function getVisitedStorageKey(routeId: string): string {
  return `tbilisi_visited_${routeId}`;
}

export function getVisitedStops(routeId: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(getVisitedStorageKey(routeId));
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading visited stops from localStorage:', error);
    return [];
  }
}

export function isStopVisited(routeId: string, stopId: string): boolean {
  const visited = getVisitedStops(routeId);
  return visited.includes(stopId);
}

export function toggleVisitedStop(
  routeId: string,
  stopId: string
): { visited: string[]; isVisitedNow: boolean } {
  if (typeof window === 'undefined') {
    return { visited: [], isVisitedNow: false };
  }
  try {
    const current = getVisitedStops(routeId);
    const exists = current.includes(stopId);
    let updated: string[];

    if (exists) {
      updated = current.filter((id) => id !== stopId);
    } else {
      updated = [...current, stopId];
    }

    localStorage.setItem(getVisitedStorageKey(routeId), JSON.stringify(updated));
    return { visited: updated, isVisitedNow: !exists };
  } catch (error) {
    console.error('Error writing visited stops to localStorage:', error);
    return { visited: [], isVisitedNow: false };
  }
}

export function setVisitedStops(routeId: string, stops: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getVisitedStorageKey(routeId), JSON.stringify(stops));
  } catch (error) {
    console.error('Error setting visited stops in localStorage:', error);
  }
}
