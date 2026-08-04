'use client';

import React from 'react';
import { SiGooglemaps } from 'react-icons/si';
import { FaYandex, FaApple, FaXmark } from 'react-icons/fa6';
import { MapProvider } from '@/lib/utils/maps';
import { COLORS } from '@/lib/theme/tokens';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useMapLauncher } from '@/hooks/useMapLauncher';

export interface MapProviderBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates: { lat: number; lng: number };
  stopName?: string;
}

export default function MapProviderBottomSheet({
  isOpen,
  onClose,
  coordinates,
  stopName,
}: MapProviderBottomSheetProps) {
  const { t } = useLanguage();
  const { preferredProvider, setPreferredProvider, getLaunchUrl, providers } = useMapLauncher();

  if (!isOpen) return null;

  const handleSelectProvider = (providerId: MapProvider) => {
    setPreferredProvider(providerId);
  };

  const getProviderIcon = (providerId: MapProvider) => {
    switch (providerId) {
      case 'google':
        return <SiGooglemaps className="w-6 h-6 shrink-0" style={{ color: COLORS.brand.googleMaps }} />;
      case 'apple':
        return <FaApple className="w-6 h-6 shrink-0 text-slate-800" />;
      case 'yandex':
        return <FaYandex className="w-6 h-6 shrink-0" style={{ color: COLORS.brand.yandexMaps }} />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-bottom-sheet-title"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-xs transition-opacity duration-200"
    >
      {/* Backdrop overlay click handler */}
      <div
        data-testid="bottom-sheet-backdrop"
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Card Container */}
      <div className="relative z-10 w-full max-w-md bg-[#FAF7F2] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border-t sm:border border-[#E5E5E0] space-y-4 animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
        {/* Top Handle Bar for mobile drawer feel */}
        <div className="w-12 h-1.5 bg-[#E5E5E0] rounded-full mx-auto sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div>
            <h3
              id="map-bottom-sheet-title"
              className="text-xl font-bold tracking-tight text-[#1C1008] font-sans"
            >
              {t('openInMap') || 'Open in Maps'}
            </h3>
            {stopName && (
              <p className="text-xs text-[#7A6552] font-medium mt-0.5 line-clamp-1">
                {stopName}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-[#FAFAF7] border border-[#E5E5E0] flex items-center justify-center text-[#7A6552] active:scale-95 transition-all"
          >
            <FaXmark className="w-4 h-4" />
          </button>
        </div>

        {/* Map Provider List */}
        <div className="space-y-2.5 pt-1">
          {providers.map((provider) => {
            const isPreferred = preferredProvider === provider.id;
            const url = getLaunchUrl(coordinates, provider.id, stopName);

            return (
              <a
                key={provider.id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleSelectProvider(provider.id)}
                className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                  isPreferred
                    ? 'bg-white border-[#C4572A] shadow-xs'
                    : 'bg-white/80 border-[#E5E5E0]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2 rounded-xl bg-[#FAFAF7] border border-[#E5E5E0] shrink-0">
                    {getProviderIcon(provider.id)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-[#1C1008] font-sans">
                        {provider.name}
                      </span>
                      {isPreferred && (
                        <span
                          data-testid={`preferred-provider-badge-${provider.id}`}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#C4572A]/10 text-[#C4572A]"
                        >
                          Preferred
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#7A6552] truncate mt-0.5">
                      {provider.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-semibold text-[#C4572A] shrink-0 pl-2">
                  Launch ↗
                </div>
              </a>
            );
          })}
        </div>

        <div className="text-center pt-2 text-[11px] text-[#7A6552]">
          Your map selection is saved for future route navigation.
        </div>
      </div>
    </div>
  );
}

