export type DurationCategory = '1-2h' | '2-4h' | 'half-day';
export type AccessibilityLevel = 'stroller-friendly' | 'moderate' | 'steep-stairs';
export type VibeCategory = 'photo-spots' | 'courtyards' | 'food-wine' | 'architecture';

// Domain glossary aliases (CONTEXT.md)
export type LogisticsConstraint = AccessibilityLevel;
export type Vibe = VibeCategory;

export interface ProviderRating {
  rating: number;
  count: number;
}

export interface Stop {
  id: string;
  order: number;
  name: string;
  nameRu?: string;
  neighborhood: string;
  neighborhoodRu?: string;
  coordinates: { lat: number; lng: number };
  estimatedMinutes: number;
  imageUrl: string;
  olyaTips: string;
  olyaTipsRu?: string;
  logisticsWarning?: string;
  logisticsWarningRu?: string;
  bestTimeOfDay?: string;
  bestTimeOfDayRu?: string;
  photoSpot?: string;
  photoSpotRu?: string;
  ratings?: {
    google?: ProviderRating;
    yandex?: ProviderRating;
  };
  placeIds?: {
    google?: string;
    yandex?: string;
  };
  rating?: number;
  ratingCount?: number;
}


export interface Route {
  id: string;
  title: string;
  titleRu?: string;
  subtitle: string;
  subtitleRu?: string;
  durationCategory: DurationCategory;
  accessibility: AccessibilityLevel;
  vibes: VibeCategory[];
  heroImage: string;
  introCopy: string;
  introCopyRu?: string;
  stops: Stop[];
}

export interface MatchCriteria {
  durationCategory?: DurationCategory;
  accessibility: AccessibilityLevel;
  vibe?: VibeCategory;
  lang?: import('../i18n/types').Language;
}

export interface MatchResult {
  route: Route;
  relaxed: boolean;
  explanationNote?: string;
}
