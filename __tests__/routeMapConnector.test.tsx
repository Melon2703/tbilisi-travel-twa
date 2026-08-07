import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RouteOverviewMap from '@/components/RouteOverviewMap';
import RouteMapModal from '@/components/RouteMapModal';
import { Route, Stop } from '@/lib/types/route';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

const makeStop = (order: number, lat: number, lng: number): Stop => ({
  id: `stop-${order}`,
  order,
  stopType: 'attraction',
  name: `Stop ${order}`,
  neighborhood: 'Tbilisi',
  coordinates: { lat, lng },
  estimatedMinutes: 20,
  imageUrl: 'https://example.com/stop.jpg',
  olyaTips: 'A tip.',
});

const makeRoute = (stops: Stop[]): Route => ({
  id: 'connector-test-route',
  title: 'Connector Test Route',
  subtitle: 'Shape of the walk',
  heroImage: 'https://example.com/hero.jpg',
  introCopy: 'Intro',
  durationCategory: 'half-day',
  accessibility: 'moderate',
  vibes: ['architecture'],
  stops,
});

/** Opposite ends of the city — the longest kind of Route. */
const sprawlingRoute = makeRoute([
  makeStop(1, 41.6884, 44.7889),
  makeStop(2, 41.7095, 44.8048),
  makeStop(3, 41.6926, 44.8515),
  makeStop(4, 41.7325, 44.7712),
]);

const singleStopRoute = makeRoute([makeStop(1, 41.6938, 44.8015)]);

const renderPreview = (route: Route) =>
  render(
    <LanguageProvider initialLanguage="en">
      <RouteOverviewMap route={route} />
    </LanguageProvider>
  );

const renderModal = (route: Route) =>
  render(
    <LanguageProvider initialLanguage="en">
      <RouteMapModal route={route} isOpen onClose={() => {}} />
    </LanguageProvider>
  );

const parsePoints = (connector: Element) =>
  (connector.getAttribute('points') || '')
    .split(' ')
    .filter(Boolean)
    .map((pair) => {
      const [x, y] = pair.split(',').map(Number);
      return { x, y };
    });

/** Pin positions read back off the inline styles the maps project them to. */
const pinPositions = (testIdPrefix: string, count: number) =>
  Array.from({ length: count }, (_, i) => {
    const pin = screen.getByTestId(`${testIdPrefix}${i + 1}`) as HTMLElement;
    return { x: parseFloat(pin.style.left), y: parseFloat(pin.style.top) };
  });

