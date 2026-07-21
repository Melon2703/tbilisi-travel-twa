import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getMapUrl,
  getPreferredMapProvider,
  setPreferredMapProvider,
  MAP_PROVIDERS,
  MapProvider,
} from '@/lib/utils/maps';

describe('Map Navigation Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getMapUrl', () => {
    const coords = { lat: 41.6918, lng: 44.7972 };

    it('generates correct Google Maps universal link', () => {
      const url = getMapUrl('google', coords);
      expect(url).toBe('https://www.google.com/maps/search/?api=1&query=41.6918,44.7972');
    });

    it('generates correct Apple Maps universal link', () => {
      const url = getMapUrl('apple', coords);
      expect(url).toBe('https://maps.apple.com/?q=41.6918,44.7972');
    });

    it('generates correct Yandex Maps universal link with lng,lat coordinate order', () => {
      const url = getMapUrl('yandex', coords);
      expect(url).toBe('https://yandex.com/maps/?pt=44.7972,41.6918&z=17');
    });
  });

  describe('localStorage Map Provider persistence', () => {
    it('returns null when no provider is saved', () => {
      expect(getPreferredMapProvider()).toBeNull();
    });

    it('saves and retrieves preferred map provider in localStorage', () => {
      setPreferredMapProvider('apple');
      expect(getPreferredMapProvider()).toBe('apple');
    });

    it('handles invalid stored provider gracefully', () => {
      localStorage.setItem('tbilisi_preferred_map_provider', 'invalid-provider');
      expect(getPreferredMapProvider()).toBeNull();
    });
  });

  describe('MAP_PROVIDERS catalog', () => {
    it('contains google, apple, and yandex map providers', () => {
      const providerIds = MAP_PROVIDERS.map((p) => p.id);
      expect(providerIds).toEqual(['google', 'apple', 'yandex']);
    });
  });
});
