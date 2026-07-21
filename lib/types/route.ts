export type DurationCategory = '1-2h' | '2-4h' | 'half-day';
export type AccessibilityLevel = 'stroller-friendly' | 'moderate' | 'steep-stairs';
export type VibeCategory = 'photo-spots' | 'courtyards' | 'food-wine' | 'architecture';

// Domain glossary aliases (CONTEXT.md)
export type LogisticsConstraint = AccessibilityLevel;
export type Vibe = VibeCategory;

export interface Stop {
  id: string;
  order: number;
  name: string;
  neighborhood: string;
  coordinates: { lat: number; lng: number };
  estimatedMinutes: number;
  imageUrl: string;
  olyaTips: string;
  logisticsWarning?: string;
  bestTimeOfDay?: string;
}

export interface Route {
  id: string;
  title: string;
  subtitle: string;
  durationCategory: DurationCategory;
  accessibility: AccessibilityLevel;
  vibes: VibeCategory[];
  heroImage: string;
  introCopy: string;
  stops: Stop[];
}

export interface MatchCriteria {
  durationCategory?: DurationCategory;
  accessibility: AccessibilityLevel;
  vibe?: VibeCategory;
}

export interface MatchResult {
  route: Route;
  relaxed: boolean;
  explanationNote?: string;
}
