import { useMemo } from 'react';
import { useVacancies } from './useVacancies';
import { TERMINAL_STATUSES } from '../lib/types';
import type { VacancyStatus } from '../lib/types';

/**
 * Группы статусов для метрик.
 * Определены явно, не зависят от порядка в CANONICAL_STATUS_ORDER.
 */
const SENT_STATUSES = new Set<VacancyStatus>(['sent', 'replied', 'interview', 'offer']);
const REPLIED_STATUSES = new Set<VacancyStatus>(['replied', 'interview', 'offer']);

export function useMetrics() {
  const { data: vacancies = [] } = useVacancies();

  return useMemo(() => {
    const total = vacancies.length;
    const hot = vacancies.filter(v => (v.score || 0) >= 70).length;

    // sent = все, кто отправили отклик (или дальше)
    const sent = vacancies.filter(v => SENT_STATUSES.has(v.status as VacancyStatus)).length;

    // replied = те, кто ответили (или дальше, до оффера)
    const replied = vacancies.filter(v => REPLIED_STATUSES.has(v.status as VacancyStatus)).length;

    // terminal = достигли closed
    const terminal = vacancies.filter(v => TERMINAL_STATUSES.has(v.status as VacancyStatus)).length;

    // offer = офферы отдельно
    const offer = vacancies.filter(v => v.status === 'offer').length;

    return {
      total,
      hot,
      sent,
      replied,
      terminal,
      offer,
    };
  }, [vacancies]);
}
