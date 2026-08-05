export type DurationCategory = '1-2h' | '3-4h' | 'half-day' | 'full-day';
export type AccessibilityLevel = 'stroller-friendly' | 'moderate' | 'steep-stairs';
export type VibeCategory =
  | 'cultural'
  | 'insta-locations'
  | 'hiking'
  | 'photo-spots'
  | 'courtyards'
  | 'food-wine'
  | 'architecture';

// Domain glossary aliases (CONTEXT.md)
export type LogisticsConstraint = AccessibilityLevel;
export type Vibe = VibeCategory;

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ProviderRating {
  rating: number;
  count: number;
}

export type VenueCategory = 'cafe' | 'restaurant' | 'bar' | 'wine_bar';
export type CuisineType = 'georgian' | 'european' | 'asian';

export interface VenueDetails {
  category: VenueCategory;
  cuisines: CuisineType[];
  isVegetarianFriendly: boolean;
  recommendedDishes: string[];
  bookingAdvice?: string;
  bookingAdviceRu?: string;
}

export interface BaseStop {
  id: string;
  order: number;
  name: string;
  nameRu?: string;
  neighborhood: string;
  neighborhoodRu?: string;
  coordinates: Coordinates;
  estimatedMinutes: number;
  imageUrl: string;
  galleryImages?: string[];
  historicalSummary?: string;
  historicalSummaryRu?: string;
  funFact?: string;
  funFactRu?: string;
  workingHours?: string;
  workingHoursRu?: string;
  websiteUrl?: string;
  instagramUrl?: string;
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
    [key: string]: ProviderRating | undefined;
  };
  placeIds?: {
    google?: string;
    yandex?: string;
    [key: string]: string | undefined;
  };
  rating?: number;
  ratingCount?: number;
}

export interface AttractionStop extends BaseStop {
  stopType: 'attraction';
  transitBadge?: string;
  transitBadgeRu?: string;
}

export interface VenueStop extends BaseStop {
  stopType: 'venue';
  venueDetails: VenueDetails;
  isOptional: true;
}

export type Stop = AttractionStop | VenueStop;

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
  userLocation?: { lat: number; lng: number } | { latitude: number; longitude: number };
  lang?: import('../i18n/types').Language;
}

export interface MatchResult {
  route: Route;
  relaxed: boolean;
  explanationNote?: string;
}

