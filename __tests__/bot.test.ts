import { describe, it, expect } from 'vitest';
import { parseCallbackData, handleBotUpdate } from '../lib/engine/bot';
import { POST, GET } from '../app/api/bot/route';

describe('Stateless Callback Data Parser with i18n', () => {
  it('parses /start or empty callback data as language selection step', () => {
    expect(parseCallbackData(undefined)).toEqual({ step: 'language' });
    expect(parseCallbackData('')).toEqual({ step: 'language' });
    expect(parseCallbackData('/start')).toEqual({ step: 'language' });
    expect(parseCallbackData('restart')).toEqual({ step: 'language' });
    expect(parseCallbackData('/language')).toEqual({ step: 'language' });
    expect(parseCallbackData('/lang')).toEqual({ step: 'language' });
    expect(parseCallbackData('change_lang')).toEqual({ step: 'language' });
  });

  it('parses language selection callback query correctly', () => {
    expect(parseCallbackData('lang:en')).toEqual({
      language: 'en',
      step: 'duration',
    });
    expect(parseCallbackData('lang:ru')).toEqual({
      language: 'ru',
      step: 'duration',
    });
  });

  it('parses duration step with language correctly and advances to accessibility step', () => {
    const result = parseCallbackData('lang:ru|dur:1-2h');
    expect(result).toEqual({
      language: 'ru',
      durationCategory: '1-2h',
      step: 'accessibility',
    });
  });

  it('parses accessibility step with language correctly and advances to vibe step', () => {
    const result = parseCallbackData('lang:ru|dur:1-2h|acc:stroller-friendly');
    expect(result).toEqual({
      language: 'ru',
      durationCategory: '1-2h',
      accessibility: 'stroller-friendly',
      step: 'vibe',
    });
  });

  it('parses full callback data with language and advances to results step', () => {
    const result = parseCallbackData('lang:ru|dur:1-2h|acc:stroller-friendly|vibe:photo-spots');
    expect(result).toEqual({
      language: 'ru',
      durationCategory: '1-2h',
      accessibility: 'stroller-friendly',
      vibe: 'photo-spots',
      step: 'results',
    });
  });

  it('ignores invalid parameters gracefully', () => {
    const result = parseCallbackData('dur:invalid|acc:invalid|vibe:invalid');
    expect(result).toEqual({ language: 'en', step: 'duration' });
  });
});

describe('Bot Funnel Engine i18n Flow', () => {
  it('handles /start command and returns bilingual English & Russian language selection prompt', () => {
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
    expect(response?.text).toContain('Select your language / Выберите язык');
    expect(response?.text).toContain("Hi! I'm Olya");
    expect(response?.text).toContain('Привет! Я Оля');

    const buttons = response?.reply_markup?.inline_keyboard.flat();
    expect(buttons?.some((b) => b.callback_data === 'lang:en')).toBe(true);
    expect(buttons?.some((b) => b.callback_data === 'lang:ru')).toBe(true);
  });

  it('handles separate /language command to trigger language selection prompt', () => {
    const update = {
      update_id: 1001,
      message: {
        message_id: 2,
        chat: { id: 12345, type: 'private' },
        text: '/language',
      },
    };

    const response = handleBotUpdate(update, 'https://example.com');
    expect(response?.text).toContain('Select your language / Выберите язык');
    const buttons = response?.reply_markup?.inline_keyboard.flat();
    expect(buttons?.some((b) => b.callback_data === 'lang:ru')).toBe(true);
  });

  it('handles English selection (lang:en) and returns Step 1 (Duration) prompt in English', () => {
    const update = {
      update_id: 101,
      callback_query: {
        id: 'cb_en',
        from: { id: 12345, first_name: 'TestUser' },
        message: {
          message_id: 50,
          chat: { id: 12345, type: 'private' },
        },
        data: 'lang:en',
      },
    };

    const response = handleBotUpdate(update, 'https://example.com');
    expect(response?.method).toBe('editMessageText');
    expect(response?.text).toContain("Hi! I'm Olya");
    expect(response?.text).toContain('how much time do you have today?');

    const buttons = response?.reply_markup?.inline_keyboard.flat();
    expect(buttons?.some((b) => b.callback_data === 'lang:en|dur:1-2h')).toBe(true);
  });

  it('handles Russian selection (lang:ru) and returns Step 1 (Duration) prompt in Russian', () => {
    const update = {
      update_id: 102,
      callback_query: {
        id: 'cb_ru',
        from: { id: 12345, first_name: 'TestUser' },
        message: {
          message_id: 50,
          chat: { id: 12345, type: 'private' },
        },
        data: 'lang:ru',
      },
    };

    const response = handleBotUpdate(update, 'https://example.com');
    expect(response?.method).toBe('editMessageText');
    expect(response?.text).toContain('Привет! Я Оля, ваш локальный гид по Тбилиси');
    expect(response?.text).toContain('сколько у вас сегодня времени?');

    const buttons = response?.reply_markup?.inline_keyboard.flat();
    expect(buttons?.some((b) => b.callback_data === 'lang:ru|dur:1-2h')).toBe(true);
    expect(buttons?.some((b) => b.text === '1–2 часа')).toBe(true);
  });

  it('handles Russian funnel to final Recommendation with web_app URL containing ?lang=ru', () => {
    const update = {
      update_id: 103,
      callback_query: {
        id: 'cb_ru_final',
        from: { id: 12345, first_name: 'TestUser' },
        message: {
          message_id: 50,
          chat: { id: 12345, type: 'private' },
        },
        data: 'lang:ru|dur:1-2h|acc:stroller-friendly|vibe:courtyards',
      },
    };

    const response = handleBotUpdate(update, 'https://example.com');
    expect(response?.method).toBe('editMessageText');
    expect(response?.text).toContain('Рекомендация маршрута от Оли');
    expect(response?.text).toContain('Сердце Тбилиси Экспресс: Ровный маршрут');

    const buttons = response?.reply_markup?.inline_keyboard.flat();
    const webAppButton = buttons?.find((b) => b.web_app !== undefined);
    expect(webAppButton).toBeDefined();
    expect(webAppButton?.text).toBe('Открыть пеший маршрут');
    expect(webAppButton?.web_app?.url).toBe('https://example.com/twa/heartbeat-express-1-2h?lang=ru');

    const restartButton = buttons?.find((b) => b.callback_data === 'restart|lang:ru');
    expect(restartButton).toBeDefined();
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
});
