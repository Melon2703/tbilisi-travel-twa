import { describe, it, expect } from 'vitest';
import {
  MAX_MAP_ZOOM,
  MIN_MAP_ZOOM,
  buildConnectorPoints,
  buildTileGrid,
  frameStops,
  projectCoordinates,
} from '@/lib/utils/mapFraming';
import { Coordinates } from '@/lib/types/route';

const viewport = { width: 360, height: 240 };

/** A compact cluster of stops — a few hundred metres across. */
const compactRoute: Coordinates[] = [
  { lat: 41.6938, lng: 44.8015 },
  { lat: 41.6952, lng: 44.8043 },
  { lat: 41.6961, lng: 44.8027 },
];

/** The longest kind of Route — opposite ends of the city. */
const sprawlingRoute: Coordinates[] = [
  { lat: 41.6884, lng: 44.7889 },
  { lat: 41.7095, lng: 44.8048 },
  { lat: 41.6926, lng: 44.8515 },
  { lat: 41.7325, lng: 44.7712 },
];

function projectAll(coordinates: Coordinates[], padding = 0) {
  const framing = frameStops(coordinates, viewport, { padding });
  return coordinates.map((c) => projectCoordinates(c, framing, viewport));
}

describe('frameStops', () => {
  it('keeps every stop of a sprawling route inside the canvas', () => {
    const projected = projectAll(sprawlingRoute);

    for (const { x, y } of projected) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(viewport.width);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(viewport.height);
    }
  });

  it('honours padding so pins never sit flush against the edge', () => {
    const padding = 40;
    const projected = projectAll(sprawlingRoute, padding);

    for (const { x, y } of projected) {
      expect(x).toBeGreaterThanOrEqual(padding);
      expect(x).toBeLessThanOrEqual(viewport.width - padding);
      expect(y).toBeGreaterThanOrEqual(padding);
      expect(y).toBeLessThanOrEqual(viewport.height - padding);
    }
  });

  it('zooms in further on a compact route than on a sprawling one', () => {
    const compact = frameStops(compactRoute, viewport);
    const sprawling = frameStops(sprawlingRoute, viewport);

    expect(compact.zoom).toBeGreaterThan(sprawling.zoom);
  });

  it('centres a single-stop route at maximum zoom', () => {
    const only = { lat: 41.6938, lng: 44.8015 };
    const framing = frameStops([only], viewport);

    expect(framing.zoom).toBe(MAX_MAP_ZOOM);
    expect(framing.center).toEqual(only);

    const { x, y } = projectCoordinates(only, framing, viewport);
    expect(x).toBeCloseTo(viewport.width / 2, 1);
    expect(y).toBeCloseTo(viewport.height / 2, 1);
  });

  it('clamps zoom to the tile range the map can serve', () => {
    const wholeWorld: Coordinates[] = [
      { lat: -60, lng: -170 },
      { lat: 60, lng: 170 },
    ];

    expect(frameStops(wholeWorld, viewport).zoom).toBe(MIN_MAP_ZOOM);
    expect(frameStops(compactRoute, { width: 20000, height: 20000 }).zoom).toBe(MAX_MAP_ZOOM);
  });

  it('falls back to a usable framing when there are no stops', () => {
    const framing = frameStops([], viewport);

    expect(framing.zoom).toBeGreaterThanOrEqual(MIN_MAP_ZOOM);
    expect(framing.zoom).toBeLessThanOrEqual(MAX_MAP_ZOOM);
    expect(Number.isFinite(framing.center.lat)).toBe(true);
    expect(Number.isFinite(framing.center.lng)).toBe(true);
  });

  it('applies a pan offset without changing the framing', () => {
    const framing = frameStops(compactRoute, viewport);
    const at = projectCoordinates(compactRoute[0], framing, viewport);
    const panned = projectCoordinates(compactRoute[0], framing, viewport, { x: 30, y: -12 });

    expect(panned.x).toBeCloseTo(at.x + 30, 3);
    expect(panned.y).toBeCloseTo(at.y - 12, 3);
  });
});

describe('buildTileGrid', () => {
  it('covers the whole canvas at the framing zoom', () => {
    const framing = frameStops(sprawlingRoute, viewport);
    const tiles = buildTileGrid(framing, viewport);

    expect(tiles.length).toBeGreaterThan(0);
    expect(tiles.every((tile) => tile.url.includes(`/voyager/${framing.zoom}/`))).toBe(true);
    expect(Math.min(...tiles.map((t) => t.left))).toBeLessThanOrEqual(0);
    expect(Math.min(...tiles.map((t) => t.top))).toBeLessThanOrEqual(0);
    expect(Math.max(...tiles.map((t) => t.left)) + 256).toBeGreaterThanOrEqual(viewport.width);
    expect(Math.max(...tiles.map((t) => t.top)) + 256).toBeGreaterThanOrEqual(viewport.height);
  });

  it('shifts with the pan offset', () => {
    const framing = frameStops(sprawlingRoute, viewport);
    const [first] = buildTileGrid(framing, viewport);
    const panned = buildTileGrid(framing, viewport, { x: 20, y: 20 }).find(
      (tile) => tile.key === first.key
    )!;

    expect(panned.left).toBeCloseTo(first.left + 20, 3);
    expect(panned.top).toBeCloseTo(first.top + 20, 3);
  });
});

describe('buildConnectorPoints', () => {
  it('joins the stops in order', () => {
    expect(
      buildConnectorPoints([
        { x: 10, y: 20 },
        { x: 30.5, y: 40 },
        { x: 50, y: 60 },
      ])
    ).toBe('10,20 30.5,40 50,60');
  });

  it('draws nothing for a single-stop route', () => {
    expect(buildConnectorPoints([{ x: 10, y: 20 }])).toBeNull();
    expect(buildConnectorPoints([])).toBeNull();
  });
});
