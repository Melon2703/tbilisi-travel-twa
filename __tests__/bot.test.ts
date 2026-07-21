import { describe, it, expect } from 'vitest';
import { parseCallbackData, handleBotUpdate } from '../lib/engine/bot';
import { POST, GET } from '../app/api/bot/route';

describe('Stateless Callback Data Parser', () => {
  it('parses empty or reset callback data as duration step', () => {
    expect(parseCallbackData(undefined)).toEqual({ step: 'duration' });
    expect(parseCallbackData('')).toEqual({ step: 'duration' });
    expect(parseCallbackData('/start')).toEqual({ step: 'duration' });
    expect(parseCallbackData('restart')).toEqual({ step: 'duration' });
  });

  it('parses duration step data correctly and advances to accessibility step', () => {
    const result = parseCallbackData('dur:1-2h');
    expect(result).toEqual({
      durationCategory: '1-2h',
      step: 'accessibility',
    });
  });

  it('parses accessibility step data correctly and advances to vibe step', () => {
    const result = parseCallbackData('dur:1-2h|acc:stroller-friendly');
    expect(result).toEqual({
      durationCategory: '1-2h',
      accessibility: 'stroller-friendly',
      step: 'vibe',
    });
  });

  it('parses full callback data and advances to results step', () => {
    const result = parseCallbackData('dur:1-2h|acc:stroller-friendly|vibe:photo-spots');
    expect(result).toEqual({
      durationCategory: '1-2h',
      accessibility: 'stroller-friendly',
      vibe: 'photo-spots',
      step: 'results',
    });
  });

  it('ignores invalid parameters gracefully', () => {
    const result = parseCallbackData('dur:invalid|acc:invalid|vibe:invalid');
    expect(result).toEqual({ step: 'duration' });
  });
});

describe('Bot Funnel Engine', () => {
  it('handles /start message update and returns Step 1 (Duration) prompt', () => {
    const update = {
      update_id: 100,
      message: {
        message_id: 1,
        chat: { id: 12345, type: 'private' },
        text: '/start',
      },
    };

    const response = handleBotUpdate(update, 'https://example.com');
    expect(response).not.toBeNull();
    expect(response?.method).toBe('sendMessage');
    expect(response?.chat_id).toBe(12345);
    expect(response?.text).toContain("I'm Olya");
    expect(response?.text).toContain('how much time do you have');
    expect(response?.reply_markup?.inline_keyboard.length).toBeGreaterThan(0);
    
    // Check buttons point to dur:* callback_data
    const buttons = response?.reply_markup?.inline_keyboard.flat();
    expect(buttons?.some((b) => b.callback_data === 'dur:1-2h')).toBe(true);
  });

  it('handles duration callback query and returns Step 2 (Accessibility) prompt', () => {
    const update = {
      update_id: 101,
      callback_query: {
        id: 'cb1',
        from: { id: 12345, first_name: 'TestUser' },
        message: {
          message_id: 50,
          chat: { id: 12345, type: 'private' },
        },
        data: 'dur:1-2h',
      },
    };

    const response = handleBotUpdate(update, 'https://example.com');
    expect(response?.method).toBe('editMessageText');
    expect(response?.chat_id).toBe(12345);
    expect(response?.message_id).toBe(50);
    expect(response?.text).toContain('accessibility or mobility needs');
    
    const buttons = response?.reply_markup?.inline_keyboard.flat();
    expect(buttons?.some((b) => b.callback_data === 'dur:1-2h|acc:stroller-friendly')).toBe(true);
  });

  it('handles accessibility callback query and returns Step 3 (Vibe) prompt', () => {
    const update = {
      update_id: 102,
      callback_query: {
        id: 'cb2',
        from: { id: 12345, first_name: 'TestUser' },
        message: {
          message_id: 50,
          chat: { id: 12345, type: 'private' },
        },
        data: 'dur:1-2h|acc:stroller-friendly',
      },
    };

    const response = handleBotUpdate(update, 'https://example.com');
    expect(response?.method).toBe('editMessageText');
    expect(response?.text).toContain('vibe are you looking for');

    const buttons = response?.reply_markup?.inline_keyboard.flat();
    expect(buttons?.some((b) => b.callback_data === 'dur:1-2h|acc:stroller-friendly|vibe:photo-spots')).toBe(true);
  });

  it('handles final vibe callback query and returns Step 4 Recommendation with web_app button', () => {
    const update = {
      update_id: 103,
      callback_query: {
        id: 'cb3',
        from: { id: 12345, first_name: 'TestUser' },
        message: {
          message_id: 50,
          chat: { id: 12345, type: 'private' },
        },
        data: 'dur:1-2h|acc:stroller-friendly|vibe:courtyards',
      },
    };

    const response = handleBotUpdate(update, 'https://example.com');
    expect(response?.method).toBe('editMessageText');
    expect(response?.text).toContain("Olya's Route Recommendation");
    expect(response?.text).toContain('Sololaki');

    const buttons = response?.reply_markup?.inline_keyboard.flat();
    const webAppButton = buttons?.find((b) => b.web_app !== undefined);
    expect(webAppButton).toBeDefined();
    expect(webAppButton?.web_app?.url).toBe('https://example.com/twa/sololaki-courtyards');

    const restartButton = buttons?.find((b) => b.callback_data === 'restart');
    expect(restartButton).toBeDefined();
  });

  it('includes soft constraint relaxation note when soft criteria are relaxed', () => {
    // Request half-day + stroller-friendly + food-wine (where stroller-friendly routes might not match half-day)
    const update = {
      update_id: 104,
      callback_query: {
        id: 'cb4',
        from: { id: 12345, first_name: 'TestUser' },
        message: {
          message_id: 50,
          chat: { id: 12345, type: 'private' },
        },
        data: 'dur:half-day|acc:stroller-friendly|vibe:food-wine',
      },
    };

    const response = handleBotUpdate(update, 'https://example.com');
    expect(response?.text).toContain("Olya's Route Recommendation");
    // Hard constraint (stroller-friendly) must still be satisfied
    expect(response?.text).toContain('couldn\'t find an exact match');
  });
});

describe('/api/bot Webhook Route Handler', () => {
  it('handles GET requests with health check response', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  it('handles POST webhook payload for /start command', async () => {
    const update = {
      update_id: 200,
      message: {
        message_id: 1,
        chat: { id: 999, type: 'private' },
        text: '/start',
      },
    };

    const req = new Request('http://localhost:3000/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.method).toBe('sendMessage');
    expect(json.chat_id).toBe(999);
  });

  it('handles POST webhook payload for callback query', async () => {
    const update = {
      update_id: 201,
      callback_query: {
        id: 'cb_test',
        from: { id: 999, first_name: 'Alex' },
        message: {
          message_id: 10,
          chat: { id: 999, type: 'private' },
        },
        data: 'dur:1-2h',
      },
    };

    const req = new Request('http://localhost:3000/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.method).toBe('editMessageText');
    expect(json.chat_id).toBe(999);
    expect(json.message_id).toBe(10);
  });

  it('returns 400 Bad Request on invalid JSON payload', async () => {
    const req = new Request('http://localhost:3000/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
