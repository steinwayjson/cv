import { useState } from 'react';
import { useDistinctSources } from '../../hooks/useDistinctSources';
import { SourceIcon } from '../ui/SourceIcon';

export interface FilterValues {
  category: string;
  status: string;
  source: string;
  period: string;
  search: string;
}

const INITIAL: FilterValues = { category: '', status: '', source: '', period: '', search: '' };

interface FiltersProps {
  onFilterChange: (filters: FilterValues) => void;
}

export function Filters({ onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState<FilterValues>(INITIAL);
  const sources = useDistinctSources();

  const update = (key: keyof FilterValues, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange(next);
  };

  const reset = () => {
    setFilters(INITIAL);
    onFilterChange(INITIAL);
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="mb-4 flex gap-2 flex-wrap">
      <select
        value={filters.category}
        onChange={e => update('category', e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
      >
        <option value="">Категория</option>
        <option value="горячая">Горячая</option>
        <option value="норм">Норм</option>
        <option value="мимо">Мимо</option>
      </select>

      <select
        value={filters.status}
        onChange={e => update('status', e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
      >
        <option value="">Статус</option>
        <option value="new">Новая</option>
        <option value="sent">Отправлено</option>
        <option value="replied">Ответ получен</option>
        <option value="interview">Интервью</option>
        <option value="offer">Оффер</option>
        <option value="rejected">Отказ</option>
      </select>

      <select
        value={filters.source}
        onChange={e => update('source', e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
      >
        <option value="">Источник</option>
        {sources.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
      </select>

      <select
        value={filters.period}
        onChange={e => update('period', e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
      >
        <option value="">Период</option>
        <option value="week">Неделя</option>
        <option value="month">Месяц</option>
      </select>

      <input
        type="text"
        value={filters.search}
        onChange={e => update('search', e.target.value)}
        placeholder="Поиск по роли или компании..."
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm flex-1 min-w-[200px]"
      />

      {hasFilters && (
        <button
          onClick={reset}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Сбросить
        </button>
      )}
    </div>
  );
}
