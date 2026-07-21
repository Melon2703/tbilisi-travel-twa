'use client';

import React, { useEffect, useState } from 'react';
import {
  MAP_PROVIDERS,
  MapProvider,
  getMapUrl,
  getPreferredMapProvider,
  setPreferredMapProvider,
} from '@/lib/utils/maps';

interface MapProviderSheetProps {
  isOpen: boolean;
  onClose: () => void;
  stopName: string;
  coordinates: { lat: number; lng: number };
}

export default function MapProviderSheet({
  isOpen,
  onClose,
  stopName,
  coordinates,
}: MapProviderSheetProps) {
  const [preferredProvider, setPreferredProvider] = useState<MapProvider | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPreferredProvider(getPreferredMapProvider());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectProvider = (providerId: MapProvider) => {
    setPreferredMapProvider(providerId);
    setPreferredProvider(providerId);
    const url = getMapUrl(providerId, coordinates);
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-sheet-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md bg-[var(--twa-bg-color,#f7f4ef)] text-[var(--twa-text-color,#1f2421)] rounded-t-3xl sm:rounded-2xl border border-[var(--warm-stone)] shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom-6 duration-200">
        {/* Sheet Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <div className="space-y-1">
            <h3
              id="map-sheet-title"
              className="text-lg font-bold leading-snug text-[var(--tbilisi-slate)]"
            >
              Open in Navigation App
            </h3>
            <p className="text-xs text-[var(--twa-hint-color,#6b7280)] line-clamp-1">
              {stopName}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-[var(--tbilisi-slate)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Provider List */}
        <div className="space-y-3">
          {MAP_PROVIDERS.map((provider) => {
            const isPreferred = preferredProvider === provider.id;

            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => handleSelectProvider(provider.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isPreferred
                    ? 'border-[var(--terracotta)] bg-[var(--warm-stone)] shadow-sm'
                    : 'border-black/10 hover:border-black/20 bg-white/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* App Icon Indicator */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                      provider.id === 'google'
                        ? 'bg-blue-600 text-white'
                        : provider.id === 'apple'
                        ? 'bg-slate-900 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {provider.id === 'google' ? 'G' : provider.id === 'apple' ? '' : 'Y'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--tbilisi-slate)]">
                        {provider.name}
                      </span>
                      {isPreferred && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-[var(--terracotta)] text-white px-2 py-0.5 rounded-full">
                          Preferred
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--twa-hint-color,#6b7280)] block">
                      {provider.subtitle}
                    </span>
                  </div>
                </div>

                <svg
                  className="w-5 h-5 text-[var(--terracotta)] shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-center text-[var(--twa-hint-color,#6b7280)] pt-1">
          Your choice will be saved as your default navigation app.
        </p>
      </div>
    </div>
  );
}
