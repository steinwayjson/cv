import type { PipelineStage, VacancyStatus } from './types';
import { normalizeSourceKey } from './sources';

export interface StatusOption {
  value: VacancyStatus;
  label: string;
  color: string;
}

/** 6 базовых ключей воронки — всегда и у всех */
export const BASE_STATUS_KEYS: readonly string[] = ['new', 'sent', 'replied', 'sobes', 'meeting', 'closed'];


export const DEFAULT_STATUS_CONFIG: Record<string, StatusOption> = {
  sent: { value: 'sent', label: 'Отправлено', color: '#3B82F6' },
  replied: { value: 'replied', label: 'Ответ получен', color: '#EAB308' },
  sobes: { value: 'sobes', label: 'Собеседование', color: '#8B5CF6' },

  meeting: { value: 'meeting', label: 'Встреча', color: '#22C55E' },
  closed: { value: 'closed', label: 'Закрыто', color: '#EF4444' },
  new: { value: 'new', label: 'Новое', color: '#6B7280' },
};

export const DEFAULT_STAGE_COLOR = '#6B7280';

export function normalizeSource(source?: string | null) {
  return normalizeSourceKey(source);
}

/**
 * Определяет ключ статуса для этапа.
 * Если у этапа есть base_key (например 'sent', 'replied'), использует его.
 * Иначе генерирует stage_N на основе order_index.
 * Для первых 6 этапов без base_key возвращает базовые ключи.
 */
export function statusKeyForStage(
  orderIndex: number,
  baseKey?: string | null
): VacancyStatus {
  if (baseKey) return baseKey as VacancyStatus;
  if (orderIndex >= 1 && orderIndex <= BASE_STATUS_KEYS.length) {
    return BASE_STATUS_KEYS[orderIndex - 1] as VacancyStatus;
  }
  return `stage_${orderIndex}` as VacancyStatus;
}

/**
 * Возвращает порядковый индекс статуса (1-based).
 * Для базовых ключей возвращает их позицию (new→1, sent→2, replied→3, sobes→4, meeting→5, closed→6).
 * Для кастомных stage_N извлекает N.
 */
export function orderIndexForStatus(status: VacancyStatus): number | null {
  const baseIdx = BASE_STATUS_KEYS.indexOf(status);
  if (baseIdx !== -1) return baseIdx + 1;

  const match = String(status).match(/^stage_(\d+)$/);
  if (match) return parseInt(match[1], 10);

  return null;
}

/**
 * Проверяет, является ли статус "прогрессным" (ответили и дальше).
 * Статусы с order_index >= 3 — это "ответили и дальше" (replied, sobes, meeting, closed).
 */
export function isRepliedOrBeyond(status: VacancyStatus): boolean {
  if (status === 'new' || status === 'sent') return false;
  return true; // replied, sobes, meeting, closed, stage_7, ...
}

/**
 * Собирает опции статусов для выпадающего списка на основе этапов воронки.
 * - Всегда включает «Новое» (new) как первый этап — это базовый статус, который есть у всех источников
 * - Если у этапа есть base_key (например 'sent', 'replied'), использует его как ключ статуса
 * - Иначе генерирует stage_N на основе order_index
 * - Статус rejected добавляется в конце как дополнительная опция
 */
export function getStatusOptions(
  stages: PipelineStage[] = [],
  includeClosed = true
): StatusOption[] {
  const sortedStages = [...stages].sort((a, b) => a.order_index - b.order_index);

  const seenKeys = new Set<string>();
  const activeOptions: StatusOption[] = [];

  // 1) Всегда добавляем «Новое» первым — базовый этап, обязательный для всех источников
  activeOptions.push(DEFAULT_STATUS_CONFIG.new);
  seenKeys.add('new');

  // 2) Добавляем этапы из воронки, пропуская дубликат 'new'
  for (const stage of sortedStages) {
    const key = statusKeyForStage(stage.order_index, stage.base_key);
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    const fallback = DEFAULT_STATUS_CONFIG[key];
    activeOptions.push({
      value: key,
      label: stage.name?.trim() || fallback?.label || key,
      color: stage.color || fallback?.color || DEFAULT_STAGE_COLOR,
    });
  }

  return activeOptions;

}
