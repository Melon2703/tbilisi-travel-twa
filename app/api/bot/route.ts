import { NextRequest } from 'next/server';
import { handleBotUpdate } from '../../../lib/engine/bot';
import { TelegramUpdate } from '../../../lib/types/bot';

export async function GET() {
  return Response.json({ status: 'ok', message: 'Telegram Bot Webhook endpoint' });
}

export async function POST(request: NextRequest | Request) {
  let body: TelegramUpdate;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (host ? `${protocol}://${host}` : 'https://tbilisi-travel.vercel.app');

  const botResponse = handleBotUpdate(body, baseUrl);

  if (!botResponse) {
    return Response.json({ status: 'ignored' }, { status: 200 });
  }

  // If Telegram token is set and update is a callback query, attempt to answer callback query to clear button spinner
  const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
  if (botToken && body.callback_query?.id) {
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: body.callback_query.id }),
      });
    } catch {
      // Ignore network errors when invoking Telegram API directly in serverless environment
    }
  }

  return Response.json(botResponse, { status: 200 });
}
