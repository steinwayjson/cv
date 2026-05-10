import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { ScoreBadge } from '../ui/ScoreBadge';
import { StatusDropdown } from '../ui/StatusDropdown';
import { SourceIcon } from '../ui/SourceIcon';
import { useUpdateVacancyStatus } from '../../hooks/useVacancies';
import { useReanalyzingVacancyIds } from '../../hooks/useReanalyze';
import type { Vacancy, VacancyStatus } from '../../lib/types';

interface VacancyTableProps {
  vacancies: Vacancy[];
  onRowClick: (vacancy: Vacancy) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: (ids: string[]) => void;
}

export function VacancyTable({
  vacancies,
  onRowClick,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: VacancyTableProps) {
  const updateStatus = useUpdateVacancyStatus();
  const reanalyzingIds = useReanalyzingVacancyIds();
  const isSelectable = !!onToggleSelect;

  const handleStatusChange = (vacancy: Vacancy, status: VacancyStatus) => {
    updateStatus.mutate({
      id: vacancy.id,
      status,
      lastStage: status === 'rejected' ? vacancy.status : undefined,
    });
  };

  const allSelected = vacancies.length > 0 && vacancies.every(v => selectedIds?.has(v.id));

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <tr>
            {isSelectable && (
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => onToggleSelectAll?.(vacancies.map(v => v.id))}
                  className="rounded"
                />
              </th>
            )}
            <th className="px-4 py-3 text-left text-sm font-medium">Score</th>
            <th className="w-8 px-2 py-3"></th>
            <th className="px-4 py-3 text-left text-sm font-medium">Компания</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Роль</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Зарплата</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Статус</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Дата</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {vacancies.map((vacancy) => {
            const isReanalyzing = reanalyzingIds.has(vacancy.id);

            return (
              <tr
                key={vacancy.id}
                onClick={() => onRowClick(vacancy)}
                className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                  vacancy.category === 'горячая' ? 'border-l-4 border-l-red-500' : ''
                } ${selectedIds?.has(vacancy.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''} ${
                  isReanalyzing ? 'animate-pulse bg-blue-50/60 dark:bg-blue-900/10' : ''
                }`}
              >
                {isSelectable && (
                  <td className="w-10 px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds?.has(vacancy.id) ?? false}
                      onChange={() => onToggleSelect?.(vacancy.id)}
                      className="rounded"
                    />
                  </td>
                )}
                <td className="px-4 py-3">
                  {vacancy.score != null && <ScoreBadge score={vacancy.score} />}
                </td>
                <td className="w-8 px-2 py-3">
                  <SourceIcon source={vacancy.source} size={18} />
                </td>
                <td className="px-4 py-3 font-medium">{vacancy.company_name}</td>
                <td className="px-4 py-3">{vacancy.role}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {vacancy.salary || '-'}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <StatusDropdown
                    value={vacancy.status}
                    source={vacancy.source}
                    disabled={isReanalyzing}
                    onChange={(status) => handleStatusChange(vacancy, status)}
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {vacancy.published_at
                    ? formatDistanceToNow(new Date(vacancy.published_at), {
                        addSuffix: true,
                        locale: ru,
                      })
                    : '-'}
                </td>
                <td className="px-4 py-3">
                  {isReanalyzing ? (
                    <div className="inline-flex items-center gap-1 text-xs text-blue-600">
                      <RefreshCw size={14} className="animate-spin" />
                      Анализ
                    </div>
                  ) : (
                    <ArrowRight size={16} className="text-gray-400" />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
