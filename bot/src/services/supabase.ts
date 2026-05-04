import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface WizardSession {
  step: 'url' | 'text' | 'site' | 'company_text';
  vacancy_url?: string;
  vacancy_text?: string;
  company_site?: string;
  company_text?: string;
  last_update_id?: number;
}

function throwIfError(scope: string, error: { message: string } | null): void {
  if (error) throw new Error(`${scope}: ${error.message}`);
}

export async function getSession(chatId: number): Promise<WizardSession | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('step, vacancy_link, vacancy_text, site, company_text, last_update_id')
    .eq('chat_id', chatId)
    .maybeSingle();

  throwIfError('Session read', error);
  if (!data) return null;

  return {
    step: data.step as WizardSession['step'],
    vacancy_url: data.vacancy_link ?? undefined,
    vacancy_text: data.vacancy_text ?? undefined,
    company_site: data.site ?? undefined,
    company_text: data.company_text ?? undefined,
    last_update_id: data.last_update_id ?? undefined,
  };
}

export async function saveSession(chatId: number, session: WizardSession): Promise<void> {
  const payload = {
    chat_id: chatId,
    step: session.step,
    vacancy_link: session.vacancy_url ?? null,
    vacancy_text: session.vacancy_text ?? null,
    site: session.company_site ?? null,
    company_text: session.company_text ?? null,
    last_update_id: session.last_update_id ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error: updateError } = await supabase
    .from('sessions')
    .update(payload)
    .eq('chat_id', chatId)
    .select('chat_id')
    .maybeSingle();

  throwIfError('Session update', updateError);
  if (updated) return;

  const { error: insertError } = await supabase.from('sessions').insert(payload);
  throwIfError('Session insert', insertError);
}

export async function deleteSession(chatId: number): Promise<void> {
  const { error } = await supabase.from('sessions').delete().eq('chat_id', chatId);
  throwIfError('Session delete', error);
}

export async function checkDuplicateVacancy(link: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('vacancies')
    .select('id')
    .eq('link', link)
    .limit(1)
    .maybeSingle();

  throwIfError('Vacancy duplicate check', error);
  return data !== null;
}

export async function updateVacancyStatus(vacancyId: string, status: string): Promise<void> {
  const { error } = await supabase.from('vacancies').update({ status }).eq('id', vacancyId);
  throwIfError('Vacancy status update', error);
}
