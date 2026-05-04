import { type VacancyStatus } from '../../lib/types';

interface StatusDropdownProps {
  value: VacancyStatus;
  onChange: (status: VacancyStatus) => void;
  fullWidth?: boolean;
}

const statusConfig: Record<VacancyStatus, { label: string; color: string }> = {
  new: { label: 'Новая', color: '#6B7280' },
  sent: { label: 'Отправлено', color: '#3B82F6' },
  replied: { label: 'Ответ получен', color: '#EAB308' },
  interview: { label: 'Интервью', color: '#22C55E' },
  rejected: { label: 'Отказ', color: '#EF4444' },
  offer: { label: 'Оффер', color: '#F59E0B' },
};

export function StatusDropdown({ value, onChange, fullWidth }: StatusDropdownProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as VacancyStatus)}
      className={`px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm ${fullWidth ? 'w-full' : ''}`}
      style={{ color: statusConfig[value].color }}
    >
      {Object.entries(statusConfig).map(([key, { label, color }]) => (
        <option key={key} value={key} style={{ color }}>
          {label}
        </option>
      ))}
    </select>
  );
}
