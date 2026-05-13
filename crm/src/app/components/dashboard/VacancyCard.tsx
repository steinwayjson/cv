import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { ScoreBadge } from '../ui/ScoreBadge';
import { StatusDropdown } from '../ui/StatusDropdown';
import { ClosedReasonDropdown } from '../ui/ClosedReasonDropdown';
import { useUpdateVacancyStatus, useUpdateClosedReason } from '../../hooks/useVacancies';
import { useIsVacancyReanalyzing } from '../../hooks/useReanalyze';
import type { Vacancy, VacancyStatus } from '../../lib/types';

interface VacancyCardProps {
  vacancy: Vacancy;
  onClick: () => void;
}

export function VacancyCard({ vacancy, onClick }: VacancyCardProps) {
  const updateStatus = useUpdateVacancyStatus();
  const updateClosedReason = useUpdateClosedReason();
  const isReanalyzing = useIsVacancyReanalyzing(vacancy.id);

  const handleStatusChange = (status: VacancyStatus) => {
    updateStatus.mutate({
      id: vacancy.id,
      status,
      lastStage: status === 'closed' ? vacancy.status : undefined,
    });
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
        vacancy.category === 'горячая' ? 'border-l-4 border-l-red-500' : ''
      } ${isReanalyzing ? 'animate-pulse bg-blue-50/60 dark:bg-blue-900/10' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {vacancy.score != null && <ScoreBadge score={vacancy.score} />}
          <span className="font-medium">{vacancy.company_name}</span>
        </div>
        {isReanalyzing ? (
          <RefreshCw size={16} className="text-blue-600 flex-shrink-0 animate-spin" />
        ) : (
          <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />
        )}
      </div>

      <div className="mb-2">{vacancy.role}</div>

      {vacancy.salary && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">{vacancy.salary}</div>
      )}

      <div className="flex items-center justify-between">
        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
          <StatusDropdown
            value={vacancy.status}
            source={vacancy.source}
            disabled={isReanalyzing}
            onChange={handleStatusChange}
          />
          {vacancy.status === 'closed' && (
            <ClosedReasonDropdown
              value={vacancy.closed_reason}
              disabled={isReanalyzing}
              onChange={(reason) => updateClosedReason.mutate({ id: vacancy.id, closedReason: reason })}
            />
          )}
        </div>
        <div className="text-xs text-gray-500">
          {isReanalyzing
            ? 'Анализ...'
            : formatDistanceToNow(new Date(vacancy.published_at), { addSuffix: true, locale: ru })}
        </div>
      </div>
    </div>
  );
}
