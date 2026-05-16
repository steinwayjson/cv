/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ЗАГЛУШКА ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Раньше хук лез в БД и собирал уникальные источники из вакансий + pipeline_stages.
 * Теперь все источники живут в FIXED_SOURCES — едином реестре.
 *
 * Хук оставлен для обратной совместимости, но больше не делает запросов.
 * Новый код должен импортировать FIXED_SOURCES напрямую.
 *
 * @see lib/constants/sources.ts
 */

import { FIXED_SOURCES } from '../lib/constants/sources';

/** Всегда возвращает FIXED_SOURCES — больше не ходит в БД */
export function useDistinctSources(): string[] {
  return [...FIXED_SOURCES];
}

export function usePipelineSources() {
  return { data: undefined, isLoading: false };
}

export function useVacancySources() {
  return { data: undefined, isLoading: false };
}
