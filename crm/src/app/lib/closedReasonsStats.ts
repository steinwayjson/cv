import { getClosedReasonOption } from './closedReasons';
import type { Vacancy } from './types';

export interface ClosedReasonStat {
  reason: string;
  label: string;
  color: string;
  count: number;
  percentage: number;
  type: 'pipeline' | 'quality' | 'system';
}

export interface ClosedReasonsStats {
  totalClosed: number;
  /** pipeline + quality — рабочие причины потерь */
  pipelineReasons: ClosedReasonStat[];
  /** system — дубликаты, спам, прочее */
  systemReasons: ClosedReasonStat[];
}

/**
 * Чистая функция для расчёта статистики по причинам закрытия.
 *
 * - Учитывает только v.status === 'closed'
 * - Группирует по closed_reason
 * - null/undefined → 'other'
 * - Разделяет на рабочие (pipeline + quality) и системные причины
 */
export function buildClosedReasonsStats(vacancies: Vacancy[]): ClosedReasonsStats {
  const closed = vacancies.filter(v => v.status === 'closed');
  const totalClosed = closed.length;

  const countMap = new Map<string, number>();
  for (const v of closed) {
    const reason = v.closed_reason ?? 'other';
    countMap.set(reason, (countMap.get(reason) ?? 0) + 1);
  }

  const stats: ClosedReasonStat[] = [];

  for (const [reason, count] of countMap) {
    const option = getClosedReasonOption(reason);

    stats.push({
      reason,
      label: option?.label ?? 'Другое',
      color: option?.color ?? '#6B7280',
      count,
      percentage: totalClosed > 0 ? Math.round((count / totalClosed) * 100) : 0,
      type: option?.type ?? 'system',
    });
  }

  // Сортируем по убыванию количества
  stats.sort((a, b) => b.count - a.count);

  return {
    totalClosed,
    pipelineReasons: stats.filter(s => s.type === 'pipeline' || s.type === 'quality'),
    systemReasons: stats.filter(s => s.type === 'system'),
  };
}
