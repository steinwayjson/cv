import type { Vacancy, PipelineStage, Profile, AgentConfig } from './types';

export const mockVacancies: Vacancy[] = Array.from({ length: 15 }, (_, i) => ({
  id: `mock-${i}`,
  company_id: `company-${i % 5}`,
  company_name: [
    'Яндекс', 'Т-Банк', 'Сбер', 'VK', 'Ozon',
  ][i % 5],
  role: [
    'Senior Frontend Developer',
    'React Developer',
    'Fullstack Engineer',
    'Tech Lead',
    'Node.js Developer',
  ][i % 5],
  salary: ['300-350K', '250-400K', '280-330K', '350-500K', '200-300K'][i % 5],
  status: (['new', 'sent', 'replied', 'interview', 'offer', 'closed'] as const)[i % 6],
  current_stage_id: null,
  last_stage: null,
  closed_reason: null,
  source: (['HeadHunter', 'Telegram', 'LinkedIn', 'Other', 'HeadHunter', 'Telegram'] as const)[i % 6],
  notes: null as any,
  next_action: null as any,
  next_action_at: null as any,
  published_at: new Date(Date.now() - i * 86400000).toISOString(),
  priority: i < 3 ? 'высокий' : i < 6 ? 'средний' : 'низкий',
  parser_prompt_version: i % 3 + 1,
  parsed_at: new Date(Date.now() - i * 86400000).toISOString(),
  score: [undefined, 85, 45, 92, 30, 70][i % 6],
  category: ([undefined, 'горячая', 'норм', 'горячая', 'мимо', 'норм'] as const)[i % 6],
  reason: null as any,
}));

export const mockPipelineStages: PipelineStage[] = [
  { id: 'base-0', name: 'Новые',           color: '#6B7280', order_index: 1, source: null, is_base: true, base_key: 'new',        canonical_status: 'new' },
  { id: 'base-1', name: 'Отправлено',      color: '#3B82F6', order_index: 2, source: null, is_base: true, base_key: 'sent',       canonical_status: 'sent' },
  { id: 'base-2', name: 'Ответ получен',   color: '#EAB308', order_index: 3, source: null, is_base: true, base_key: 'replied',    canonical_status: 'replied' },
  { id: 'base-3', name: 'Собеседование',   color: '#8B5CF6', order_index: 4, source: null, is_base: true, base_key: 'interview', canonical_status: 'interview' },
  { id: 'base-4', name: 'Оффер',           color: '#10B981', order_index: 5, source: null, is_base: true, base_key: 'offer',      canonical_status: 'offer' },
  { id: 'base-5', name: 'Закрыто',         color: '#EF4444', order_index: 6, source: null, is_base: true, base_key: 'closed',    canonical_status: 'closed' },

  // Source-specific оверрайды
  { id: 'hh-3',  name: 'Ответ HR',      color: '#F59E0B', order_index: 4, source: 'HeadHunter', base_key: 'replied',    canonical_status: 'replied' },
  { id: 'hh-4',  name: 'Собеседование', color: '#8B5CF6', order_index: 5, source: 'HeadHunter', base_key: 'interview',  canonical_status: 'interview' },
  { id: 'tg-3',  name: 'Ответили',      color: '#F59E0B', order_index: 4, source: 'Telegram',   base_key: 'replied',    canonical_status: 'replied' },
  { id: 'tg-4',  name: 'Собеседование', color: '#8B5CF6', order_index: 5, source: 'Telegram',   base_key: 'interview',  canonical_status: 'interview' },
];

export const mockProfile: Profile = {
  id: 'mock-profile',
  content: 'Fullstack-разработчик, 8 лет опыта...',
};

export const mockAgentConfig: AgentConfig = {
  id: 'mock-scorer',
  name: 'scorer',
  system_prompt: 'Оценивай релевантность...',
  params: {
    min_salary: 100000,
    work_formats: ['remote', 'hybrid'],
    stop_words: ['senior', 'team lead'],
  },
};
