import type { ClosedReason, ClosedReasonType } from './types';
import { CLOSED_REASON_TYPE } from './types';

export interface ClosedReasonOption {
  value: ClosedReason;
  label: string;
  color: string;
  icon?: string;
  type: ClosedReasonType;
}

export const CLOSED_REASON_OPTIONS: ClosedReasonOption[] = [
  { value: 'no_response',      label: 'Нет ответа',        color: '#F59E0B', type: 'pipeline' },
  { value: 'ghosted',          label: 'Призрак',           color: '#F97316', type: 'pipeline' },
  { value: 'salary',           label: 'Зарплата',          color: '#EF4444', type: 'pipeline' },
  { value: 'rejected',         label: 'Отказ',             color: '#DC2626', type: 'pipeline' },
  { value: 'position_closed',  label: 'Позиция закрыта',   color: '#8B5CF6', type: 'pipeline' },
  { value: 'irrelevant',       label: 'Не релевантно',     color: '#6B7280', type: 'quality' },
  { value: 'spam',             label: 'Спам',              color: '#9CA3AF', type: 'quality' },
  { value: 'duplicate',        label: 'Дубликат',          color: '#D1D5DB', type: 'system' },
  { value: 'other',            label: 'Другое',            color: '#9CA3AF', type: 'system' },
];

/** Группы причин закрытия для grouped select */
export interface ClosedReasonGroup {
  type: ClosedReasonType;
  label: string;
  options: ClosedReasonOption[];
}

export const CLOSED_REASON_GROUPS: ClosedReasonGroup[] = [
  {
    type: 'pipeline',
    label: 'Результат воронки',
    options: CLOSED_REASON_OPTIONS.filter(o => o.type === 'pipeline'),
  },
  {
    type: 'quality',
    label: 'Качество / фильтрация',
    options: CLOSED_REASON_OPTIONS.filter(o => o.type === 'quality'),
  },
  {
    type: 'system',
    label: 'Системные',
    options: CLOSED_REASON_OPTIONS.filter(o => o.type === 'system'),
  },
];

export function getClosedReasonOption(reason?: ClosedReason | string | null): ClosedReasonOption | undefined {
  if (!reason) return undefined;
  return CLOSED_REASON_OPTIONS.find(opt => opt.value === reason);
}

export function getClosedReasonType(reason?: ClosedReason | string | null): ClosedReasonType | undefined {
  if (!reason) return undefined;
  return CLOSED_REASON_TYPE[reason as ClosedReason] ?? undefined;
}
