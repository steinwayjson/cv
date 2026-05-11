import type { ClosedReason } from './types';

export interface ClosedReasonOption {
  value: ClosedReason;
  label: string;
  color: string;
  icon?: string;
}

export const CLOSED_REASON_OPTIONS: ClosedReasonOption[] = [
  { value: 'rejected_by_me',      label: 'Я отказался',         color: '#EF4444' },
  { value: 'rejected_by_company', label: 'Отказ компании',      color: '#DC2626' },
  { value: 'ghosted',             label: 'Призрак',             color: '#F59E0B' },
  { value: 'low_salary',          label: 'Низкая ЗП',           color: '#F97316' },
  { value: 'irrelevant',          label: 'Не релевантно',       color: '#8B5CF6' },
  { value: 'spam',                label: 'Спам',                color: '#6B7280' },
  { value: 'duplicate',           label: 'Дубликат',            color: '#9CA3AF' },
  { value: 'archived',            label: 'В архив',             color: '#6366F1' },
];

export function getClosedReasonOption(reason?: ClosedReason | string | null): ClosedReasonOption | undefined {
  if (!reason) return undefined;
  return CLOSED_REASON_OPTIONS.find(opt => opt.value === reason);
}
