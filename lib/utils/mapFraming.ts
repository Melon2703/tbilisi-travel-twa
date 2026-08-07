import { Coordinates } from '../types/route';

/**
 * Web Mercator framing for the Route maps: how far to zoom out so the whole
 * Route is on canvas, and where each Stop lands once it is.
 *
 * Both Route maps (preview and full-screen) render raster tiles at an integer
 * zoom, so framing resolves to a tile zoom the map can actually serve rather
 * than a continuous scale.
 */

/** Widest view the tile set is worth serving for a city Route. */
export const MIN_MAP_ZOOM = 11;
/** Closest view — also the framing for a Route with a single Stop. */
export const MAX_MAP_ZOOM = 18;

/** Tile edge in CSS pixels. */
const TILE_SIZE = 256;

/** Centre of Tbilisi — the framing for a Route with no Stops to frame. */
const FALLBACK_CENTER: Coordinates = { lat: 41.6938, lng: 44.8015 };

export interface Viewport {
  width: number;
  height: number;
}

export interface MapFraming {
  zoom: number;
  center: Coordinates;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface FrameStopsOptions {
  /** Pixels kept clear on every edge, so pins and their badges stay readable. */
  padding?: number;
}

export function lngToWorldX(lng: number, zoom: number): number {
  return ((lng + 180) / 360) * TILE_SIZE * Math.pow(2, zoom);
}

export function latToWorldY(lat: number, zoom: number): number {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const clampedSin = Math.max(-0.9999, Math.min(0.9999, sinLat));
  return (
    (0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI)) *
    TILE_SIZE *
    Math.pow(2, zoom)
  );
}

/** Rounded to 3 decimals so server and client agree on every pixel. */
export function roundCoord(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * The tile zoom at which every coordinate fits inside the viewport, minus the
 * padding, with the bounding box centred.
 */
export function frameStops(
  coordinates: Coordinates[],
  viewport: Viewport,
  { padding = 0 }: FrameStopsOptions = {}
): MapFraming {
  if (coordinates.length === 0) {
    return { zoom: MAX_MAP_ZOOM, center: FALLBACK_CENTER };
  }

  const lats = coordinates.map((c) => c.lat);
  const lngs = coordinates.map((c) => c.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const center: Coordinates = {
    lat: (minLat + maxLat) / 2,
    lng: (minLng + maxLng) / 2,
  };

  // Span of the Route measured at zoom 0; every zoom level doubles it.
  const spanX = lngToWorldX(maxLng, 0) - lngToWorldX(minLng, 0);
  const spanY = latToWorldY(minLat, 0) - latToWorldY(maxLat, 0);

  const availableWidth = Math.max(1, viewport.width - padding * 2);
  const availableHeight = Math.max(1, viewport.height - padding * 2);

  const fits = (span: number, available: number) =>
    span <= 0 ? Infinity : Math.log2(available / span);

  const zoom = Math.floor(Math.min(fits(spanX, availableWidth), fits(spanY, availableHeight)));

  return { zoom: clampZoom(zoom), center };
}

export function clampZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return MAX_MAP_ZOOM;
  return Math.max(MIN_MAP_ZOOM, Math.min(MAX_MAP_ZOOM, zoom));
}

/** Where a coordinate lands on the canvas under a framing, after any pan. */
export function projectCoordinates(
  coordinates: Coordinates,
  { zoom, center }: MapFraming,
  viewport: Viewport,
  pan: ScreenPoint = { x: 0, y: 0 }
): ScreenPoint {
  const x = lngToWorldX(coordinates.lng, zoom) - lngToWorldX(center.lng, zoom);
  const y = latToWorldY(coordinates.lat, zoom) - latToWorldY(center.lat, zoom);

  return {
    x: roundCoord(x + viewport.width / 2 + pan.x),
    y: roundCoord(y + viewport.height / 2 + pan.y),
  };
}

export interface MapTile {
  key: string;
  url: string;
  left: number;
  top: number;
}

/** The raster tiles that cover the canvas under a framing, after any pan. */
export function buildTileGrid(
  framing: MapFraming,
  viewport: Viewport,
  pan: ScreenPoint = { x: 0, y: 0 }
): MapTile[] {
  const { zoom, center } = framing;
  const originX = lngToWorldX(center.lng, zoom) - viewport.width / 2 - pan.x;
  const originY = latToWorldY(center.lat, zoom) - viewport.height / 2 - pan.y;

  const startTileX = Math.floor(originX / TILE_SIZE);
  const endTileX = Math.floor((originX + viewport.width) / TILE_SIZE);
  const startTileY = Math.floor(originY / TILE_SIZE);
  const endTileY = Math.floor((originY + viewport.height) / TILE_SIZE);

  const tiles: MapTile[] = [];

  for (let tx = startTileX; tx <= endTileX; tx++) {
    for (let ty = startTileY; ty <= endTileY; ty++) {
      tiles.push({
        key: `${zoom}-${tx}-${ty}`,
        url: `https://a.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${tx}/${ty}@2x.png`,
        left: roundCoord(tx * TILE_SIZE - originX),
        top: roundCoord(ty * TILE_SIZE - originY),
      });
    }
  }

  return tiles;
}

/**
 * The sequence connector's geometry: Stops joined in order. Deliberately a
 * straight run between Stops — it conveys order and shape, never a walkable
 * path (ADR 0005). `null` when there is nothing to connect.
 */
export function buildConnectorPoints(points: ScreenPoint[]): string | null {
  if (points.length < 2) return null;
  return points.map(({ x, y }) => `${x},${y}`).join(' ');
}
