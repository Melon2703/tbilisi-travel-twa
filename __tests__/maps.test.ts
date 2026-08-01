import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useMapLauncher } from '@/hooks/useMapLauncher';
import { MAP_STORAGE_KEY } from '@/lib/utils/maps';

describe('MapLauncher Seam Contract & Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getLaunchUrl navigation link resolution', () => {
    const coords = { lat: 41.6918, lng: 44.7972 };

    it('generates correct Google Maps universal link', () => {
      const { result } = renderHook(() => useMapLauncher());
      const url = result.current.getLaunchUrl(coords, 'google');
      expect(url).toBe('https://www.google.com/maps/search/?api=1&query=41.6918,44.7972');
    });

    it('generates correct Apple Maps universal link', () => {
      const { result } = renderHook(() => useMapLauncher());
      const url = result.current.getLaunchUrl(coords, 'apple');
      expect(url).toBe('https://maps.apple.com/?q=41.6918,44.7972');
    });

    it('generates correct Yandex Maps universal link with lng,lat coordinate order', () => {
      const { result } = renderHook(() => useMapLauncher());
      const url = result.current.getLaunchUrl(coords, 'yandex');
      expect(url).toBe('https://yandex.com/maps/?pt=44.7972,41.6918&z=17');
    });
  });

  describe('localStorage Map Provider persistence across MapLauncher seam', () => {
    it('defaults to google when no provider is saved in localStorage', () => {
      const { result } = renderHook(() => useMapLauncher());
      expect(result.current.preferredProvider).toBe('google');
    });

    it('saves and retrieves preferred map provider in localStorage via MapLauncher seam', () => {
      const { result } = renderHook(() => useMapLauncher());

      act(() => {
        result.current.setPreferredProvider('apple');
      });

      expect(result.current.preferredProvider).toBe('apple');
      expect(localStorage.getItem(MAP_STORAGE_KEY)).toBe('apple');
    });

    it('handles invalid stored provider gracefully by falling back to google default', () => {
      localStorage.setItem(MAP_STORAGE_KEY, 'invalid-provider');
      const { result } = renderHook(() => useMapLauncher());
      expect(result.current.preferredProvider).toBe('google');
    });
  });

  describe('providers catalog seam', () => {
    it('contains google, apple, and yandex map providers with expected metadata', () => {
      const { result } = renderHook(() => useMapLauncher());
      const providerIds = result.current.providers.map((p) => p.id);
      expect(providerIds).toEqual(['google', 'apple', 'yandex']);
    });
  });
});

