import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { AgentConfig } from '../lib/types';

export function useAgentConfig() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['agentConfig'],
    queryFn: () => db.agentConfig.get(),
    enabled: !!user,
  });
}

export function useUpdateAgentConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: Partial<AgentConfig>) => db.agentConfig.update(config),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agentConfig'] }),
  });
}
