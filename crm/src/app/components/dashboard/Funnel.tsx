import { memo, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useVacancies } from '../../hooks/useVacancies';
import { usePipeline } from '../../hooks/usePipeline';

// Порядок этапов — жёстко привязан к VacancyStatus
// order_index в pipeline_stages: 1=new, 2=sent, 3=replied, 4=interview, 5=offer
const STAGE_STATUSES = ['new', 'sent', 'replied', 'interview', 'offer'] as const;
const DEFAULT_LABELS: Record<string, string> = {
  new: 'Новые', sent: 'Отправлено', replied: 'Ответили', interview: 'Собес', offer: 'Оффер',
};
const STAGE_COLORS: Record<string, string> = {
  new: '#6B7280', sent: '#3B82F6', replied: '#F59E0B', interview: '#8B5CF6', offer: '#10B981',
};

interface FunnelProps {
  source?: string; // передаётся из Dashboard при выборе фильтра
}

export const Funnel = memo(function Funnel({ source }: FunnelProps) {
  const { data: vacancies = [] } = useVacancies();
  // Берём названия этапов для источника (или дефолт если source не задан)
  const { data: stages = [] } = usePipeline(source);

  // Фильтруем по источнику (case-insensitive)
  const pool = useMemo(
    () => source ? vacancies.filter(v => v.source?.toLowerCase() === source.toLowerCase()) : vacancies,
    [vacancies, source]
  );

  // Кумулятивный подсчёт за один проход
  // Вакансия с last_stage учитывается в этапах до last_stage включительно
  const counts = useMemo(() => {
    const c: Record<string, number> = { new: 0, sent: 0, replied: 0, interview: 0, offer: 0 };
    const statusOrder = STAGE_STATUSES as unknown as string[];

    for (const v of pool) {
      if (v.status === 'rejected') {
        // Считаем до last_stage включительно (этапы, которые вакансия прошла)
        const cutoff = v.last_stage ?? 'new';
        for (const s of statusOrder) {
          c[s]++;
          if (s === cutoff) break;
        }
      } else {
        // Считаем до текущего статуса включительно
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
        {STAGE_STATUSES.map((status, idx) => {
          const count = counts[status] ?? 0;
          const prevCount = idx > 0 ? (counts[STAGE_STATUSES[idx - 1]] ?? 0) : null;
          const conversion = prevCount && prevCount > 0
            ? Math.round((count / prevCount) * 100)
            : null;
          // Кастомное название из pipeline_stages по order_index (1-based)
          const label = stages.find(s => s.order_index === idx + 1)?.name ?? DEFAULT_LABELS[status];

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
                <span className="text-2xl font-bold leading-none" style={{ color: STAGE_COLORS[status] }}>
                  {count}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 text-center mt-1 leading-tight">
                  {label}
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

