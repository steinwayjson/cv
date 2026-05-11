export type VacancyStatus = 'new' | 'sent' | 'replied' | 'interview' | 'rejected' | 'offer' | 'closed';

export const CLOSED_REASONS = [
  'rejected_by_me',
  'rejected_by_company',
  'ghosted',
  'low_salary',
  'irrelevant',
  'spam',
  'duplicate',
  'archived',
] as const;

export type ClosedReason = typeof CLOSED_REASONS[number];

export type Category = 'горячая' | 'норм' | 'мимо';
export type Source = 'HH' | 'TG' | 'LinkedIn' | 'Сайт' | string;
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
  last_stage?: VacancyStatus | null; // статус до rejected/closed
  closed_reason?: ClosedReason | null; // причина закрытия (при status === 'closed')
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
  score?: number;
  category?: Category;
  reason?: string;
  analyzer_text?: string;
  letter?: string;
  letter_edited?: string;
  model?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  order_index: number;
  color: string;
  source?: string | null;
  is_active?: boolean;
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
  depth_days: number;      // глубина сбора при первом запуске, дефолт 40
  last_run_at: string | null; // когда последний раз запускался
}

export interface ParserRun {
  id: string;
  created_at: string;
  trigger: 'scheduled' | 'manual';
  status: 'ok' | 'error';
  elapsed_ms: number;
  posts_found: number;
  error_message: string | null;
  channel_id: string | null; // uuid канала (нулл = запуск всех каналов)
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
  status: 'new' | 'processing' | 'done' | 'skipped';
}
