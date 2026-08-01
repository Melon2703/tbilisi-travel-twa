export type MapProvider = 'google' | 'apple' | 'yandex';

export interface MapProviderOption {
  id: MapProvider;
  name: string;
  subtitle: string;
  iconName: string;
}

export const MAP_STORAGE_KEY = 'tbilisi_preferred_map_provider';

export const MAP_PROVIDERS: MapProviderOption[] = [
  {
    id: 'google',
    name: 'Google Maps',
    subtitle: 'Universal turn-by-turn navigation',
    iconName: 'google',
  },
  {
    id: 'apple',
    name: 'Apple Maps',
    subtitle: 'Native iOS & macOS navigation',
    iconName: 'apple',
  },
  {
    id: 'yandex',
    name: 'Yandex Maps',
    subtitle: 'Detailed regional walking routes',
    iconName: 'yandex',
  },
];

/**
 * Low-level map URL resolver.
 * @deprecated Prefer using `getLaunchUrl` from `useMapLauncher()` hook.
 */
export function getMapUrl(provider: MapProvider, coords: { lat: number; lng: number }): string {
  const { lat, lng } = coords;
  switch (provider) {
    case 'google':
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    case 'apple':
      return `https://maps.apple.com/?q=${lat},${lng}`;
    case 'yandex':
      return `https://yandex.com/maps/?pt=${lng},${lat}&z=17`;
  }
}

/**
 * Low-level reader for preferred map provider in localStorage.
 * @deprecated Prefer using the MapLauncher seam via `useMapLauncher()` hook.
 */
export function getPreferredMapProvider(): MapProvider | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = localStorage.getItem(MAP_STORAGE_KEY);
    if (value === 'google' || value === 'apple' || value === 'yandex') {
      return value;
    }
  } catch (e) {
    console.error('Failed to access localStorage for map provider preference:', e);
  }
  return null;
}

/**
 * Low-level writer for preferred map provider in localStorage.
 * @deprecated Prefer using the MapLauncher seam via `useMapLauncher()` hook.
 */
export function setPreferredMapProvider(provider: MapProvider): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MAP_STORAGE_KEY, provider);
  } catch (e) {
    console.error('Failed to save map provider preference to localStorage:', e);
  }
}

