import type { VacancyStatus, PipelineStage } from './types';
import { VACANCY_STATUSES, STATUS_ALIASES, STATUS_TRANSITIONS } from './types';


export interface StatusOption {
  value: string;         // stage.id или canonical status (fallback)
  label: string;
  color: string;
  canonicalStatus: VacancyStatus;
}

/** Канонические статусы в порядке воронки */
export const CANONICAL_STATUS_ORDER: readonly VacancyStatus[] = [
  'new', 'sent', 'replied', 'interview', 'offer', 'closed',
];

export const DEFAULT_STATUS_CONFIG: Record<string, StatusOption> = {
  new:       { value: 'new',       label: 'Новое',               color: '#6B7280', canonicalStatus: 'new' },
  sent:      { value: 'sent',      label: 'Отправлено',          color: '#3B82F6', canonicalStatus: 'sent' },
  replied:   { value: 'replied',   label: 'Ответ получен',       color: '#EAB308', canonicalStatus: 'replied' },
  interview: { value: 'interview', label: 'Собеседование',       color: '#8B5CF6', canonicalStatus: 'interview' },
  offer:     { value: 'offer',     label: 'Оффер',               color: '#10B981', canonicalStatus: 'offer' },
  closed:    { value: 'closed',    label: 'Закрыто',             color: '#EF4444', canonicalStatus: 'closed' },
};

export const DEFAULT_STAGE_COLOR = '#6B7280';

/**
 * Приводит любой статус к canonical.
 * - sobes → interview (обратная совместимость)
 * - stage_N → null (UI-слой, не lifecycle)
 * - неизвестный → null
 */
export function toCanonicalStatus(status: string): VacancyStatus | null {
  if (VACANCY_STATUSES.includes(status as VacancyStatus)) {
    return status as VacancyStatus;
  }
  return STATUS_ALIASES[status] ?? null;
}

/**
 * Порядковый номер статуса в воронке (0-based).
 */
export function orderIndexForStatus(status: VacancyStatus | string): number | null {
  const canonical = toCanonicalStatus(status);
  if (!canonical) return null;
  const idx = CANONICAL_STATUS_ORDER.indexOf(canonical);
  return idx >= 0 ? idx : null;
}

/**
 * Проверяет, является ли статус "прогрессным" (ответили и дальше).
 * replied, interview, offer — прогресс.
 * new, sent — нет.
 * closed — завершённый прогресс (да).
 */
export function isRepliedOrBeyond(status: VacancyStatus | string): boolean {
  const idx = orderIndexForStatus(status);
  if (idx === null) return false;
  return idx >= CANONICAL_STATUS_ORDER.indexOf('replied');
}

/**
 * Собирает опции статусов для выпадающего списка.
 * Использует pipeline stages (с canonical_status) для кастомных лейблов и цветов,
 * либо DEFAULT_STATUS_CONFIG если stages не переданы или пусты.
 * Если `currentStatus` передан — фильтрует по допустимым переходам (transition guard).
 */
export function getStatusOptions(
  stages: PipelineStage[] = [],
  includeClosed = true,
  currentStatus?: VacancyStatus,
): StatusOption[] {
  // Если stages есть — строим опции из них
  const stagesWithStatus = stages.filter(s => s.canonical_status);
  if (stagesWithStatus.length > 0) {
    let filteredStages = stagesWithStatus;
    if (!includeClosed) {
      filteredStages = filteredStages.filter(s => s.canonical_status !== 'closed');
    }

    const options: StatusOption[] = [];

    for (const stage of filteredStages) {
      // Transition guard — проверяем по canonical_status
      if (currentStatus && stage.canonical_status !== currentStatus) {
        const allowed = STATUS_TRANSITIONS[currentStatus];
        if (allowed && !allowed.includes(stage.canonical_status!)) {
          continue;
        }
      }

      options.push({
        value: stage.id,
        label: stage.name,
        color: stage.color,
        canonicalStatus: stage.canonical_status!,
      });
    }

    // Если получился пустой список но есть currentStatus — добавляем его
    if (options.length === 0 && currentStatus) {
      const def = DEFAULT_STATUS_CONFIG[currentStatus];
      if (def) options.push(def);
    }

    return options;
  }

  // Нет stages — fallback на DEFAULT_STATUS_CONFIG
  let statuses = includeClosed
    ? [...CANONICAL_STATUS_ORDER]
    : CANONICAL_STATUS_ORDER.filter(s => s !== 'closed');

  if (currentStatus) {
    const allowed = STATUS_TRANSITIONS[currentStatus];
    if (allowed) {
      statuses = allowed;
    }
    if (!statuses.includes(currentStatus)) {
      statuses = [currentStatus, ...statuses];
    }
  }

  return statuses.map(key => DEFAULT_STATUS_CONFIG[key] ?? {
    value: key,
    label: key,
    color: DEFAULT_STAGE_COLOR,
    canonicalStatus: key as VacancyStatus,
  });
}
