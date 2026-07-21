import { Route, MatchCriteria, MatchResult, AccessibilityLevel } from '../types/route';

const SCORE_DURATION_MATCH = 2;
const SCORE_VIBE_MATCH = 2;
const SCORE_EXACT_ACCESSIBILITY = 1;

/**
 * Helper to determine if a route's accessibility level satisfies the user's hard logistics constraint.
 */
function isAccessibilitySatisfied(
  routeAccessibility: AccessibilityLevel,
  requestedAccessibility: AccessibilityLevel
): boolean {
  if (requestedAccessibility === 'stroller-friendly') {
    return routeAccessibility === 'stroller-friendly';
  }
  if (requestedAccessibility === 'moderate') {
    return routeAccessibility === 'stroller-friendly' || routeAccessibility === 'moderate';
  }
  // 'steep-stairs' allows any terrain
  return true;
}

/**
 * Constraint-based Route Matching Engine.
 * Enforces hard accessibility constraints while scoring and relaxing soft constraints (duration and vibe).
 */
export function matchRoute(routes: Route[], criteria: MatchCriteria): MatchResult | null {
  // Step 1: Enforce Hard Constraint (Logistics / Accessibility)
  const eligibleRoutes = routes.filter((route) =>
    isAccessibilitySatisfied(route.accessibility, criteria.accessibility)
  );

  if (eligibleRoutes.length === 0) {
    return null;
  }

  // Step 2: Score Soft Constraints (Duration & Vibe)
  let bestRoute: Route = eligibleRoutes[0];
  let bestScore = -1;
  let bestDurationMatched = false;
  let bestVibeMatched = false;

  for (const route of eligibleRoutes) {
    let score = 0;

    const durationMatched = Boolean(
      criteria.durationCategory && route.durationCategory === criteria.durationCategory
    );
    if (durationMatched) {
      score += SCORE_DURATION_MATCH;
    }

    const vibeMatched = Boolean(
      criteria.vibe && route.vibes.includes(criteria.vibe)
    );
    if (vibeMatched) {
      score += SCORE_VIBE_MATCH;
    }

    // Secondary score: exact accessibility match preference over relaxed accessibility
    if (route.accessibility === criteria.accessibility) {
      score += SCORE_EXACT_ACCESSIBILITY;
    }

    if (score > bestScore) {
      bestScore = score;
      bestRoute = route;
      bestDurationMatched = durationMatched;
      bestVibeMatched = vibeMatched;
    }
  }

  // Step 3: Check if soft constraints were relaxed
  const durationRelaxed = Boolean(criteria.durationCategory && !bestDurationMatched);
  const vibeRelaxed = Boolean(criteria.vibe && !bestVibeMatched);
  const relaxed = durationRelaxed || vibeRelaxed;

  let explanationNote: string | undefined;

  if (relaxed) {
    const relaxedAspects: string[] = [];
    if (durationRelaxed) relaxedAspects.push('duration');
    if (vibeRelaxed) relaxedAspects.push('vibe');

    const aspectList = relaxedAspects.join(' and ');
    explanationNote = `I couldn't find an exact match for your ${aspectList} with your ${criteria.accessibility} accessibility needs, so I picked the best ${bestRoute.accessibility} route for you!`;
  }

  return {
    route: bestRoute,
    relaxed,
    explanationNote,
  };
}
