import { parseAllChannels } from './channels';
import { createClient } from '@supabase/supabase-js';

interface YCEvent {
  httpMethod: string;
  path: string;
  headers: Record<string, string>;
  body: string;
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

function checkSecret(headers: Record<string, string>): boolean {
  const secret = process.env.INTERNAL_SECRET;
  return !!secret &&
    (headers['x-internal-secret'] ?? headers['X-Internal-Secret']) === secret;
}

// Supabase-клиент для логирования запусков
function makeParserRunsClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function logParserRun(
  trigger: 'scheduled' | 'manual',
  ok: boolean,
  elapsedMs: number,
  postsFound: number,
  error?: string,
): Promise<void> {
  const client = makeParserRunsClient();
  if (!client) {
    console.log('[parser-run-log] Supabase not configured, skipping log');
    return;
  }
  try {
    await client.from('parser_runs').insert({
      trigger,
      status: ok ? 'ok' : 'error',
      elapsed_ms: elapsedMs,
      posts_found: postsFound,
      error_message: error ?? null,
    });
    console.log(`[parser-run-log] logged run: trigger=${trigger} ok=${ok} posts=${postsFound}`);
  } catch (err) {
    console.error('[parser-run-log] failed to write log:', err);
  }
}

// YC Functions handler: timer (cron) или ручной POST /run
export const handler = async (event?: YCEvent): Promise<YCResponse> => {
  const startedAt = Date.now();
  const path = event?.path ?? '/';
  const method = event?.httpMethod?.toUpperCase?.() ?? 'TIMER';

  // Таймер-триггер (event undefined) или POST /run
  const isManual = method === 'POST' && path === '/run';

  if (isManual) {
    if (!checkSecret(event!.headers)) {
      return json(401, { error: 'Unauthorized' });
    }
  }

  try {
    const postsCount = await parseAllChannels();
    const elapsed = Date.now() - startedAt;
    await logParserRun(isManual ? 'manual' : 'scheduled', true, elapsed, postsCount);
    return json(200, { ok: true, elapsed, manual: isManual });
  } catch (err) {
    const elapsed = Date.now() - startedAt;
    console.error('[parser] fatal error:', err);
    await logParserRun(isManual ? 'manual' : 'scheduled', false, elapsed, 0, String(err));
    return json(500, { ok: false, error: String(err) });
  }
};
