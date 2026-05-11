import { memo, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useVacancies } from '../../hooks/useVacancies';
import { usePipeline } from '../../hooks/usePipeline';
import { canonicalSource } from '../../lib/sources';
import {
  ACTIVE_STAGE_STATUSES,
  DEFAULT_STATUS_CONFIG,
  getStatusOptions,
} from '../../lib/statuses';

interface FunnelProps {
  source?: string;
}

export const Funnel = memo(function Funnel({ source }: FunnelProps) {
  const { data: vacancies = [] } = useVacancies();
  const { data: stages = [] } = usePipeline(source);
  const statusOptions = useMemo(() => getStatusOptions(stages, false), [stages]);

  const pool = useMemo(
    () => source ? vacancies.filter(v => canonicalSource(v.source) === canonicalSource(source)) : vacancies,
    [vacancies, source]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { new: 0, sent: 0, replied: 0, interview: 0, offer: 0 };
    const statusOrder = ACTIVE_STAGE_STATUSES as unknown as string[];

    for (const v of pool) {
      if (v.status === 'rejected') {
        const cutoff = v.last_stage ?? 'new';
        for (const s of statusOrder) {
          c[s]++;
          if (s === cutoff) break;
        }
      } else {
        for (const s of statusOrder) {
          c[s]++;
          if (s === v.status) break;
        }
      }
    }
    return c;
  }, [pool]);

  const rejected = useMemo(() => pool.filter(v => v.status === 'rejected').length, [pool]);
  const title = source ? `Воронка · ${source}` : 'Воронка';

  return (
    <div className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
        {title}
      </h2>

      <div className="flex items-start flex-wrap gap-x-1 gap-y-4">
        {ACTIVE_STAGE_STATUSES.map((status, idx) => {
          const count = counts[status] ?? 0;
          const prevCount = idx > 0 ? (counts[ACTIVE_STAGE_STATUSES[idx - 1]] ?? 0) : null;
          const conversion = prevCount && prevCount > 0
            ? Math.round((count / prevCount) * 100)
            : null;
          const option = statusOptions.find(item => item.value === status) ?? DEFAULT_STATUS_CONFIG[status];

          return (
            <div key={status} className="flex items-start">
              {idx > 0 && (
                <div className="flex flex-col items-center mt-2 mx-1 w-8 flex-shrink-0">
                  <ChevronRight size={14} className="text-gray-300 dark:text-gray-600" />
                  {conversion != null && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-none mt-0.5">
                      {conversion}%
                    </span>
                  )}
                </div>
              )}
              <div className="flex flex-col items-center min-w-[52px]">
                <span className="text-2xl font-bold leading-none" style={{ color: option.color }}>
                  {count}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 text-center mt-1 leading-tight">
                  {option.label}
                </span>
              </div>
            </div>
          );
        })}

        {rejected > 0 && (
          <div className="flex items-start ml-2">
            <div className="flex flex-col items-center mt-2 mx-1 w-8 flex-shrink-0">
              <ChevronRight size={14} className="text-red-300 dark:text-red-700" />
            </div>
            <div className="flex flex-col items-center min-w-[52px]">
              <span className="text-2xl font-bold leading-none text-red-500">{rejected}</span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 text-center mt-1 leading-tight">
                Отказы
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
