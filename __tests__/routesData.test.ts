import { describe, it, expect } from 'vitest';
import { ROUTES } from '@/lib/data/routes';

describe('Route Data Configuration & Asset Cleanup (Issue 31)', () => {
  const expressRoute = ROUTES.find((r) => r.id === 'heartbeat-express-1-2h');
  const heartbeatRoute = ROUTES.find((r) => r.id === 'old-tbilisi-heartbeat');

  const expressRikeParkStop = expressRoute?.stops[5]; // Step 6 (0-indexed 5)
  const cafeMindaStop = heartbeatRoute?.stops.find((s) => s.id === 'hb-stop-2');

  it('heartbeat-express-1-2h Step 6 (hb-stop-9 / Rike Park) has a high quality image URL and is not the medical mask photo', () => {
    expect(expressRoute).toBeDefined();
    expect(expressRikeParkStop).toBeDefined();
    expect(expressRikeParkStop?.id).toBe('hb-stop-9');
    expect(expressRikeParkStop?.order).toBe(6);
    expect(expressRikeParkStop?.imageUrl).toBeDefined();
    expect(expressRikeParkStop?.imageUrl).not.toContain('photo-1584467735871');
  });

  it('hb-stop-9 in heartbeat-express-1-2h contains websiteUrl set to https://tbilisi.gov.ge', () => {
    expect(expressRikeParkStop).toBeDefined();
    expect(expressRikeParkStop?.websiteUrl).toBe('https://tbilisi.gov.ge');
  });

  it('hb-stop-2 tips and booking advice text are consolidated without duplicate phrases', () => {
    expect(cafeMindaStop).toBeDefined();
    expect(cafeMindaStop?.stopType).toBe('venue');
    if (cafeMindaStop?.stopType === 'venue') {
      const bookingAdvice = cafeMindaStop.venueDetails?.bookingAdvice || '';
      const olyaTips = cafeMindaStop.olyaTips || '';
      const bookingAdviceRu = cafeMindaStop.venueDetails?.bookingAdviceRu || '';
      const olyaTipsRu = cafeMindaStop.olyaTipsRu || '';

      expect(bookingAdvice).not.toContain('Light-filled upper floor');
      expect(bookingAdviceRu).not.toContain('Светлый верхний этаж');
      expect(olyaTips).toContain('Light-filled upper floor');
      expect(olyaTipsRu).toContain('Светлый верхний этаж');
    }
  });
});
