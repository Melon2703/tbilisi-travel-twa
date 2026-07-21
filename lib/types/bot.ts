import { DurationCategory, AccessibilityLevel, VibeCategory } from './route';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  text?: string;
  date?: number;
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface TelegramInlineKeyboardButton {
  text: string;
  callback_data?: string;
  web_app?: {
    url: string;
  };
  url?: string;
}

export interface TelegramInlineKeyboardMarkup {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}

export interface TelegramBotResponsePayload {
  method: 'sendMessage' | 'editMessageText';
  chat_id: number;
  message_id?: number;
  text: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  reply_markup?: TelegramInlineKeyboardMarkup;
}

export interface ParsedFunnelState {
  durationCategory?: DurationCategory;
  accessibility?: AccessibilityLevel;
  vibe?: VibeCategory;
  step: 'duration' | 'accessibility' | 'vibe' | 'results';
}
