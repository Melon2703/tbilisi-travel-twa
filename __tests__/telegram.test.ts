import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateStopDeepLink,
  parseStartParam,
  parseDeepLinkParam,
  getTelegramStartParam,
  shareStopDeepLink,
} from '@/lib/utils/telegram';

describe('Telegram Deep Linking Utils', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  describe('generateStopDeepLink', () => {
    it('encodes routeId and stopId into standard startapp URL format', () => {
      const link = generateStopDeepLink('heartbeat-of-tbilisi', 'hb-stop-3');
      expect(link).toBe('https://t.me/bot?startapp=route_heartbeat-of-tbilisi_stop_hb-stop-3');
    });

    it('uses custom bot username when provided', () => {
      const link = generateStopDeepLink('sololaki-courtyards', 'stop-1', 'TbilisiTravelBot');
      expect(link).toBe('https://t.me/TbilisiTravelBot?startapp=route_sololaki-courtyards_stop_stop-1');
    });
  });

  describe('parseStartParam & parseDeepLinkParam', () => {
    it('parses valid route_<id>_stop_<id> payloads correctly', () => {
      const parsed = parseStartParam('route_heartbeat-of-tbilisi_stop_hb-stop-3');
      expect(parsed).toEqual({
        routeId: 'heartbeat-of-tbilisi',
        stopId: 'hb-stop-3',
      });
    });

    it('handles encoded URL parameter strings', () => {
      const parsed = parseDeepLinkParam(encodeURIComponent('route_sololaki_stop_sololaki-stop-2'));
      expect(parsed).toEqual({
        routeId: 'sololaki',
        stopId: 'sololaki-stop-2',
      });
    });

    it('returns null for null, undefined, or empty payloads', () => {
      expect(parseStartParam(null)).toBeNull();
      expect(parseStartParam(undefined)).toBeNull();
      expect(parseStartParam('')).toBeNull();
    });

    it('returns null for malformed payloads', () => {
      expect(parseStartParam('invalid_payload')).toBeNull();
      expect(parseStartParam('route_only')).toBeNull();
      expect(parseStartParam('stop_hb-stop-1')).toBeNull();
    });
  });

  describe('getTelegramStartParam', () => {
    it('extracts start_param from window.Telegram.WebApp.initDataUnsafe', () => {
      window.Telegram = {
        WebApp: {
          initDataUnsafe: {
            start_param: 'route_sololaki_stop_sololaki-stop-1',
          },
        } as any,
      };

      const startParam = getTelegramStartParam();
      expect(startParam).toBe('route_sololaki_stop_sololaki-stop-1');
    });

    it('falls back to URL query parameters if WebApp initDataUnsafe is empty', () => {
      window.Telegram = {
        WebApp: {
          initDataUnsafe: {},
        } as any,
      };

      delete (window as any).location;
      (window as any).location = new URL('https://example.com/?startapp=route_test_stop_stop-5');

      const startParam = getTelegramStartParam();
      expect(startParam).toBe('route_test_stop_stop-5');
    });
  });

  describe('shareStopDeepLink', () => {
    it('calls Telegram WebApp openTelegramLink when available', async () => {
      const openTelegramLinkMock = vi.fn();
      window.Telegram = {
        WebApp: {
          openTelegramLink: openTelegramLinkMock,
        } as any,
      };

      const result = await shareStopDeepLink('heartbeat-of-tbilisi', 'hb-stop-3', 'Freedom Square');
      expect(result).toBe(true);
      expect(openTelegramLinkMock).toHaveBeenCalledWith(
        expect.stringContaining('https://t.me/share/url?url=')
      );
    });

    it('falls back to navigator.clipboard.writeText when Telegram WebApp SDK is not present', async () => {
      delete (window as any).Telegram;
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
      });

      const result = await shareStopDeepLink('heartbeat-of-tbilisi', 'hb-stop-3');
      expect(result).toBe(true);
      expect(writeTextMock).toHaveBeenCalledWith(
        'https://t.me/bot?startapp=route_heartbeat-of-tbilisi_stop_hb-stop-3'
      );
    });
  });
});
