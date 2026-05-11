import { useState, useMemo } from 'react';
import { useVacancies } from '../hooks/useVacancies';
import { useDistinctSources } from '../hooks/useDistinctSources';
import { canonicalSource } from '../lib/sources';
import { Funnel } from '../components/dashboard/Funnel';
import { getClosedReasonOption } from '../lib/closedReasons';
import { isRepliedOrBeyond } from '../lib/statuses';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function Analytics() {
  const { data: vacancies = [], isError } = useVacancies();
  const sources = useDistinctSources();
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [funnelSource, setFunnelSource] = useState<string | null>(null);

  const timelineData = useMemo(() => {
    const now = Date.now();
    const cutoffMs =
      period === 'week' ? 7 * 86400000 :
      period === 'month' ? 30 * 86400000 : Infinity;
    const byKey: Record<string, number> = {};
    vacancies.forEach(v => {
      if (!v.published_at) return;
      const d = new Date(v.published_at);
      if (cutoffMs !== Infinity && now - d.getTime() > cutoffMs) return;
      let key: string;
      if (period === 'week') {
        key = d.toISOString().slice(0, 10);
      } else if (period === 'month') {
        const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
        const monday = new Date(d.getTime() - day * 86400000);
        key = monday.toISOString().slice(0, 10);
      } else {
        key = d.toISOString().slice(0, 7);
      }
      byKey[key] = (byKey[key] || 0) + 1;
    });
    return Object.entries(byKey)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [vacancies, period]);

  const scoreData = useMemo(() => {
    const bins: Record<string, number> = { '0–39': 0, '40–69': 0, '70–100': 0 };
    vacancies.forEach(v => {
      if (v.score == null) return;
      if (v.score < 40) bins['0–39']++;
      else if (v.score < 70) bins['40–69']++;
      else bins['70–100']++;
    });
    return Object.entries(bins).map(([range, count]) => ({ range, count }));
  }, [vacancies]);

  const sourceData = useMemo(() => {
    const bySource: Record<string, { sent: number; replied: number }> = {};
    vacancies.forEach(v => {
      const src = v.source || 'Другой';
      if (!bySource[src]) bySource[src] = { sent: 0, replied: 0 };
      bySource[src].sent++;
      if (isRepliedOrBeyond(v.status)) bySource[src].replied++;
    });
    return Object.entries(bySource).map(([source, { sent, replied }]) => ({
      source, sent, replied,
      rate: sent > 0 ? `${Math.round((replied / sent) * 100)}%` : '0%',
    }));
  }, [vacancies]);

  const closedReasonsData = useMemo(() => {
    const counts: Record<string, number> = {};
    vacancies.filter(v => v.status === 'closed').forEach(v => {
      const reason = v.closed_reason || 'unknown';
      counts[reason] = (counts[reason] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([reason, count]) => ({ reason, count }));
  }, [vacancies]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Аналитика</h1>

      {isError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
          Не удалось загрузить данные. Проверьте подключение и обновите страницу.
        </div>
      )}

      {/* Воронка с переключателем источника */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p className="text-xs text-gray-400">
            {funnelSource ?? 'Общая'} · {
              funnelSource
                ? vacancies.filter(v => canonicalSource(v.source) === canonicalSource(funnelSource)).length
                : vacancies.length
            } вакансий
          </p>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setFunnelSource(null)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                funnelSource === null
                  ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Общая
            </button>
            {sources.map(src => (
              <button
                key={src}
                onClick={() => setFunnelSource(src)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  funnelSource === src
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {src}
              </button>
            ))}
          </div>
        </div>
        {/* Тот же компонент что и на дашборде — одна логика, нет расхождений */}
        <Funnel source={funnelSource ?? undefined} />
      </div>

      {/* Period selector */}
      <div className="mb-4 flex gap-2">
        {(['week', 'month', 'all'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded ${
              period === p
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : 'Всё время'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
          <h3 className="font-semibold mb-4">Вакансии по времени</h3>
          {timelineData.length === 0 ? (
            <p className="text-gray-400 text-sm">Нет данных за выбранный период</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Score distribution */}
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
          <h3 className="font-semibold mb-4">Распределение по score</h3>
          {vacancies.filter(v => v.score != null).length === 0 ? (
            <p className="text-gray-400 text-sm">Нет вакансий с оценкой</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Source conversion */}
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
          <h3 className="font-semibold mb-4">Конверсия по источнику</h3>
          {sourceData.length === 0 ? (
            <p className="text-gray-400 text-sm">Нет данных</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-2">Источник</th>
                  <th className="text-right py-2">Добавлено</th>
                  <th className="text-right py-2">Ответили</th>
                  <th className="text-right py-2">%</th>
                </tr>
              </thead>
              <tbody>
                {sourceData.map(row => (
                  <tr key={row.source} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-2">{row.source}</td>
                    <td className="text-right py-2">{row.sent}</td>
                    <td className="text-right py-2">{row.replied}</td>
                    <td className="text-right py-2">{row.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Closed reasons */}
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
          <h3 className="font-semibold mb-4">Причины закрытия</h3>
          {closedReasonsData.length === 0 ? (
            <p className="text-gray-400 text-sm">Нет закрытых вакансий</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-2">Причина</th>
                  <th className="text-right py-2">Кол-во</th>
                </tr>
              </thead>
              <tbody>
                {closedReasonsData.map(({ reason, count }) => {
                  const option = getClosedReasonOption(reason);
                  return (
                    <tr key={reason} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2" style={{ color: option?.color ?? '#6B7280' }}>
                        {option?.label ?? reason}
                      </td>
                      <td className="text-right py-2">{count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
