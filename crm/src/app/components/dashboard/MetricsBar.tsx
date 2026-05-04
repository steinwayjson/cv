import { useMetrics } from '../../hooks/useMetrics';

export function MetricsBar() {
  const metrics = useMetrics();

  const cards = [
    { label: 'Всего вакансий', value: metrics.total },
    { label: 'Горячих (70+)', value: metrics.hot },
    { label: 'Отправлено', value: metrics.sent },
    { label: 'Получено ответов', value: metrics.replied },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
          <div className="text-3xl font-bold mb-1">{card.value}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
