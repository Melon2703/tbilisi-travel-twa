import { describe, it, expect, beforeEach } from 'vitest';
import {
  PROGRESS_STORAGE_KEY,
  getProgressPosition,
  getProgressPositions,
  recordProgressPosition,
} from '@/lib/utils/progress';

describe('Progress Position storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reports no Progress Position for a Route never walked', () => {
    expect(getProgressPosition('sololaki')).toBeNull();
    expect(getProgressPositions()).toEqual({});
  });

  it('records the Card reached on a Route', () => {
    recordProgressPosition('sololaki', 3);

    expect(getProgressPosition('sololaki')).toBe(3);
  });

  it('keeps the furthest Card reached rather than the most recent', () => {
    recordProgressPosition('sololaki', 4);
    recordProgressPosition('sololaki', 2);

    expect(getProgressPosition('sololaki')).toBe(4);
  });

  it('holds every Route under a single key as a Route-id-to-position map', () => {
    recordProgressPosition('sololaki', 2);
    recordProgressPosition('vera', 5);

    expect(getProgressPositions()).toEqual({ sololaki: 2, vera: 5 });
    expect(JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) as string)).toEqual({
      sololaki: 2,
      vera: 5,
    });
    expect(Object.keys(localStorage)).toEqual([PROGRESS_STORAGE_KEY]);
  });

  it('does not treat the Route Intro Card as progress worth resuming', () => {
    recordProgressPosition('sololaki', 0);

    expect(getProgressPosition('sololaki')).toBeNull();
    expect(getProgressPositions()).toEqual({});
  });

  it('leaves an existing position untouched when the traveler returns to the overview', () => {
    recordProgressPosition('sololaki', 3);
    recordProgressPosition('sololaki', 0);

    expect(getProgressPosition('sololaki')).toBe(3);
  });

  it('survives a corrupted or foreign value under the key', () => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, 'not json');
    expect(getProgressPositions()).toEqual({});

    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(['sololaki']));
    expect(getProgressPosition('sololaki')).toBeNull();

    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ sololaki: 'far' }));
    expect(getProgressPosition('sololaki')).toBeNull();

    // A corrupted store still accepts new writes.
    recordProgressPosition('sololaki', 2);
    expect(getProgressPosition('sololaki')).toBe(2);
  });

  it('does not touch the per-Route Visited State keys', () => {
    localStorage.setItem('tbilisi_visited_sololaki', JSON.stringify(['stop-1']));

    recordProgressPosition('sololaki', 2);

    expect(localStorage.getItem('tbilisi_visited_sololaki')).toBe(JSON.stringify(['stop-1']));
  });
});
