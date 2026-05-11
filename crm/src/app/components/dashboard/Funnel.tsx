import { memo, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useVacancies } from '../../hooks/useVacancies';
import { usePipeline } from '../../hooks/usePipeline';
import { canonicalSource } from '../../lib/sources';
import {
  DEFAULT_STATUS_CONFIG,
  getStatusOptions,
  orderIndexForStatus,
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

  // Собираем counts для каждого этапа: итерируем по отсортированным этапам
  const sortedOptions = useMemo(
    () => [...statusOptions].sort((a, b) => {
      const idxA = orderIndexForStatus(a.value) ?? Infinity;
      const idxB = orderIndexForStatus(b.value) ?? Infinity;
      return idxA - idxB;
    }),
    [statusOptions]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    const optionKeys = sortedOptions.map(o => o.value);

    // Инициализируем нулями
    for (const key of optionKeys) {
      c[key] = 0;
    }

    for (const v of pool) {
      if (v.status === 'closed') {
        // Для closed: засчитываем все этапы до last_stage
        const cutoffIdx = orderIndexForStatus(v.last_stage ?? 'new');
        for (const key of optionKeys) {
          const keyIdx = orderIndexForStatus(key);
          if (keyIdx !== null && cutoffIdx !== null && keyIdx <= cutoffIdx) {
            c[key] = (c[key] ?? 0) + 1;
          }
        }
      } else if (v.status === 'rejected') {
        // rejected не показываем в активной воронке
        continue;
      } else {
        // Для нормальных статусов: засчитываем все этапы от начала до текущего
        const currentIdx = orderIndexForStatus(v.status);
        for (const key of optionKeys) {
          const keyIdx = orderIndexForStatus(key);
          if (keyIdx !== null && currentIdx !== null && keyIdx <= currentIdx) {
            c[key] = (c[key] ?? 0) + 1;
          }
        }
      }
    }
    return c;
  }, [pool, sortedOptions]);

  const closedCount = useMemo(() => pool.filter(v => v.status === 'closed').length, [pool]);
  const title = source ? `Воронка · ${source}` : 'Воронка';

  return (
    <div className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
        {title}
      </h2>

      <div className="flex items-start flex-wrap gap-x-1 gap-y-4">
        {sortedOptions.map((option, idx) => {
          const count = counts[option.value] ?? 0;
          const prevOption = idx > 0 ? sortedOptions[idx - 1] : null;
          const prevCount = prevOption ? (counts[prevOption.value] ?? 0) : null;
          const conversion = prevCount && prevCount > 0
            ? Math.round((count / prevCount) * 100)
            : null;

          return (
            <div key={option.value} className="flex items-start">
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

        {closedCount > 0 && (
          <div className="flex items-start ml-2">
            <div className="flex flex-col items-center mt-2 mx-1 w-8 flex-shrink-0">
              <ChevronRight size={14} className="text-red-300 dark:text-red-700" />
            </div>
            <div className="flex flex-col items-center min-w-[52px]">
              <span className="text-2xl font-bold leading-none text-red-500">{closedCount}</span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 text-center mt-1 leading-tight">
                Закрыто
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
