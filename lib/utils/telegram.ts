export interface ParsedStopDeepLink {
  routeId: string;
  stopId: string;
}

/**
 * Generate Telegram Startapp Deep Link for direct stop-level sharing and navigation.
 * Example: https://t.me/bot?startapp=route_heartbeat-of-tbilisi_stop_hb-stop-3
 */
export function generateStopDeepLink(routeId: string, stopId: string, botUsername?: string): string {
  const bot = botUsername || process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'bot';
  return `https://t.me/${bot}?startapp=route_${routeId}_stop_${stopId}`;
}

/**
 * Parse startapp payload parameters (e.g. route_<id>_stop_<id>).
 * Returns { routeId, stopId } or null if invalid.
 */
export function parseStartParam(param: string | null | undefined): ParsedStopDeepLink | null {
  if (!param) return null;
  const decoded = decodeURIComponent(param);
  const match = decoded.match(/^route_(.+)_stop_(.+)$/);
  if (!match) return null;
  return {
    routeId: match[1],
    stopId: match[2],
  };
}

/**
 * Alias for parseStartParam to conform with alternative naming conventions.
 */
export function parseDeepLinkParam(param: string | null | undefined): ParsedStopDeepLink | null {
  return parseStartParam(param);
}

/**
 * Extract initial Telegram start parameter from Telegram WebApp SDK or URL params.
 */
export function getTelegramStartParam(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Check Telegram WebApp SDK initDataUnsafe
  if (window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
    return window.Telegram.WebApp.initDataUnsafe.start_param;
  }

  // 2. Fallback to URL search parameters
  const urlParams = new URLSearchParams(window.location.search);
  return (
    urlParams.get('tgWebAppStartParam') ||
    urlParams.get('startapp') ||
    urlParams.get('start_param') ||
    null
  );
}


