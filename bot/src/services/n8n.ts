import type { N8nConfirmPayload, N8nStatusPayload, N8nFollowUpPayload, N8nVacancyPayload } from '../types';
import { config } from '../config';
import { errorMessage } from '../utils/html';

const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function readBody(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 1000);
  } catch {
    return '';
  }
}

async function postToN8n(url: string, payload: object): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.n8nTimeoutMs);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (res.ok) return;

      const body = await readBody(res);
      const message = `n8n ${res.status}: ${body || res.statusText}`;
      if (!RETRYABLE_STATUSES.has(res.status) || attempt === 2) {
        throw new Error(message);
      }
      lastError = new Error(message);
    } catch (err) {
      lastError = err;
      if (attempt === 2) break;
    } finally {
      clearTimeout(timeout);
    }

    await sleep(250 * attempt);
  }

  throw new Error(`n8n request failed: ${errorMessage(lastError)}`);
}

export async function sendVacancyToN8n(payload: N8nVacancyPayload): Promise<void> {
  await postToN8n(config.n8nVacancyWebhook, payload);
}

export async function sendConfirmation(payload: N8nConfirmPayload): Promise<void> {
  await postToN8n(config.n8nConfirmWebhook, payload);
}

export async function sendStatusUpdate(payload: N8nStatusPayload): Promise<void> {
  await postToN8n(config.n8nStatusWebhook, payload);
}

export async function sendFollowUpAction(payload: N8nFollowUpPayload): Promise<void> {
  await postToN8n(config.n8nFollowupWebhook, payload);
}
