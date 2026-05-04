import { useQuery } from '@tanstack/react-query';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { AgentKey } from '../lib/types';

export function useVacancyAnalysisLog(vacancyId: string | null, agent?: AgentKey, limit = 10) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['analysisLog', vacancyId, agent ?? 'all', limit],
    queryFn: () => db.analysisLog.getForVacancy(vacancyId!, agent, limit),
    enabled: !!user && !!vacancyId,
  });
}
