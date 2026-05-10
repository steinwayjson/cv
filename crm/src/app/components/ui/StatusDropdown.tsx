import { useMemo } from 'react';
import { usePipeline } from '../../hooks/usePipeline';
import { DEFAULT_STATUS_CONFIG, getStatusOptions } from '../../lib/statuses';
import { type VacancyStatus } from '../../lib/types';

interface StatusDropdownProps {
  value: VacancyStatus;
  onChange: (status: VacancyStatus) => void;
  fullWidth?: boolean;
  source?: string | null;
  disabled?: boolean;
}

export function StatusDropdown({ value, onChange, fullWidth, source, disabled }: StatusDropdownProps) {
  const { data: stages = [] } = usePipeline(source ?? undefined);
  const options = useMemo(() => getStatusOptions(stages), [stages]);
  const current = options.find(option => option.value === value) ?? DEFAULT_STATUS_CONFIG[value];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as VacancyStatus)}
      disabled={disabled}
      className={`px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm disabled:opacity-60 ${fullWidth ? 'w-full' : ''}`}
      style={{ color: current?.color ?? DEFAULT_STATUS_CONFIG.new.color }}
    >
      {options.map(({ value: key, label, color }) => (
        <option key={key} value={key} style={{ color }}>
          {label}
        </option>
      ))}
    </select>
  );
}
