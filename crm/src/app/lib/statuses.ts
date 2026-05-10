import type { PipelineStage, VacancyStatus } from './types';
import { normalizeSourceKey } from './sources';

export interface StatusOption {
  value: VacancyStatus;
  label: string;
  color: string;
}

export const ACTIVE_STAGE_STATUSES = ['new', 'sent', 'replied', 'interview', 'offer'] as const;

export const DEFAULT_STATUS_CONFIG: Record<VacancyStatus, StatusOption> = {
  new: { value: 'new', label: 'Новая', color: '#6B7280' },
  sent: { value: 'sent', label: 'Отправлено', color: '#3B82F6' },
  replied: { value: 'replied', label: 'Ответ получен', color: '#EAB308' },
  interview: { value: 'interview', label: 'Интервью', color: '#22C55E' },
  rejected: { value: 'rejected', label: 'Отказ', color: '#EF4444' },
  offer: { value: 'offer', label: 'Оффер', color: '#F59E0B' },
};

export function normalizeSource(source?: string | null) {
  return normalizeSourceKey(source);
}

export function getStatusOptions(
  stages: PipelineStage[] = [],
  includeRejected = true
): StatusOption[] {
  const sortedStages = [...stages].sort((a, b) => a.order_index - b.order_index);

  const activeOptions = ACTIVE_STAGE_STATUSES.map((status, index) => {
    const stage = sortedStages.find(s => s.order_index === index + 1) ?? sortedStages[index];
    const fallback = DEFAULT_STATUS_CONFIG[status];

    return {
      value: status,
      label: stage?.name?.trim() || fallback.label,
      color: stage?.color || fallback.color,
    };
  });

  if (!includeRejected) return activeOptions;
  return [...activeOptions, DEFAULT_STATUS_CONFIG.rejected];
}
