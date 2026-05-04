import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { mockVacancies, mockPipelineStages, mockProfile, mockAgentConfig } from './mockData';
import type { Vacancy, PipelineStage, Profile, AgentConfig, Prompt, PromptKey, AgentKey, AnalysisLog, TgChannel, ParserRun } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const USE_MOCK = !SUPABASE_URL || !SUPABASE_ANON_KEY;
const PROMPT_KEY_ORDER: PromptKey[] = ['profile', 'parser', 'scoring', 'analyzer', 'copywriter'];

// Синглтон — один экземпляр на всё приложение
declare global { interface Window { __supabase?: SupabaseClient } }
if (!USE_MOCK && !window.__supabase) {
  window.__supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
export const supabase = USE_MOCK ? null : (window.__supabase as SupabaseClient);

// ─── Пресеты воронок по источникам ─────────────────────────────────────────
type PresetStage = { name: string; color: string };
export const PRESET_SOURCES = ['HH', 'TG', 'LinkedIn', 'Сайт'];

export const PIPELINE_PRESETS: Record<string, PresetStage[]> = {
  default: [
    { name: 'Новые',              color: '#6B7280' },
    { name: 'Отправлено',         color: '#3B82F6' },
    { name: 'Ответ получен',      color: '#F59E0B' },
    { name: 'Интервью',           color: '#8B5CF6' },
    { name: 'Оффер',              color: '#10B981' },
  ],
  HH: [
    { name: 'Найдено на HH',      color: '#D6001C' }, // HH red
    { name: 'Откликнулся',        color: '#E05B5B' },
    { name: 'Ответ HR',           color: '#F59E0B' },
    { name: 'Техническое',        color: '#8B5CF6' },
    { name: 'Оффер',              color: '#10B981' },
  ],
  TG: [
    { name: 'Нашёл в канале',     color: '#6B7280' },
    { name: 'Написал в ЛС',       color: '#2AABEE' }, // Telegram blue
    { name: 'Ответили',           color: '#F59E0B' },
    { name: 'Созвон',             color: '#8B5CF6' },
    { name: 'Оффер',              color: '#10B981' },
  ],
  LinkedIn: [
    { name: 'Нашёл профиль',      color: '#6B7280' },
    { name: 'Отправил InMail',    color: '#0A66C2' }, // LinkedIn blue
    { name: 'Ответили',           color: '#F59E0B' },
    { name: 'Интервью',           color: '#8B5CF6' },
    { name: 'Оффер',              color: '#10B981' },
  ],
  'Сайт': [
    { name: 'Нашёл вакансию',     color: '#6B7280' },
    { name: 'Занёс в CRM',        color: '#6366F1' },
    { name: 'Откликнулся',        color: '#F59E0B' },
    { name: 'Интервью',           color: '#8B5CF6' },
    { name: 'Оффер',              color: '#10B981' },
  ],
};

function getPipelinePreset(source: string | null): PresetStage[] {
  if (!source) return PIPELINE_PRESETS.default;
  const presetKey = Object.keys(PIPELINE_PRESETS).find(
    key => key.toLowerCase() === source.toLowerCase()
  );
  return PIPELINE_PRESETS[presetKey ?? 'default'];
}

let mockVacanciesStore = [...mockVacancies];
let mockPipelineStore = [...mockPipelineStages];
let mockProfileStore = { ...mockProfile };
let mockAgentConfigStore = { ...mockAgentConfig };
let mockPromptStore: Prompt[] = PROMPT_KEY_ORDER.map((key, index) => ({
  id: `mock-prompt-${key}`,
  key,
  version: 1,
  name: ['Профиль кандидата', 'Агент парсер', 'Агент скоринг', 'Агент аналитик', 'Агент копирайтер'][index] ?? key,
  content: '',
  description: null,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

function sortPrompts(prompts: Prompt[]): Prompt[] {
  return [...prompts].sort((a, b) => {
    const orderA = PROMPT_KEY_ORDER.indexOf(a.key);
    const orderB = PROMPT_KEY_ORDER.indexOf(b.key);
    const normalizedA = orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA;
    const normalizedB = orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB;
    if (normalizedA !== normalizedB) return normalizedA - normalizedB;
    if (a.key !== b.key) return String(a.key).localeCompare(String(b.key));
    return b.version - a.version;
  });
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface LetterParts {
  subject?: string;
  body: string;
  ps?: string;
}

export function parseLetterParts(value: unknown): LetterParts | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const cleaned = value
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const obj = parsed as Record<string, unknown>;
      // {subject, body, ps} — формат копирайтера
      if (typeof obj.body === 'string' && obj.body.trim()) {
        return {
          subject: typeof obj.subject === 'string' ? obj.subject.trim() : undefined,
          body: obj.body.trim(),
          ps: typeof obj.ps === 'string' && obj.ps.trim() ? obj.ps.trim() : undefined,
        };
      }
      // {letter}/{text}/{content}
      const extracted = obj.letter ?? obj.text ?? obj.content;
      if (typeof extracted === 'string' && extracted.trim()) return { body: extracted.trim() };
    }
  } catch { /* не JSON */ }
  return { body: cleaned };
}

function extractLetterText(value: unknown): string | null {
  const parts = parseLetterParts(value);
  if (!parts) return null;
  const lines = [parts.subject ? `Тема: ${parts.subject}` : null, parts.body, parts.ps ? `P.S. ${parts.ps}` : null].filter(Boolean);
  return lines.join('\n\n');
}

function normalizeLetterRow(row: any): Partial<Vacancy> {
  if (!row) return {};
  return {
    ...(row.letter != null ? { letter: extractLetterText(row.letter) ?? row.letter } : {}),
    ...(row.letter_edited != null ? { letter_edited: extractLetterText(row.letter_edited) ?? row.letter_edited } : {}),
    ...(row.model != null ? { model: row.model } : {}),
  };
}

function getTextFromLog(log: any): string | null {
  if (!log) return null;
  if (typeof log.raw_output === 'string' && log.raw_output.trim()) {
    const cleaned = log.raw_output
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    // Если raw_output — JSON-строка (напр. от copywriter), пробуем извлечь текст письма
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const extracted = (parsed as Record<string, unknown>).letter
          ?? (parsed as Record<string, unknown>).text
          ?? (parsed as Record<string, unknown>).content;
        if (typeof extracted === 'string' && extracted.trim()) return extracted.trim();
      }
    } catch { /* не JSON — используем как есть */ }
    return cleaned;
  }
  if (typeof log.parsed_output === 'string' && log.parsed_output.trim()) {
    return log.parsed_output.trim();
  }
  if (log.parsed_output && typeof log.parsed_output === 'object') {
    const output = log.parsed_output as Record<string, unknown>;
    const text = output.text ?? output.letter ?? output.content ?? output.analysis ?? output.result;
    if (typeof text === 'string' && text.trim()) return text.trim();
    return JSON.stringify(output, null, 2);
  }
  return null;
}

