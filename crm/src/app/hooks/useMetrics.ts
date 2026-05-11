import { useMemo } from 'react';
import { useVacancies } from './useVacancies';
import { orderIndexForStatus } from '../lib/statuses';

export function useMetrics() {
  const { data: vacancies = [] } = useVacancies();

  return useMemo(() => {
    const total = vacancies.length;
    const hot = vacancies.filter(v => (v.score || 0) >= 70).length;

    // sent = все статусы с order_index >= 2 (sent, replied, interview, offer, stage_6, ...)
    const sent = vacancies.filter(v => {
      const idx = orderIndexForStatus(v.status);
      return idx !== null && idx >= 2;
    }).length;

    // replied = все статусы с order_index >= 3 (replied, interview, offer, stage_6, ...)
    const replied = vacancies.filter(v => {
      const idx = orderIndexForStatus(v.status);
      return idx !== null && idx >= 3;
    }).length;

    return {
      total,
      hot,
      sent,
      replied,
    };
  }, [vacancies]);
}
