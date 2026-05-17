import { memo, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { buildClosedReasonsStats } from '../../lib/closedReasonsStats';
import type { Vacancy } from '../../lib/types';

interface ClosedReasonsStatsProps {
  vacancies: Vacancy[];
}

export const ClosedReasonsStats = memo(function ClosedReasonsStats({ vacancies }: ClosedReasonsStatsProps) {
  const stats = useMemo(() => buildClosedReasonsStats(vacancies), [vacancies]);

  // Все причины вместе, отсортированы по убыванию
  const allReasons = useMemo(
    () => [...stats.pipelineReasons, ...stats.systemReasons].sort((a, b) => b.count - a.count),
    [stats]
  );

  if (stats.totalClosed === 0) return null;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
        Причины закрытия · <span className="text-gray-900 dark:text-gray-100">{stats.totalClosed}</span>
      </h2>

      <div className="flex items-start flex-wrap gap-x-1 gap-y-4">
        {allReasons.map((reason, idx) => {
          const prevCount = idx > 0 ? allReasons[idx - 1].count : null;
          const conversion = prevCount && prevCount > 0
            ? Math.round((reason.count / prevCount) * 100)
            : null;

          return (
            <div key={reason.reason} className="flex items-start">
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
                <span className="text-2xl font-bold leading-none" style={{ color: reason.color }}>
                  {reason.count}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 text-center mt-1 leading-tight">
                  {reason.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
