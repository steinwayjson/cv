export interface GeneratedLetter {
  vacancy_id: string;
  company_name: string;
  contact_name?: string;
  letter_text: string;
  channel: 'hh' | 'telegram' | 'email';
}

export interface FollowUpNotification {
  vacancy_id: string;
  company_name: string;
  sent_at: string;
}

export interface N8nVacancyPayload {
  vacancy_url: string;
  vacancy_text: string;
  company_site?: string;
  company_text?: string;
}

export interface N8nConfirmPayload {
  vacancy_id: string;
  action: 'send' | 'edit';
}

/** Canonical статусы бизнес-воронки */
export type CanonicalStatus = 'new' | 'sent' | 'replied' | 'interview' | 'offer' | 'closed';

/** Технический пайплайн обработки (RawVacancy) */
export type PipelineStatus = 'new' | 'processing' | 'done' | 'error' | 'skipped';

export interface N8nStatusPayload {
  vacancy_id: string;
  status: CanonicalStatus;
}

export interface N8nFollowUpPayload {
  vacancy_id: string;
  action: 'send_followup' | 'skip';
}

/** Маппинг старых/алиасных статусов в canonical */
export const STATUS_ALIASES: Record<string, CanonicalStatus> = {
  sobes: 'interview',
  meeting: 'interview',
  rejected: 'closed',
  archive: 'closed',
  done: 'new',
};
