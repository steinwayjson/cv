import { useMemo } from 'react';
import { useVacancies } from './useVacancies';

export function useMetrics() {
  const { data: vacancies = [] } = useVacancies();

  return useMemo(() => {
    const total = vacancies.length;
    const hot = vacancies.filter(v => (v.score || 0) >= 70).length;
    const sent = vacancies.filter(v => ['sent', 'replied', 'interview', 'offer'].includes(v.status)).length;
    const replied = vacancies.filter(v => ['replied', 'interview', 'offer'].includes(v.status)).length;

    return {
      total,
      hot,
      sent,
      replied,
    };
  }, [vacancies]);
}
