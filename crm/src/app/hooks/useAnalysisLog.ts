import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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

export function useDeleteAnalysisLog(vacancyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => db.analysisLog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysisLog', vacancyId] });
      toast.success('Запись удалена');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
