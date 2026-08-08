import React from 'react';
import type { IconType } from 'react-icons';
import {
  LuMapPin,
  LuFootprints,
  LuCableCar,
  LuClock,
  LuMessageCircle,
  LuCamera,
  LuTriangleAlert,
  LuCompass,
  LuArrowRight,
  LuCheck,
  LuX,
  LuInfo,
  LuStar,
  LuFlag,
  LuSparkles,
  LuExternalLink,
  LuCalendar,
  LuLandmark,
  LuLightbulb,
  LuUtensils,
  LuGlobe,
} from 'react-icons/lu';
import { SiGooglemaps } from 'react-icons/si';
import { FaYandex, FaInstagram } from 'react-icons/fa6';

/**
 * The app's icon vocabulary: a stable name per idea, backed by a real glyph
 * from `react-icons`. Names outlive the glyph behind them — swapping an icon
 * here changes every call site at once and none of them by name.
 */
export const EMOJI_ICONS = {
  mapPin: LuMapPin,
  footprints: LuFootprints,
  funicular: LuCableCar,
  clock: LuClock,
  chat: LuMessageCircle,
  camera: LuCamera,
  warning: LuTriangleAlert,
  directive: LuCompass,
  arrowRight: LuArrowRight,
  check: LuCheck,
  close: LuX,
  routeOverview: LuInfo,
  googleMaps: SiGooglemaps,
  yandexMaps: FaYandex,
  star: LuStar,
  georgiaFlag: LuFlag,
  sparkles: LuSparkles,
  externalLink: LuExternalLink,
  calendar: LuCalendar,
  landmark: LuLandmark,
  bulb: LuLightbulb,
  utensils: LuUtensils,
  globe: LuGlobe,
  instagram: FaInstagram,
} as const satisfies Record<string, IconType>;

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
  const Glyph = (EMOJI_ICONS as Record<string, IconType | undefined>)[name];
  const sizeClass = size ? SIZE_MAP[size] : '';

  return (
    <span
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={`inline-flex items-center justify-center select-none shrink-0 ${sizeClass} ${className}`}
      {...props}
    >
      {/* react-icons draws at 1em in currentColor, so the wrapper's text size
          and colour keep governing the icon exactly as they did the emoji. */}
      {Glyph ? <Glyph aria-hidden="true" focusable="false" /> : name}
    </span>
  );
}
