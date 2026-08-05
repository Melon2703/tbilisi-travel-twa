import React from 'react';

export const EMOJI_ICONS = {
  mapPin: '📍',
  footprints: '🚶',
  funicular: '🚠',
  clock: '⏱️',
  chat: '💬',
  camera: '📸',
  warning: '⚠️',
  arrowRight: '➡️',
  check: '✅',
  close: '✖️',
  googleMaps: '🗺️',
  yandexMaps: '🔴',
  star: '⭐',
  georgiaFlag: '🇬🇪',
  sparkles: '✨',
  externalLink: '↗️',
  calendar: '📅',
  landmark: '🏛️',
  bulb: '💡',
  utensils: '🍽️',
  globe: '🌐',
  instagram: '📸',
} as const;

export type EmojiIconName = keyof typeof EMOJI_ICONS | (string & {});

export interface EmojiIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: EmojiIconName;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ariaLabel?: string;
}

const SIZE_MAP = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export default function EmojiIcon({
  name,
  className = '',
  size,
  ariaLabel,
  ...props
}: EmojiIconProps) {
  const emoji = (EMOJI_ICONS as Record<string, string>)[name] || name;
  const sizeClass = size ? SIZE_MAP[size] : '';

  return (
    <span
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={`inline-flex items-center justify-center select-none shrink-0 ${sizeClass} ${className}`}
      {...props}
    >
      {emoji}
    </span>
  );
}
