import * as dotenv from 'dotenv';

dotenv.config();

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function requiredEnv(name: string): string {
  const value = readEnv(name);
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export function requiredNumberEnv(name: string): number {
  const raw = requiredEnv(name);
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`${name} must be a number`);
  return value;
}

export function optionalNumberEnv(name: string, fallback: number): number {
  const raw = readEnv(name);
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export const config = {
  get botToken() {
    return requiredEnv('BOT_TOKEN');
  },
  get ownerChatId() {
    return requiredNumberEnv('OWNER_CHAT_ID');
  },
  get internalSecret() {
    return readEnv('INTERNAL_SECRET') ?? '';
  },
  get supabaseUrl() {
    return requiredEnv('SUPABASE_URL');
  },
  get supabaseServiceKey() {
    return requiredEnv('SUPABASE_SERVICE_KEY');
  },
  get n8nVacancyWebhook() {
    return requiredEnv('N8N_VACANCY_WEBHOOK');
  },
  get n8nConfirmWebhook() {
    return requiredEnv('N8N_CONFIRM_WEBHOOK');
  },
  get n8nStatusWebhook() {
    return requiredEnv('N8N_STATUS_WEBHOOK');
  },
  get n8nFollowupWebhook() {
    return requiredEnv('N8N_FOLLOWUP_WEBHOOK');
  },
  get n8nTimeoutMs() {
    return optionalNumberEnv('N8N_TIMEOUT_MS', 8000);
  },
};