export const db = {
  vacancies: {
    async getAll(): Promise<Vacancy[]> {
      if (supabase) {
        const { data: vacData, error: vacError } = await supabase
          .from('vacancies')
          .select('id, company_id, link, role, salary, status, last_stage, source, notes, next_action, next_action_at, published_at, priority, source_type, score, category, reason, parser_prompt_version, parsed_at, analyzer_prompt_version, analyzed_at, scoring_prompt_version, scored_at, copywriter_prompt_version, copywritten_at, companies (name, site, branch)')
          .order('published_at', { ascending: false, nullsFirst: false })
          .limit(200);
        if (vacError) throw vacError;

        return (vacData || []).map((v: any) => ({
          ...v,
          company_name: v.companies?.name,
          company_site: v.companies?.site,
          company_branch: v.companies?.branch,
        }));
      }
      await delay(300);
      return mockVacanciesStore;
    },

    async getSources(): Promise<string[]> {
      if (supabase) {
        const { data, error } = await supabase
          .from('vacancies')
          .select('source')
          .not('source', 'is', null)
          .limit(200);
        if (error) throw error;
        return Array.from(
          new Map((data || []).map((row: any) => [String(row.source).toLowerCase(), String(row.source)])).values()
        );
      }
      await delay(100);
      return Array.from(
        new Map(mockVacanciesStore.map(v => [v.source.toLowerCase(), v.source] as const)).values()
      );
    },

    async getById(id: string): Promise<Vacancy | null> {
      if (supabase) {
        const { data: vac, error: vacError } = await supabase
          .from('vacancies')
          .select('*, companies (name, site, branch)')
          .eq('id', id)
          .single();
        if (vacError) throw vacError;
        if (!vac) return null;
        const { data: analysis, error: analysisError } = await supabase
          .from('vacancy_analysis')
          .select('letter, letter_edited, model')
          .eq('vacancy_id', id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (analysisError) throw analysisError;

        const { data: agentLogs, error: logsError } = await supabase
          .from('analysis_log')
          .select('agent, prompt_key, raw_output, parsed_output, error')
          .eq('vacancy_id', id)
          .order('created_at', { ascending: false })
          .limit(20);
        if (logsError) throw logsError;

        const analyzerLog = (agentLogs || []).find((log: any) =>
          String(log.agent).toLowerCase().trim() === 'analyzer' ||
          String(log.prompt_key).toLowerCase().trim() === 'analyzer'
        );
        const copywriterLog = (agentLogs || []).find((log: any) =>
          String(log.agent).toLowerCase().trim() === 'copywriter' ||
          String(log.prompt_key).toLowerCase().trim() === 'copywriter'
        );
        const currentLetter = normalizeLetterRow(analysis);
        const loggedLetter = getTextFromLog(copywriterLog);
        const analyzerText = getTextFromLog(analyzerLog);

        return {
          ...vac,
          company_name: vac.companies?.name,
          company_site: vac.companies?.site,
          company_branch: vac.companies?.branch,
          ...currentLetter,
          ...(currentLetter.letter ? {} : loggedLetter ? { letter: loggedLetter } : {}),
          ...(analyzerText ? { analyzer_text: analyzerText } : {}),
        };
      }
      await delay(200);
      return mockVacanciesStore.find(v => v.id === id) || null;
    },

    async updateStatus(id: string, status: string, lastStage?: string): Promise<void> {
      if (supabase) {
        const payload: Record<string, string | null> = { status };
        if (status === 'rejected' && lastStage) payload.last_stage = lastStage;
        // Если выходим из rejected — сбрасываем last_stage
        if (status !== 'rejected') payload.last_stage = null;
        const { error } = await supabase.from('vacancies').update(payload).eq('id', id);
        if (error) throw error;
        return;
      }
      await delay(100);
      const vacancy = mockVacanciesStore.find(v => v.id === id);
      if (vacancy) {
        if (status === 'rejected' && lastStage) vacancy.last_stage = lastStage as any;
        if (status !== 'rejected') vacancy.last_stage = null;
        vacancy.status = status as any;
      }
    },

    async updateNotes(id: string, notes: string, nextAction?: string, nextActionAt?: string): Promise<void> {
      if (supabase) {
        const { error } = await supabase.from('vacancies').update({
          notes,
          next_action: nextAction,
          next_action_at: nextActionAt,
        }).eq('id', id);
        if (error) throw error;
        return;
      }
      await delay(100);
      const vacancy = mockVacanciesStore.find(v => v.id === id);
      if (vacancy) {
        vacancy.notes = notes;
        vacancy.next_action = nextAction;
        vacancy.next_action_at = nextActionAt;
      }
    },

    async updateLetter(id: string, letterEdited: string): Promise<void> {
      if (supabase) {
        const { error } = await supabase.from('vacancy_analysis').update({ letter_edited: letterEdited }).eq('vacancy_id', id);
        if (error) throw error;
        return;
      }
      await delay(100);
      const vacancy = mockVacanciesStore.find(v => v.id === id);
      if (vacancy) {
        vacancy.letter_edited = letterEdited;
      }
    },

    async delete(id: string): Promise<void> {
      if (supabase) {
        const { error } = await supabase.from('vacancies').delete().eq('id', id);
        if (error) throw error;
        return;
      }
      await delay(100);
      mockVacanciesStore = mockVacanciesStore.filter(v => v.id !== id);
    },
  },

  pipeline: {
    // source = undefined → дефолтная воронка (null в БД)
    // source = 'HH' → воронка для конкретного источника (fallback → дефолт)
    // strict = true → только exact match, без fallback на дефолт (для редактора)
    async getStages(source?: string, strict = false): Promise<PipelineStage[]> {
      if (supabase) {
        if (source) {
          const { data: specific, error: specificErr } = await supabase
            .from('pipeline_stages')
            .select('*')
            .ilike('source', source)
            .order('order_index', { ascending: true });
          if (strict) {
            // Если колонка source ещё не существует (migration не выполнена) — graceful fallback
            if (specificErr) {
              // column doesn't exist — падаем на все этапы (не-strict поведение)
            } else {
              return specific || [];
            }
          } else {
            if (!specificErr && specific && specific.length > 0) return specific;
          }
        }
        // Дефолтные (source IS NULL) — если колонка ещё не добавлена, fallback на все этапы
        const { data, error } = await supabase
          .from('pipeline_stages')
          .select('*')
          .is('source', null)
          .order('order_index', { ascending: true });
        if (!error) return data || [];
        // Колонка source не существует — вернуть все этапы без фильтра
        const { data: all } = await supabase
          .from('pipeline_stages')
          .select('*')
          .order('order_index', { ascending: true });
        return all || [];
      }
      await delay(200);
      if (source) {
        const specific = mockPipelineStore.filter(s => s.source?.toLowerCase() === source.toLowerCase());
        if (strict || specific.length > 0) return specific;
      }
      return mockPipelineStore.filter(s => !s.source);
    },

    async getSources(): Promise<string[]> {
      if (supabase) {
        const { data, error } = await supabase
          .from('pipeline_stages')
          .select('source')
          .not('source', 'is', null)
          .limit(200);
        if (error) throw error;
        return Array.from(
          new Map((data || []).map((row: any) => [String(row.source).toLowerCase(), String(row.source)])).values()
        );
      }
      await delay(100);
      return Array.from(
        new Map(
          mockPipelineStore
            .map(s => s.source)
            .filter(Boolean)
            .map(source => [source!.toLowerCase(), source!] as const)
        ).values()
      );
    },

    async updateStages(stages: PipelineStage[]): Promise<void> {
      if (supabase) {
        const { error } = await supabase.from('pipeline_stages').upsert(stages);
        if (error) throw error;
        return;
      }
      await delay(100);
      const byId = new Map(stages.map(stage => [stage.id, stage]));
      mockPipelineStore = mockPipelineStore.map(stage => byId.get(stage.id) ?? stage);
      const existingIds = new Set(mockPipelineStore.map(stage => stage.id));
      mockPipelineStore = [
        ...mockPipelineStore,
        ...stages.filter(stage => !existingIds.has(stage.id)),
      ];
    },

    async addStage(name: string, color: string, orderIndex: number, source?: string): Promise<PipelineStage> {
      if (supabase) {
        const { data, error } = await supabase
          .from('pipeline_stages')
          .insert({ name, color, order_index: orderIndex, ...(source ? { source } : {}) })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      await delay(100);
      const newStage: PipelineStage = { id: Date.now().toString(), name, color, order_index: orderIndex, source };
      mockPipelineStore = [...mockPipelineStore, newStage];
      return newStage;
    },

    async deleteStage(id: string): Promise<void> {
      if (supabase) {
        const { error } = await supabase.from('pipeline_stages').delete().eq('id', id);
        if (error) throw error;
        return;
      }
      await delay(100);
      mockPipelineStore = mockPipelineStore.filter(s => s.id !== id);
    },

    async renameStage(id: string, name: string): Promise<void> {
      if (supabase) {
        const { error } = await supabase.from('pipeline_stages').update({ name }).eq('id', id);
        if (error) throw error;
        return;
      }
      await delay(100);
      const stage = mockPipelineStore.find(s => s.id === id);
      if (stage) stage.name = name;
    },

    // Заполнить пресеты для всех источников (только если этапов ещё нет)
    async seedPreset(sources: string[]): Promise<void> {
      const slots: Array<string | null> = [null, ...sources];

      if (supabase) {
        for (const source of slots) {
          const q = supabase.from('pipeline_stages').select('id', { count: 'exact', head: true });
          const query = source === null ? q.is('source', null) : q.ilike('source', source);
          const { count } = await query;
          if (count && count > 0) continue; // уже есть — не перетираем

          const preset = getPipelinePreset(source);
          await supabase.from('pipeline_stages').insert(
            preset.map((p, idx) => ({
              name: p.name,
              color: p.color,
              order_index: idx + 1,
              source,
            }))
          );
        }
        return;
      }

      // Mock mode
      await delay(300);
      for (const source of slots) {
        const hasStages = mockPipelineStore.some(s =>
          source === null ? !s.source : s.source?.toLowerCase() === source.toLowerCase()
        );
        if (hasStages) continue;
        const presetKey = source ?? 'default';
        const preset = getPipelinePreset(source);
        mockPipelineStore = [
          ...mockPipelineStore,
          ...preset.map((p, idx) => ({
            id: `preset-${presetKey}-${idx}`,
            name: p.name,
            color: p.color,
            order_index: idx + 1,
            source: source ?? undefined,
          })),
        ];
      }
    },

    async seedPresetFast(sources: string[]): Promise<void> {
      const uniqueSources = Array.from(
        new Map(sources.map(source => [source.toLowerCase(), source] as const)).values()
      );
      const slots: Array<string | null> = [null, ...uniqueSources];

      if (supabase) {
        const { data: existing, error } = await supabase
          .from('pipeline_stages')
          .select('source');
        if (error) throw error;

        const existingSources = new Set(
          (existing || []).map((stage: any) => (stage.source ?? '__default__').toLowerCase())
        );
        const rows = slots.flatMap(source => {
          const sourceKey = (source ?? '__default__').toLowerCase();
          if (existingSources.has(sourceKey)) return [];
          return getPipelinePreset(source).map((p, idx) => ({
            name: p.name,
            color: p.color,
            order_index: idx + 1,
            source,
          }));
        });

        if (rows.length > 0) {
          const { error: insertError } = await supabase.from('pipeline_stages').insert(rows);
          if (insertError) throw insertError;
        }
        return;
      }

      await delay(100);
      for (const source of slots) {
        const hasStages = mockPipelineStore.some(s =>
          source === null ? !s.source : s.source?.toLowerCase() === source.toLowerCase()
        );
        if (hasStages) continue;
        const presetKey = source ?? 'default';
        mockPipelineStore = [
          ...mockPipelineStore,
          ...getPipelinePreset(source).map((p, idx) => ({
            id: `preset-${presetKey}-${idx}`,
            name: p.name,
            color: p.color,
            order_index: idx + 1,
            source: source ?? undefined,
          })),
        ];
      }
    },
  },

  agentConfig: {
    async get(): Promise<AgentConfig> {
      const fallback: AgentConfig = {
        id: '',
        name: 'scorer',
        system_prompt: '',
        params: { min_salary: 0, work_formats: [], stop_words: [] },
      };
      if (supabase) {
        const { data, error } = await supabase
          .from('agent_configs')
          .select('*')
          .eq('name', 'scorer')
          .maybeSingle();
        // Если таблица не существует — вернуть fallback без крэша
        if (error) return fallback;
        return data || fallback;
      }
      await delay(200);
      return mockAgentConfigStore;
    },

    async update(config: Partial<AgentConfig>): Promise<void> {
      if (supabase) {
        const { id, ...fields } = config;
        const { error } = await supabase.from('agent_configs').upsert(
          { name: 'scorer', ...fields, updated_at: new Date().toISOString() },
          { onConflict: 'name' },
        );
        if (error) throw error;
        return;
      }
      await delay(100);
      mockAgentConfigStore = { ...mockAgentConfigStore, ...config };
    },
  },

  profile: {
    async get(): Promise<Profile> {
      if (supabase) {
        const { data } = await supabase.from('profile').select('id, content').maybeSingle();
        return data || { id: '', content: '' };
      }
      await delay(200);
      return mockProfileStore;
    },

    async update(profile: Partial<Profile>): Promise<void> {
      if (supabase) {
        const { id, ...fields } = profile;
        if (!id) return;
        const { error } = await supabase.from('profile').update(fields).eq('id', id);
        if (error) throw error;
        return;
      }
      await delay(100);
      mockProfileStore = { ...mockProfileStore, ...profile };
    },
  },

  prompts: {
    async getAll(): Promise<Prompt[]> {
      if (supabase) {
        const { data, error } = await supabase
          .from('prompts')
          .select('id, key, version, name, content, description, is_active, created_at, updated_at')
          .eq('is_active', true)
          .order('key', { ascending: true });
        if (error) throw error;
        return sortPrompts((data || []) as Prompt[]);
      }
      await delay(200);
      return sortPrompts(mockPromptStore.filter(prompt => prompt.is_active));
    },

    async getVersions(key: PromptKey, limit = 5): Promise<Prompt[]> {
      if (supabase) {
        const { data, error } = await supabase
          .from('prompts')
          .select('id, key, version, name, content, description, is_active, created_at, updated_at')
          .eq('key', key)
          .order('version', { ascending: false })
          .limit(limit);
        if (error) throw error;
        return (data || []) as Prompt[];
      }
      await delay(100);
      return mockPromptStore
        .filter(prompt => prompt.key === key)
        .sort((a, b) => b.version - a.version)
        .slice(0, limit);
    },

    async update(id: string, content: string, description?: string | null): Promise<Prompt | null> {
      const payload: Record<string, string | null> = {
        content,
        updated_at: new Date().toISOString(),
      };
      if (description !== undefined) payload.description = description;

      if (supabase) {
        const { data, error } = await supabase
          .from('prompts')
          .update(payload)
          .eq('id', id)
          .select('id, key, version, name, content, description, is_active, created_at, updated_at')
          .maybeSingle();
        if (error) throw error;
        return data as Prompt | null;
      }
      await delay(100);
      const prompt = mockPromptStore.find(item => item.id === id);
      if (!prompt) return null;
      prompt.content = content;
      if (description !== undefined) prompt.description = description;
      prompt.updated_at = new Date().toISOString();
      return prompt;
    },

    async createVersion(params: {
      key: PromptKey;
      name: string;
      content: string;
      description?: string | null;
    }): Promise<Prompt> {
      if (supabase) {
        const { data: latest, error: latestError } = await supabase
          .from('prompts')
          .select('version')
          .eq('key', params.key)
          .order('version', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (latestError) throw latestError;

        const nextVersion = ((latest as { version?: number } | null)?.version ?? 0) + 1;

        const { data, error } = await supabase
          .from('prompts')
          .insert({
            key: params.key,
            version: nextVersion,
            name: params.name,
            content: params.content,
            description: params.description ?? null,
            is_active: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id, key, version, name, content, description, is_active, created_at, updated_at')
          .single();
        if (error) throw error;

        const created = data as Prompt;

        const { error: deactivateError } = await supabase
          .from('prompts')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('key', params.key)
          .eq('is_active', true);
        if (deactivateError) throw deactivateError;

        const { data: activated, error: activateError } = await supabase
          .from('prompts')
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq('id', created.id)
          .select('id, key, version, name, content, description, is_active, created_at, updated_at')
          .single();
        if (activateError) throw activateError;
        return activated as Prompt;
      }
      await delay(100);
      const nextVersion = Math.max(
        0,
        ...mockPromptStore.filter(prompt => prompt.key === params.key).map(prompt => prompt.version)
      ) + 1;
      mockPromptStore = mockPromptStore.map(prompt =>
        prompt.key === params.key ? { ...prompt, is_active: false, updated_at: new Date().toISOString() } : prompt
      );
      const created: Prompt = {
        id: `mock-prompt-${params.key}-${nextVersion}`,
        key: params.key,
        version: nextVersion,
        name: params.name,
        content: params.content,
        description: params.description ?? null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockPromptStore = [...mockPromptStore, created];
      return created;
    },

    async activateVersion(key: PromptKey, version: number): Promise<Prompt> {
      if (supabase) {
        const { data, error } = await supabase.rpc('activate_prompt_version', {
          p_key: key,
          p_version: version,
        });
        if (error) throw error;
        return data as Prompt;
      }
      await delay(100);
      let activated: Prompt | undefined;
      mockPromptStore = mockPromptStore.map(prompt => {
        if (prompt.key !== key) return prompt;
        const nextPrompt = {
          ...prompt,
          is_active: prompt.version === version,
          updated_at: new Date().toISOString(),
        };
        if (nextPrompt.is_active) activated = nextPrompt;
        return nextPrompt;
      });
      if (!activated) throw new Error(`Prompt ${key}.${version} does not exist`);
      return activated;
    },

    async deleteVersion(id: string): Promise<void> {
      if (supabase) {
        const { data: prompt, error: loadError } = await supabase
          .from('prompts')
          .select('id, is_active')
          .eq('id', id)
          .maybeSingle();
        if (loadError) throw loadError;
        if (!prompt) return;
        if ((prompt as { is_active?: boolean }).is_active) {
          throw new Error('Нельзя удалить активную версию. Сначала сделайте активной другую.');
        }

        const { error } = await supabase.from('prompts').delete().eq('id', id);
        if (error) throw error;
        return;
      }
      await delay(100);
      const prompt = mockPromptStore.find(item => item.id === id);
      if (!prompt) return;
      if (prompt.is_active) throw new Error('Нельзя удалить активную версию. Сначала сделайте активной другую.');
      mockPromptStore = mockPromptStore.filter(item => item.id !== id);
    },
  },

  analysisLog: {
    async getForVacancy(vacancyId: string, agent?: AgentKey, limit = 10): Promise<AnalysisLog[]> {
      if (supabase) {
        let query = supabase
          .from('analysis_log')
          .select('id, created_at, vacancy_id, agent, prompt_key, prompt_version, input, raw_output, parsed_output, model, error')
          .eq('vacancy_id', vacancyId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (agent) query = query.eq('agent', agent);

        const { data, error } = await query;
        if (error) throw error;
        return (data || []) as AnalysisLog[];
      }
      await delay(100);
      return [];
    },

    async delete(id: string): Promise<void> {
      if (supabase) {
        const { error } = await supabase.from('analysis_log').delete().eq('id', id);
        if (error) throw error;
        return;
      }
    },
  },

  tgChannels: {
    async getAll(): Promise<TgChannel[]> {
      if (supabase) {
        const { data } = await supabase
          .from('tg_channels')
          .select('*')
          .order('created_at', { ascending: false });
        return data || [];
      }
      await delay(200);
      return [];
    },

    async add(username: string, title: string): Promise<TgChannel> {
      if (supabase) {
        // Нормализуем username: убираем @ в начале если есть
        const normalized = username.replace(/^@/, '').trim();
        const { data, error } = await supabase
          .from('tg_channels')
          .insert({ username: normalized, title, is_active: true })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      await delay(200);
      return { id: Date.now().toString(), username, title, last_post_id: null, is_active: true, created_at: new Date().toISOString() };
    },

    async toggle(id: string, isActive: boolean): Promise<void> {
      if (supabase) {
        const { error } = await supabase.from('tg_channels').update({ is_active: isActive }).eq('id', id);
        if (error) throw error;
        return;
      }
    },

    async delete(id: string): Promise<void> {
      if (supabase) {
        const { error } = await supabase.from('tg_channels').delete().eq('id', id);
        if (error) throw error;
        return;
      }
      await delay(100);
    },
  },

  parserRuns: {
    async getRecent(limit = 10): Promise<ParserRun[]> {
      if (supabase) {
        const { data } = await supabase
          .from('parser_runs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        return data || [];
      }
      await delay(200);
      return [];
    },
  },
};
