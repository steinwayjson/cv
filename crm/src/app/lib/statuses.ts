import type { PipelineStage, VacancyStatus } from './types';
import { normalizeSourceKey } from './sources';

export interface StatusOption {
  value: VacancyStatus;
  label: string;
  color: string;
}

/** Базовые статусы, соответствующие первым 5 этапам воронки */
export const BASE_STATUS_KEYS: readonly string[] = ['new', 'sent', 'replied', 'interview', 'offer'];

export const DEFAULT_STATUS_CONFIG: Record<string, StatusOption> = {
  new: { value: 'new', label: 'Новая', color: '#6B7280' },
  sent: { value: 'sent', label: 'Отправлено', color: '#3B82F6' },
  replied: { value: 'replied', label: 'Ответ получен', color: '#EAB308' },
  interview: { value: 'interview', label: 'Интервью', color: '#22C55E' },
  rejected: { value: 'rejected', label: 'Отказ', color: '#EF4444' },
  offer: { value: 'offer', label: 'Оффер', color: '#F59E0B' },
  closed: { value: 'closed', label: 'Закрыто', color: '#EF4444' },
};

export const DEFAULT_STAGE_COLOR = '#6B7280';

export function normalizeSource(source?: string | null) {
  return normalizeSourceKey(source);
}

/**
 * Определяет ключ статуса для этапа по его порядковому индексу.
 * Для первых 5 этапов возвращает базовые ключи (new, sent, replied, interview, offer),
 * для последующих — stage_N.
 */
export function statusKeyForStage(orderIndex: number): VacancyStatus {
  if (orderIndex >= 1 && orderIndex <= BASE_STATUS_KEYS.length) {
    return BASE_STATUS_KEYS[orderIndex - 1] as VacancyStatus;
  }
  return `stage_${orderIndex}` as VacancyStatus;
}

/**
 * Возвращает порядковый индекс статуса (1-based).
 * Для базовых ключей возвращает их позицию (new → 1, sent → 2, ...).
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
 * Проверяет, является ли статус "прогрессным" (не rejected/closed и не начальные этапы).
 * Аналог старой проверки ['replied', 'interview', 'offer'].includes(v.status).
 * Считается, что статусы с order_index >= 3 — это "ответили и дальше".
 */
export function isRepliedOrBeyond(status: VacancyStatus): boolean {
  if (status === 'rejected' || status === 'closed') return false;
  if (status === 'new' || status === 'sent') return false;
  return true; // replied, interview, offer, stage_6, stage_7, ...
}

/**
 * Собирает опции статусов для выпадающего списка на основе этапов воронки.
 * - Первые 5 этапов маппятся на базовые ключи (new, sent, replied, interview, offer)
 * - Этапы 6+ получают ключи stage_6, stage_7, ...
 * - Если нужно, добавляется статус 'closed' в конце
 */
export function getStatusOptions(
  stages: PipelineStage[] = [],
  includeClosed = true
): StatusOption[] {
  const sortedStages = [...stages].sort((a, b) => a.order_index - b.order_index);

  const activeOptions: StatusOption[] = sortedStages.map(stage => {
    const key = statusKeyForStage(stage.order_index);
    const fallback = DEFAULT_STATUS_CONFIG[key];
    return {
      value: key,
      label: stage.name?.trim() || fallback?.label || key,
      color: stage.color || fallback?.color || DEFAULT_STAGE_COLOR,
    };
  });

  if (!includeClosed) return activeOptions;
  return [...activeOptions, DEFAULT_STATUS_CONFIG.closed];
}
