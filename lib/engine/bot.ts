import { DurationCategory, AccessibilityLevel, VibeCategory } from '../types/route';
import {
  TelegramUpdate,
  TelegramBotResponsePayload,
  ParsedFunnelState,
} from '../types/bot';
import { matchRoute } from './matcher';
import { ROUTES } from '../data/routes';
import { Language } from '../i18n/types';

const VALID_DURATIONS: DurationCategory[] = ['1-2h', '2-4h', 'half-day'];
const VALID_ACCESSIBILITIES: AccessibilityLevel[] = ['stroller-friendly', 'moderate', 'steep-stairs'];
const VALID_VIBES: VibeCategory[] = ['photo-spots', 'courtyards', 'food-wine', 'architecture'];

/**
 * Parses stateless callback_data parameter strings (e.g. "lang:ru|dur:1-2h|acc:stroller-friendly|vibe:photo-spots")
 * and extracts the current state and next step in the filter funnel.
 */
export function parseCallbackData(callbackData?: string): ParsedFunnelState {
  if (
    !callbackData ||
    callbackData === '/start' ||
    callbackData.startsWith('/start') ||
    callbackData === '/language' ||
    callbackData.startsWith('/language') ||
    callbackData === '/lang' ||
    callbackData.startsWith('/lang') ||
    callbackData === 'change_lang'
  ) {
    return { step: 'language' };
  }

  if (callbackData === 'restart') {
    return { step: 'language' };
  }

  const parts = callbackData.split('|');
  const params: Record<string, string> = {};

  for (const part of parts) {
    const [key, value] = part.split(':');
    if (key && value) {
      params[key] = value;
    }
  }

  let language: Language | undefined;
  if (params.lang === 'ru' || params.lang === 'en') {
    language = params.lang as Language;
  }

  if (parts.includes('restart')) {
    return { language: language || 'en', step: 'duration' };
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

  const lang: Language = language || 'en';

  if (!durationCategory) {
    return { language: lang, step: 'duration' };
  }

  if (!accessibility) {
    return { language: lang, durationCategory, step: 'accessibility' };
  }

  if (!vibe) {
    return { language: lang, durationCategory, accessibility, step: 'vibe' };
  }

  return { language: lang, durationCategory, accessibility, vibe, step: 'results' };
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
  const lang = state.language || 'en';

  switch (state.step) {
    case 'language': {
      return {
        method,
        chat_id: chatId,
        ...(messageId ? { message_id: messageId } : {}),
        text:
          '🌐 <b>Select your language / Выберите язык</b>\n\n' +
          "Hi! I'm Olya, your local guide to Tbilisi 🌿\n" +
          'Please select your preferred language to continue.\n\n' +
          'Привет! Я Оля, ваш гид по Тбилиси 🌿\n' +
          'Выберите удобный язык для продолжения.',
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🇬🇧 English', callback_data: 'lang:en' },
              { text: '🇷🇺 Русский', callback_data: 'lang:ru' },
            ],
          ],
        },
      };
    }

    case 'duration': {
      const isRu = lang === 'ru';
      const text = isRu
        ? 'Привет! Я Оля, ваш локальный гид по Тбилиси 🌿\n\nДавайте найдём идеальный пеший маршрут для вас. Сначала подскажите, сколько у вас сегодня времени?'
        : "Hi! I'm Olya, your local guide to Tbilisi 🌿\n\nLet's find the perfect walking route for you. First, how much time do you have today?";

      return {
        method,
        chat_id: chatId,
        ...(messageId ? { message_id: messageId } : {}),
        text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: isRu ? '⏱️ 1–2 часа' : '⏱️ 1–2 Hours', callback_data: `lang:${lang}|dur:1-2h` },
              { text: isRu ? '⏱️ 2–4 часа' : '⏱️ 2–4 Hours', callback_data: `lang:${lang}|dur:2-4h` },
            ],
            [{ text: isRu ? '⏱️ Полдня' : '⏱️ Half Day', callback_data: `lang:${lang}|dur:half-day` }],
            [{ text: isRu ? '🌐 Изменить язык' : '🌐 Change Language', callback_data: 'change_lang' }],
          ],
        },
      };
    }

    case 'accessibility': {
      const isRu = lang === 'ru';
      const text = isRu
        ? 'Понятно! Какие у вас пожелания по доступности и рельефу маршрута?'
        : 'Got it! What are your accessibility or mobility needs for the terrain?';

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
                text: isRu ? '👶 Удобно с коляской (ровно)' : '👶 Stroller-Friendly (Flat)',
                callback_data: `lang:${lang}|dur:${state.durationCategory}|acc:stroller-friendly`,
              },
            ],
            [
              {
                text: isRu ? '🚶 Умеренное покрытие' : '🚶 Moderate Paving',
                callback_data: `lang:${lang}|dur:${state.durationCategory}|acc:moderate`,
              },
            ],
            [
              {
                text: isRu ? '🧗 Крутые лестницы и подъёмы' : '🧗 Steep Citadel Stairs',
                callback_data: `lang:${lang}|dur:${state.durationCategory}|acc:steep-stairs`,
              },
            ],
          ],
        },
      };
    }

    case 'vibe': {
      const isRu = lang === 'ru';
      const text = isRu
        ? 'Почти готово! Какая атмосфера вам ближе?'
        : 'Almost there! What kind of vibe are you looking for?';

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
                text: isRu ? '📸 Фотолокации' : '📸 Photo Spots',
                callback_data: `lang:${lang}|dur:${state.durationCategory}|acc:${state.accessibility}|vibe:photo-spots`,
              },
              {
                text: isRu ? '🏡 Скрытые дворики' : '🏡 Hidden Courtyards',
                callback_data: `lang:${lang}|dur:${state.durationCategory}|acc:${state.accessibility}|vibe:courtyards`,
              },
            ],
            [
              {
                text: isRu ? '🍷 Еда и вино' : '🍷 Food & Wine',
                callback_data: `lang:${lang}|dur:${state.durationCategory}|acc:${state.accessibility}|vibe:food-wine`,
              },
              {
                text: isRu ? '🏛️ Искусство и архитектура' : '🏛️ Art & Architecture',
                callback_data: `lang:${lang}|dur:${state.durationCategory}|acc:${state.accessibility}|vibe:architecture`,
              },
            ],
          ],
        },
      };
    }

    case 'results': {
      const isRu = lang === 'ru';
      const matchResult = matchRoute(ROUTES, {
        durationCategory: state.durationCategory,
        accessibility: state.accessibility!,
        vibe: state.vibe,
        lang,
      });

      if (!matchResult) {
        return {
          method,
          chat_id: chatId,
          ...(messageId ? { message_id: messageId } : {}),
          text: isRu
            ? 'Извините, не удалось найти маршрут по вашим критериям. Давайте попробуем с другими настройками!'
            : "Sorry, I couldn't find any route matching your criteria. Let's try again with different settings!",
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: isRu ? '🔄 Начать заново' : '🔄 Start Over', callback_data: `restart|lang:${lang}` }]],
          },
        };
      }

      const route = matchResult.route;
      const title = isRu && route.titleRu ? route.titleRu : route.title;
      const subtitle = isRu && route.subtitleRu ? route.subtitleRu : route.subtitle;
      const introCopy = isRu && route.introCopyRu ? route.introCopyRu : route.introCopy;

      const noteSection = matchResult.explanationNote
        ? `\n\nℹ️ <i>${matchResult.explanationNote}</i>`
        : '';

      const text = isRu
        ? `✨ <b>Рекомендация маршрута от Оли</b>\n\n` +
          `<b>${title}</b>\n` +
          `<i>${subtitle}</i>\n\n` +
          `${introCopy}` +
          noteSection
        : `✨ <b>Olya's Route Recommendation</b>\n\n` +
          `<b>${title}</b>\n` +
          `<i>${subtitle}</i>\n\n` +
          `${introCopy}` +
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
                text: isRu ? '🗺️ Открыть пеший маршрут' : '🗺️ Open Walking Route',
                web_app: { url: `${cleanBaseUrl}/twa/${route.id}?lang=${lang}` },
              },
            ],
            [{ text: isRu ? '🔄 Начать заново' : '🔄 Start Over', callback_data: `restart|lang:${lang}` }],
            [{ text: isRu ? '🌐 Изменить язык' : '🌐 Change Language', callback_data: 'change_lang' }],
          ],
        },
      };
    }
  }
}
