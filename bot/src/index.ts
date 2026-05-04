import { createBot } from './bot';
import { sendLetterForConfirmation, sendFollowUpPrompt } from './handlers/confirm';
import { config } from './config';
import { errorMessage, escapeHtml } from './utils/html';
import type { GeneratedLetter, FollowUpNotification } from './types';

let bot: ReturnType<typeof createBot> | undefined;

function getBot() {
  if (!bot) bot = createBot();
  return bot;
}

const seenUpdateIds = new Set<number>();

interface YCEvent {
  httpMethod?: string;
  path?: string;
  headers?: Record<string, string>;
  body?: string;
  isBase64Encoded?: boolean;
}

interface YCResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

function json(statusCode: number, data: unknown): YCResponse {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

function normalizeHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );
}

function normalizePath(path = '/'): string {
  const decoded = decodeURIComponent(path);
  if (decoded.length > 1 && decoded.endsWith('/')) return decoded.slice(0, -1);
  return decoded;
}

function parseBody(event: YCEvent): Record<string, unknown> {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;
  return JSON.parse(raw);
}

function hasInternalSecret(headers: Record<string, string>): boolean {
  const secret = config.internalSecret;
  return !!secret && headers['x-internal-secret'] === secret;
}

function rememberUpdate(updateId: number): boolean {
  if (seenUpdateIds.has(updateId)) return false;
  seenUpdateIds.add(updateId);
  if (seenUpdateIds.size > 100) {
    const oldest = seenUpdateIds.values().next().value;
    if (oldest !== undefined) seenUpdateIds.delete(oldest);
  }
  return true;
}

export const handler = async (event: YCEvent): Promise<YCResponse> => {
  const method = event.httpMethod?.toUpperCase() ?? 'GET';
  const path = normalizePath(event.path);
  const headers = normalizeHeaders(event.headers);

  console.log(`[handler] method=${method} path=${path}`);

  if (method === 'OPTIONS') return json(204, { ok: true });

  let body: Record<string, unknown>;
  try {
    body = parseBody(event);
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  if (method === 'POST' && typeof body.update_id === 'number') {
    const updateId = body.update_id;
    if (!rememberUpdate(updateId)) {
      console.log(`[webhook] duplicate update_id=${updateId}, skipping`);
      return json(200, { ok: true, duplicate: true });
    }

    try {
      // Telegraf update shape is owned by Telegram, so keep the boundary narrow here.
      await getBot().handleUpdate(body as never);
      return json(200, { ok: true });
    } catch (err) {
      console.error('[webhook]', err);
      return json(500, { error: errorMessage(err) });
    }
  }

  if (!hasInternalSecret(headers)) {
    return json(401, { error: 'Unauthorized' });
  }

  if (method === 'POST' && path === '/api/letter') {
    try {
      await sendLetterForConfirmation(getBot(), config.ownerChatId, body as unknown as GeneratedLetter);
      return json(200, { ok: true });
    } catch (err) {
      console.error('[/api/letter]', err);
      return json(500, { error: errorMessage(err) });
    }
  }

  if (method === 'POST' && path === '/api/followup') {
    try {
      await sendFollowUpPrompt(getBot(), config.ownerChatId, body as unknown as FollowUpNotification);
      return json(200, { ok: true });
    } catch (err) {
      console.error('[/api/followup]', err);
      return json(500, { error: errorMessage(err) });
    }
  }

  if (method === 'POST' && path === '/api/notify') {
    try {
      const message = typeof body.message === 'string' ? body.message.slice(0, 1000) : 'нет деталей';
      await getBot().telegram.sendMessage(
        config.ownerChatId,
        `⚠️ <b>n8n error</b>\n${escapeHtml(message)}`,
        { parse_mode: 'HTML' },
      );
      return json(200, { ok: true });
    } catch (err) {
      console.error('[/api/notify]', err);
      return json(500, { error: errorMessage(err) });
    }
  }

  return json(404, { error: 'Not found' });
};
