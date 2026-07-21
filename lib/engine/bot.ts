import { DurationCategory, AccessibilityLevel, VibeCategory } from '../types/route';
import {
  TelegramUpdate,
  TelegramBotResponsePayload,
  ParsedFunnelState,
} from '../types/bot';
import { matchRoute } from './matcher';
import { ROUTES } from '../data/routes';

const VALID_DURATIONS: DurationCategory[] = ['1-2h', '2-4h', 'half-day'];
const VALID_ACCESSIBILITIES: AccessibilityLevel[] = ['stroller-friendly', 'moderate', 'steep-stairs'];
const VALID_VIBES: VibeCategory[] = ['photo-spots', 'courtyards', 'food-wine', 'architecture'];

/**
 * Parses stateless callback_data parameter strings (e.g. "dur:1-2h|acc:stroller-friendly|vibe:photo-spots")
 * and extracts the current state and next step in the 3-step filter funnel.
 */
export function parseCallbackData(callbackData?: string): ParsedFunnelState {
  if (
    !callbackData ||
    callbackData === 'restart' ||
    callbackData === '/start' ||
    callbackData.startsWith('/start')
  ) {
    return { step: 'duration' };
  }

  const parts = callbackData.split('|');
  const params: Record<string, string> = {};

  for (const part of parts) {
    const [key, value] = part.split(':');
    if (key && value) {
      params[key] = value;
    }
  }

  let durationCategory: DurationCategory | undefined;
  if (params.dur && VALID_DURATIONS.includes(params.dur as DurationCategory)) {
    durationCategory = params.dur as DurationCategory;
  }

  let accessibility: AccessibilityLevel | undefined;
  if (params.acc && VALID_ACCESSIBILITIES.includes(params.acc as AccessibilityLevel)) {
    accessibility = params.acc as AccessibilityLevel;
  }

  let vibe: VibeCategory | undefined;
  if (params.vibe && VALID_VIBES.includes(params.vibe as VibeCategory)) {
    vibe = params.vibe as VibeCategory;
  }

  if (!durationCategory) {
    return { step: 'duration' };
  }

  if (!accessibility) {
    return { durationCategory, step: 'accessibility' };
  }

  if (!vibe) {
    return { durationCategory, accessibility, step: 'vibe' };
  }

  return { durationCategory, accessibility, vibe, step: 'results' };
}

/**
 * Handles incoming Telegram Bot API update objects and generates appropriate response payloads.
 */
export function handleBotUpdate(
  update: TelegramUpdate,
  baseUrl: string = 'https://tbilisi-travel.vercel.app'
): TelegramBotResponsePayload | null {
  let chatId: number | undefined;
  let messageId: number | undefined;
  let callbackData: string | undefined;

  if (update.callback_query) {
    chatId = update.callback_query.message?.chat.id ?? update.callback_query.from.id;
    messageId = update.callback_query.message?.message_id;
    callbackData = update.callback_query.data;
  } else if (update.message) {
    chatId = update.message.chat.id;
    callbackData = update.message.text;
  }

  if (!chatId) {
    return null;
  }

  const method = messageId ? 'editMessageText' : 'sendMessage';
  const state = parseCallbackData(callbackData);
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  switch (state.step) {
    case 'duration': {
      return {
        method,
        chat_id: chatId,
        ...(messageId ? { message_id: messageId } : {}),
        text: "Hi! I'm Olya, your local guide to Tbilisi 🌿\n\nLet's find the perfect walking route for you. First, how much time do you have today?",
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '⏱️ 1–2 Hours', callback_data: 'dur:1-2h' },
              { text: '⏱️ 2–4 Hours', callback_data: 'dur:2-4h' },
            ],
            [{ text: '⏱️ Half Day', callback_data: 'dur:half-day' }],
          ],
        },
      };
    }

    case 'accessibility': {
      return {
        method,
        chat_id: chatId,
        ...(messageId ? { message_id: messageId } : {}),
        text: 'Got it! What are your accessibility or mobility needs for the terrain?',
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '👶 Stroller-Friendly (Flat)',
                callback_data: `dur:${state.durationCategory}|acc:stroller-friendly`,
              },
            ],
            [
              {
                text: '🚶 Moderate Paving',
                callback_data: `dur:${state.durationCategory}|acc:moderate`,
              },
            ],
            [
              {
                text: '🧗 Steep Citadel Stairs',
                callback_data: `dur:${state.durationCategory}|acc:steep-stairs`,
              },
            ],
          ],
        },
      };
    }

    case 'vibe': {
      return {
        method,
        chat_id: chatId,
        ...(messageId ? { message_id: messageId } : {}),
        text: 'Almost there! What kind of vibe are you looking for?',
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📸 Photo Spots',
                callback_data: `dur:${state.durationCategory}|acc:${state.accessibility}|vibe:photo-spots`,
              },
              {
                text: '🏡 Hidden Courtyards',
                callback_data: `dur:${state.durationCategory}|acc:${state.accessibility}|vibe:courtyards`,
              },
            ],
            [
              {
                text: '🍷 Food & Wine',
                callback_data: `dur:${state.durationCategory}|acc:${state.accessibility}|vibe:food-wine`,
              },
              {
                text: '🏛️ Art & Architecture',
                callback_data: `dur:${state.durationCategory}|acc:${state.accessibility}|vibe:architecture`,
              },
            ],
          ],
        },
      };
    }

    case 'results': {
      const matchResult = matchRoute(ROUTES, {
        durationCategory: state.durationCategory,
        accessibility: state.accessibility!,
        vibe: state.vibe,
      });

      if (!matchResult) {
        return {
          method,
          chat_id: chatId,
          ...(messageId ? { message_id: messageId } : {}),
          text: "Sorry, I couldn't find any route matching your criteria. Let's try again with different settings!",
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '🔄 Start Over', callback_data: 'restart' }]],
          },
        };
      }

      const noteSection = matchResult.explanationNote
        ? `\n\nℹ️ <i>${matchResult.explanationNote}</i>`
        : '';

      const text =
        `✨ <b>Olya's Route Recommendation</b>\n\n` +
        `<b>${matchResult.route.title}</b>\n` +
        `<i>${matchResult.route.subtitle}</i>\n\n` +
        `${matchResult.route.introCopy}` +
        noteSection;

      return {
        method,
        chat_id: chatId,
        ...(messageId ? { message_id: messageId } : {}),
        text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🗺️ Open Walking Route',
                web_app: { url: `${cleanBaseUrl}/twa/${matchResult.route.id}` },
              },
            ],
            [{ text: '🔄 Start Over', callback_data: 'restart' }],
          ],
        },
      };
    }
  }
}
