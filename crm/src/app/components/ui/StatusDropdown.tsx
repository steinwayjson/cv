import { useMemo } from 'react';
import { usePipeline } from '../../hooks/usePipeline';
import { DEFAULT_STATUS_CONFIG, getStatusOptions } from '../../lib/statuses';
import { STATUS_GROUP } from '../../lib/types';
import type { VacancyStatus } from '../../lib/types';

interface StatusDropdownProps {
  /** current_stage_id из вакансии */
  value?: string | null;
  /** canonical status вакансии — для transition guard и terminal check */
  currentStatus: VacancyStatus;
  onChange: (stageId: string, canonicalStatus: VacancyStatus) => void;
  fullWidth?: boolean;
  source?: string | null;
  disabled?: boolean;
  allowEmpty?: boolean;
}

export function StatusDropdown({ value, currentStatus, onChange, fullWidth, source, disabled, allowEmpty }: StatusDropdownProps) {
  const { data: stages = [] } = usePipeline(source ?? undefined);

  // Проверяем, является ли текущий статус terminal — тогда не показываем список переходов
  const isTerminal = STATUS_GROUP[currentStatus] === 'terminal';

  const options = useMemo(() => {
    if (isTerminal) return [];
    return getStatusOptions(stages, true, currentStatus);
  }, [stages, currentStatus, isTerminal]);

  // Определяем выбранное значение для <select>
  const selectValue = useMemo(() => {
    if (value) return value; // есть current_stage_id — используем его
    // Нет current_stage_id — подбираем stage по currentStatus
    const fallback = options.find(o => o.canonicalStatus === currentStatus);
    return fallback?.value ?? '';
  }, [value, options, currentStatus]);

  const current = options.find(o => o.value === selectValue)
    ?? options.find(o => o.canonicalStatus === currentStatus)
    ?? DEFAULT_STATUS_CONFIG[currentStatus];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stageId = e.target.value;
    const option = options.find(o => o.value === stageId);
    if (option) {
      onChange(stageId, option.canonicalStatus);
    }
  };

  // Terminal state — показываем read-only label вместо выпадашки
  if (isTerminal) {
    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm"
        style={{ color: current?.color ?? DEFAULT_STATUS_CONFIG.new.color }}
        title="Статус закрыт. Чтобы изменить — используйте reopen."
      >
        {current?.label ?? 'Закрыто'}
      </span>
    );
  }

  return (
    <select
      value={selectValue}
      onChange={handleChange}
      disabled={disabled || options.length === 0}
      className={`px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm disabled:opacity-60 ${fullWidth ? 'w-full' : ''}`}
      style={{ color: current?.color ?? DEFAULT_STATUS_CONFIG.new.color }}
    >
      {allowEmpty && (
        <option value="" style={{ color: '#9CA3AF' }}>Не менять</option>
      )}
      {options.map(({ value: key, label, color }) => (
        <option key={key} value={key} style={{ color }}>
          {label}
        </option>
      ))}
    </select>
  );
}
