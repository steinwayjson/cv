import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useRawVacanciesStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['raw-vacancies-stats'],
    queryFn: () => db.rawVacancies.getStats(),
    enabled: !!user,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useResetSkipped() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => db.rawVacancies.resetSkipped(),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['raw-vacancies-stats'] });
      toast.success(`${count} записей сброшено в очередь`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
