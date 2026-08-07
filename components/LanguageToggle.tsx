'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Language } from '@/lib/i18n/types';

/**
 * The one way to change language, on every surface that offers one — the Route Intro
 * Card hero and the catalog. Each label is written in its own language, so a traveler
 * who cannot read the current one can still find the way out.
 */
const OPTIONS: { value: Language; label: string; ariaLabel: string }[] = [
  { value: 'en', label: 'EN', ariaLabel: 'Switch to English' },
  { value: 'ru', label: 'RU', ariaLabel: 'Переключить на русский' },
];

export interface LanguageToggleProps {
  /** `hero` sits over a photo; `plain` sits on the cream catalog background. */
  tone?: 'hero' | 'plain';
  className?: string;
}

export default function LanguageToggle({ tone = 'hero', className = '' }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  const shell =
    tone === 'hero'
      ? 'bg-black/60 backdrop-blur-md border-white/20'
      : 'bg-[#FFF8F3] border-[#C4572A]/20';
  const idleText = tone === 'hero' ? 'text-white/80' : 'text-[#7A6552]';

  return (
    <div
      data-testid="language-toggle"
      className={`flex items-center rounded-full p-1 border shadow-md ${shell} ${className}`}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLanguage(option.value)}
          aria-label={option.ariaLabel}
          aria-pressed={language === option.value}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 min-h-[48px] min-w-[48px] flex items-center justify-center ${
            language === option.value ? 'bg-[#C4572A] text-white' : idleText
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
