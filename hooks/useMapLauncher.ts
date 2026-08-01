'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MapProvider,
  MAP_PROVIDERS,
  MapProviderOption,
  getMapUrl,
  getPreferredMapProvider,
  setPreferredMapProvider as savePreferredMapProvider,
} from '@/lib/utils/maps';

export interface UseMapLauncherOptions {
  defaultProvider?: MapProvider;
  initialOpen?: boolean;
  initialCoordinates?: { lat: number; lng: number } | null;
  initialStopName?: string;
}

export interface UseMapLauncherReturn {
  preferredProvider: MapProvider;
  setPreferredProvider: (provider: MapProvider) => void;
  getLaunchUrl: (coords?: { lat: number; lng: number } | null, provider?: MapProvider) => string;
  isOpen: boolean;
  openMapLauncher: (coords?: { lat: number; lng: number }, stopName?: string) => void;
  closeMapLauncher: () => void;
  toggleMapLauncher: () => void;
  selectedCoordinates: { lat: number; lng: number } | null;
  selectedStopName: string | undefined;
  providers: MapProviderOption[];
}

export function useMapLauncher(options: UseMapLauncherOptions = {}): UseMapLauncherReturn {
  const {
    defaultProvider = 'google',
    initialOpen = false,
    initialCoordinates = null,
    initialStopName,
  } = options;

  const [preferredProvider, setPreferredProviderState] = useState<MapProvider>(defaultProvider);
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(
    initialCoordinates
  );
  const [selectedStopName, setSelectedStopName] = useState<string | undefined>(initialStopName);

  // Safely hydrate preferred provider from localStorage on client mount
  useEffect(() => {
    const saved = getPreferredMapProvider();
    if (saved) {
      setPreferredProviderState(saved);
    }
  }, []);

  const setPreferredProvider = useCallback((provider: MapProvider) => {
    setPreferredProviderState(provider);
    savePreferredMapProvider(provider);
  }, []);

  const getLaunchUrl = useCallback(
    (coords?: { lat: number; lng: number } | null, provider?: MapProvider) => {
      const targetCoords = coords || selectedCoordinates || { lat: 0, lng: 0 };
      const targetProvider = provider || preferredProvider || defaultProvider;
      return getMapUrl(targetProvider, targetCoords);
    },
    [preferredProvider, defaultProvider, selectedCoordinates]
  );

  const openMapLauncher = useCallback(
    (coords?: { lat: number; lng: number }, stopName?: string) => {
      if (coords) {
        setSelectedCoordinates(coords);
      }
      if (stopName !== undefined) {
        setSelectedStopName(stopName);
      }
      setIsOpen(true);
    },
    []
  );

  const closeMapLauncher = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleMapLauncher = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    preferredProvider,
    setPreferredProvider,
    getLaunchUrl,
    isOpen,
    openMapLauncher,
    closeMapLauncher,
    toggleMapLauncher,
    selectedCoordinates,
    selectedStopName,
    providers: MAP_PROVIDERS,
  };
}