describe('Route maps show the shape of the walk', () => {
  describe('preview map', () => {
    it('connects the stops in order', () => {
      renderPreview(sprawlingRoute);

      const connector = screen.getByTestId('map-sequence-connector');
      const points = parsePoints(connector);

      expect(points).toHaveLength(sprawlingRoute.stops.length);
      expect(points).toEqual(pinPositions('map-pin-', sprawlingRoute.stops.length));
    });

    it('draws the connector as a sequence indicator, not a road', () => {
      renderPreview(sprawlingRoute);

      const connector = screen.getByTestId('map-sequence-connector');
      expect(connector.getAttribute('stroke-dasharray')).toBeTruthy();
      expect(connector.getAttribute('fill')).toBe('none');
    });

    it('sits the connector behind the pins', () => {
      renderPreview(sprawlingRoute);

      const layer = screen.getByTestId('map-sequence-connector-layer');
      const pin = screen.getByTestId('map-pin-1');

      const zIndexOf = (el: Element) =>
        parseInt((el.getAttribute('class') || '').match(/z-(\d+)/)?.[1] || '0', 10);

      const layerZ = zIndexOf(layer);
      const pinZ = zIndexOf(pin);
      expect(layerZ).toBeLessThan(pinZ);
    });

    it('frames every stop inside the canvas, including the longest route', () => {
      const { container } = renderPreview(sprawlingRoute);

      const canvas = screen.getByTestId('map-tile-container');
      const { width, height } = canvas.getBoundingClientRect();
      const viewportWidth = width || 600;
      const viewportHeight = height || 250;

      for (const { x, y } of pinPositions('map-pin-', sprawlingRoute.stops.length)) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(viewportWidth);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(viewportHeight);
      }

      expect(container).toBeTruthy();
    });

    it('renders a single-stop route without a connector', () => {
      renderPreview(singleStopRoute);

      expect(screen.getByTestId('map-pin-1')).toBeInTheDocument();
      expect(screen.queryByTestId('map-sequence-connector')).not.toBeInTheDocument();
    });
  });

  describe('full-screen map', () => {
    it('uses the same connector treatment as the preview', () => {
      renderModal(sprawlingRoute);

      const connector = screen.getByTestId('modal-map-sequence-connector');
      expect(connector.getAttribute('stroke-dasharray')).toBeTruthy();
      expect(parsePoints(connector)).toEqual(
        pinPositions('modal-map-pin-position-', sprawlingRoute.stops.length)
      );
    });

    it('frames every stop inside the canvas', () => {
      renderModal(sprawlingRoute);

      const canvas = screen.getByTestId('interactive-map-viewport');
      const { width, height } = canvas.getBoundingClientRect();
      const viewportWidth = width || 800;
      const viewportHeight = height || 600;

      for (const { x, y } of pinPositions('modal-map-pin-position-', sprawlingRoute.stops.length)) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(viewportWidth);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(viewportHeight);
      }
    });

    it('moves the connector with the pins when panned', () => {
      renderModal(sprawlingRoute);

      const before = parsePoints(screen.getByTestId('modal-map-sequence-connector'));

      const viewport = screen.getByTestId('interactive-map-viewport');
      fireEvent.mouseDown(viewport, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(viewport, { clientX: 140, clientY: 75 });
      fireEvent.mouseUp(viewport);

      const after = parsePoints(screen.getByTestId('modal-map-sequence-connector'));

      expect(after).toEqual(before.map(({ x, y }) => ({ x: x + 40, y: y - 25 })));
      expect(after).toEqual(pinPositions('modal-map-pin-position-', sprawlingRoute.stops.length));
    });

    it('pans when the drag starts on a pin', () => {
      renderModal(sprawlingRoute);

      const before = parsePoints(screen.getByTestId('modal-map-sequence-connector'));

      const pin = screen.getByTestId('modal-map-pin-2');
      fireEvent.mouseDown(pin, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(pin, { clientX: 130, clientY: 100 });
      fireEvent.mouseUp(pin);

      const after = parsePoints(screen.getByTestId('modal-map-sequence-connector'));
      expect(after).toEqual(before.map(({ x, y }) => ({ x: x + 30, y })));
    });

    it('does not pan when the drag starts on the map controls', () => {
      renderModal(sprawlingRoute);

      const before = parsePoints(screen.getByTestId('modal-map-sequence-connector'));

      const zoomIn = screen.getByTestId('modal-map-zoom-in');
      fireEvent.mouseDown(zoomIn, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(zoomIn, { clientX: 130, clientY: 100 });
      fireEvent.mouseUp(zoomIn);

      expect(parsePoints(screen.getByTestId('modal-map-sequence-connector'))).toEqual(before);
    });

    it('moves the connector with the pins when zoomed', () => {
      renderModal(sprawlingRoute);

      const before = parsePoints(screen.getByTestId('modal-map-sequence-connector'));
      fireEvent.click(screen.getByTestId('modal-map-zoom-in'));
      const after = parsePoints(screen.getByTestId('modal-map-sequence-connector'));

      expect(after).not.toEqual(before);
      expect(after).toEqual(pinPositions('modal-map-pin-position-', sprawlingRoute.stops.length));
    });

    it('renders a single-stop route without a connector', () => {
      renderModal(singleStopRoute);

      expect(screen.getByTestId('modal-map-pin-1')).toBeInTheDocument();
      expect(screen.queryByTestId('modal-map-sequence-connector')).not.toBeInTheDocument();
    });
  });
});
