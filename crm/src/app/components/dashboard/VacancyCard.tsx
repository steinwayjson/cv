import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowRight } from 'lucide-react';
import { ScoreBadge } from '../ui/ScoreBadge';
import { StatusDropdown } from '../ui/StatusDropdown';
import { useUpdateVacancyStatus } from '../../hooks/useVacancies';
import type { Vacancy, VacancyStatus } from '../../lib/types';

interface VacancyCardProps {
  vacancy: Vacancy;
  onClick: () => void;
}

export function VacancyCard({ vacancy, onClick }: VacancyCardProps) {
  const updateStatus = useUpdateVacancyStatus();

  const handleStatusChange = (status: VacancyStatus) => {
    updateStatus.mutate({
      id: vacancy.id,
      status,
      lastStage: status === 'rejected' ? vacancy.status : undefined,
    });
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
        vacancy.category === 'горячая' ? 'border-l-4 border-l-red-500' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {vacancy.score != null && <ScoreBadge score={vacancy.score} />}
          <span className="font-medium">{vacancy.company_name}</span>
        </div>
        <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />
      </div>

      <div className="mb-2">{vacancy.role}</div>

      {vacancy.salary && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">{vacancy.salary}</div>
      )}

      <div className="flex items-center justify-between">
        <div onClick={(e) => e.stopPropagation()}>
          <StatusDropdown value={vacancy.status} onChange={handleStatusChange} />
        </div>
        <div className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(vacancy.published_at), { addSuffix: true, locale: ru })}
        </div>
      </div>
    </div>
  );
}
