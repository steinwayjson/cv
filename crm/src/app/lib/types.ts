import type { Source } from './constants/sources';
export type { Source };

/** Бизнес-воронка вакансий (CRM) */
export type VacancyStatus = 'new' | 'sent' | 'replied' | 'interview' | 'offer' | 'closed';

export const VACANCY_STATUSES: readonly VacancyStatus[] = [
  'new', 'sent', 'replied', 'interview', 'offer', 'closed',
] as const;

/** Группа статуса: active — в работе, terminal — завершён */
export type StatusGroup = 'active' | 'terminal';

export const STATUS_GROUP: Record<VacancyStatus, StatusGroup> = {
  new:       'active',
  sent:      'active',
  replied:   'active',
  interview: 'active',
  offer:     'active',
  closed:    'terminal',
};

export const ACTIVE_STATUSES: readonly VacancyStatus[] = VACANCY_STATUSES.filter(
  s => STATUS_GROUP[s] === 'active'
);
export const TERMINAL_STATUSES: ReadonlySet<VacancyStatus> = new Set(
  VACANCY_STATUSES.filter(s => STATUS_GROUP[s] === 'terminal')
);

/**
 * Матрица допустимых переходов:
 * - Forward: любой статус дальше по воронке (free forward)
 * - Rollback: ровно на 1 шаг назад (constrained rollback)
 * - Closed: терминальный, только reopen()
 */
export const STATUS_TRANSITIONS: Record<VacancyStatus, VacancyStatus[]> = {
  new:       ['sent', 'replied', 'interview', 'offer', 'closed'],
  sent:      ['replied', 'interview', 'offer', 'closed', 'new'],
  replied:   ['interview', 'offer', 'closed', 'sent'],
  interview: ['offer', 'closed', 'replied'],
  offer:     ['closed', 'interview'],
  closed:    [],  // только reopen()
};

/** Причины закрытия — сгруппированы по типу */
export type ClosedReasonType = 'pipeline' | 'quality' | 'system';

/** Причины закрытия вакансии */
export const CLOSED_REASONS = [
  'irrelevant',
  'no_response',
  'salary',
  'position_closed',
  'rejected',
  'ghosted',
  'duplicate',
  'spam',
  'other',
] as const;

export type ClosedReason = typeof CLOSED_REASONS[number];

export const CLOSED_REASON_TYPE: Record<ClosedReason, ClosedReasonType> = {
  irrelevant:       'quality',
  no_response:      'pipeline',
  salary:           'pipeline',
  position_closed:  'pipeline',
  rejected:         'pipeline',
  ghosted:          'pipeline',
  duplicate:        'system',
  spam:             'quality',
  other:            'system',
};


/** Маппинг старых/внешних статусов в canonical */
export const STATUS_ALIASES: Record<string, VacancyStatus> = {
  sobes: 'interview',
  meeting: 'interview',
  rejected: 'closed',
  archive: 'closed',
  done: 'new',
};

/**
 * Технический пайплайн обработки вакансии.
 * Отдельно от бизнес-воронки — этапы парсинга/обработки n8n.
 */
export type PipelineStatus = 'new' | 'processing' | 'done' | 'error' | 'skipped';

export const PIPELINE_STATUSES: readonly PipelineStatus[] = [
  'new', 'processing', 'done', 'error', 'skipped',
] as const;

export type Category = 'горячая' | 'норм' | 'мимо';
export type PromptKey = 'parser' | 'analyzer' | 'scoring' | 'copywriter' | 'profile' | (string & {});
export type AgentKey = 'parser' | 'analyzer' | 'scoring' | 'copywriter' | (string & {});

export interface Company {
  id: string;
  name: string;
  site?: string;
  branch?: string;
}

export interface VacancyAnalysis {
  vacancy_id: string;
  score: number;
  category: Category;
  reason: string;
  letter: string;
  letter_edited?: string;
  model: string;
}

export interface Vacancy {
  id: string;
  company_id: string;
  link?: string | null;
  role: string;
  salary?: string;
  status: VacancyStatus;
  last_stage?: VacancyStatus | null;   // предыдущий статус (для closed)
  closed_reason?: ClosedReason | null;  // причина закрытия
  source: Source;
  notes?: string;
  next_action?: string;
  next_action_at?: string;
  published_at: string;
  priority?: string;
  source_type?: string;
  company_name?: string;
  company_site?: string;
  company_branch?: string;
  parser_prompt_version?: number | null;
  parsed_at?: string | null;
  analyzer_prompt_version?: number | null;
  analyzed_at?: string | null;
  scoring_prompt_version?: number | null;
  scored_at?: string | null;
  copywriter_prompt_version?: number | null;
  copywritten_at?: string | null;
  pipeline_stage_id?: string | null;
  /** ID текущего этапа воронки (pipeline_stages.id) — для визуального отображения */
  current_stage_id?: string | null;
  score?: number;
  category?: Category;
  reason?: string;
  analyzer_text?: string;
  letter?: string;
  letter_edited?: string;
  model?: string;
  // Business timestamps — даты перехода в ключевые статусы
  sent_at?: string | null;
  replied_at?: string | null;
  closed_at?: string | null;
}


export interface PipelineStage {
  id: string;
  name: string;
  order_index: number;
  color: string;
  source?: string | null;
  is_active?: boolean;
  is_base?: boolean;
  base_key?: string | null;
  /** Канонический статус, в который маппится этот stage (e.g. 'interview') */
  canonical_status?: VacancyStatus | null;
}

export interface Profile {
  id: string;
  content: string;
}

export interface AgentParams {
  min_salary: number;
  work_formats: string[];
  stop_words: string[];
}

export interface AgentConfig {
  id: string;
  name: string;
  system_prompt: string;
  params: AgentParams;
  updated_at?: string;
}

export interface Prompt {
  id: string;
  key: PromptKey;
  version: number;
  name: string;
  content: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AnalysisLog {
  id: string;
  created_at: string;
  vacancy_id?: string | null;
  agent: AgentKey;
  prompt_key: PromptKey;
  prompt_version: number;
  input?: Record<string, unknown> | null;
  raw_output?: string | null;
  parsed_output?: Record<string, unknown> | null;
  model?: string | null;
  error?: string | null;
}

export interface TgChannel {
  id: string;
  username: string;
  title: string;
  last_post_id: number | null;
  is_active: boolean;
  created_at: string;
  depth_days: number;
  last_run_at: string | null;
}

export interface ParserRun {
  id: string;
  created_at: string;
  trigger: 'scheduled' | 'manual';
  status: 'ok' | 'error';
  elapsed_ms: number;
  posts_found: number;
  error_message: string | null;
  channel_id: string | null;
}

export interface RawVacancy {
  id: string;
  source: 'tg' | 'agg' | 'manual';
  tg_message_id: string | null;
  channel_username: string | null;
  raw_text: string;
  post_url: string | null;
  posted_at: string | null;
  created_at: string;
  status: PipelineStatus;
}
