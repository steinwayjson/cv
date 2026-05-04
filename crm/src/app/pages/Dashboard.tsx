import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { RefreshCw, X } from 'lucide-react';
import { useVacancies } from '../hooks/useVacancies';
import { useReanalyze } from '../hooks/useReanalyze';
import { MetricsBar } from '../components/dashboard/MetricsBar';
import { Funnel } from '../components/dashboard/Funnel';
import { Filters } from '../components/dashboard/Filters';
import { VacancyTable } from '../components/dashboard/VacancyTable';
import { VacancyCard } from '../components/dashboard/VacancyCard';
import { SidePanel } from '../components/dashboard/SidePanel';
import { TableSkeleton } from '../components/ui/Skeleton';
import type { Vacancy } from '../lib/types';
import type { FilterValues } from '../components/dashboard/Filters';

export function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: vacancies = [], isLoading, isError } = useVacancies();
  const reanalyze = useReanalyze();
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterValues>({
    category: '', status: '', source: '', period: '', search: '',
  });

  const filtered = useMemo(() => vacancies.filter(v => {
    if (filters.category) {
      const cat = v.category || v.priority;
      if (!cat || cat.toLowerCase() !== filters.category.toLowerCase()) return false;
    }
    if (filters.status && v.status !== filters.status) return false;
    if (filters.source) {
      if (!v.source || v.source.toLowerCase() !== filters.source.toLowerCase()) return false;
    }
    if (filters.period && v.published_at) {
      const age = Date.now() - new Date(v.published_at).getTime();
      if (filters.period === 'week' && age > 7 * 86400000) return false;
      if (filters.period === 'month' && age > 30 * 86400000) return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (v.role?.toLowerCase().includes(q) || v.company_name?.toLowerCase().includes(q)) ?? false;
    }
    return true;
  }), [vacancies, filters]);

  const unscored = useMemo(() => vacancies.filter(v => v.score == null), [vacancies]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback((ids: string[]) => {
    setSelectedIds(prev => {
      const allSelected = ids.every(id => prev.has(id));
      if (allSelected) return new Set();
      return new Set(ids);
    });
  }, []);

  const handleBulkReanalyze = () => {
    const ids = Array.from(selectedIds);
    reanalyze.mutate(ids, { onSuccess: () => setSelectedIds(new Set()) });
  };

  const handleReanalyzeAll = () => {
    reanalyze.mutate(unscored.map(v => v.id));
  };

  const handleRowClick = (vacancy: Vacancy) => {
    if (window.innerWidth < 768) {
      navigate(`/vacancy/${vacancy.id}`);
    } else {
      setSelectedVacancy(vacancy);
      setSearchParams({ vacancy: vacancy.id });
    }
  };

  const handleClosePanel = () => {
    setSelectedVacancy(null);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <MetricsBar />
      <Funnel source={filters.source || undefined} />
      <Filters onFilterChange={setFilters} />

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="mb-3 flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
          <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
            Выбрано: {selectedIds.size}
          </span>
          <button
            onClick={handleBulkReanalyze}
            disabled={reanalyze.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-60"
          >
            <RefreshCw size={13} className={reanalyze.isPending ? 'animate-spin' : ''} />
            Переанализировать
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Analyze unscored button */}
      {unscored.length > 0 && selectedIds.size === 0 && (
        <div className="mb-3 flex justify-end">
          <button
            onClick={handleReanalyzeAll}
            disabled={reanalyze.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
          >
            <RefreshCw size={13} className={reanalyze.isPending ? 'animate-spin' : ''} />
            Оценить без score ({unscored.length})
          </button>
        </div>
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-lg text-red-500 mb-2">Не удалось загрузить вакансии</p>
          <p className="text-sm text-gray-500">Проверьте подключение к интернету и обновите страницу</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {vacancies.length === 0 ? (
            <>
              <p className="text-lg mb-2">Пока нет вакансий</p>
              <p className="text-sm">Добавьте первую вакансию для начала работы</p>
            </>
          ) : (
            <p className="text-lg">Ничего не найдено по выбранным фильтрам</p>
          )}
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <VacancyTable
              vacancies={filtered}
              onRowClick={handleRowClick}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
            />
          </div>
          <div className="md:hidden space-y-3">
            {filtered.map((vacancy) => (
              <VacancyCard
                key={vacancy.id}
                vacancy={vacancy}
                onClick={() => handleRowClick(vacancy)}
              />
            ))}
          </div>
        </>
      )}

      <SidePanel vacancy={selectedVacancy} onClose={handleClosePanel} />
    </div>
  );
}
