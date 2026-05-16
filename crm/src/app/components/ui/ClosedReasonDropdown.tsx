import { CLOSED_REASON_OPTIONS, CLOSED_REASON_GROUPS, getClosedReasonOption } from '../../lib/closedReasons';
import type { ClosedReason } from '../../lib/types';

interface ClosedReasonDropdownProps {
  value?: ClosedReason | string | null;
  onChange: (reason: ClosedReason | null) => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function ClosedReasonDropdown({ value, onChange, disabled, fullWidth }: ClosedReasonDropdownProps) {
  const current = getClosedReasonOption(value);

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange((e.target.value || null) as ClosedReason | null)}
      disabled={disabled}
      className={`px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm disabled:opacity-60 ${fullWidth ? 'w-full' : ''}`}
      style={{ color: current?.color ?? '#6B7280' }}
    >
      <option value="" style={{ color: '#6B7280' }}>
        Выберите причину...
      </option>
      {CLOSED_REASON_GROUPS.map(group => (
        <optgroup key={group.type} label={group.label}>
          {group.options.map(({ value: key, label, color }) => (
            <option key={key} value={key} style={{ color }}>
              {label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
