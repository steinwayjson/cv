import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useDistinctSources } from './useDistinctSources';
import type { PipelineStage } from '../lib/types';

export function usePipeline(source?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['pipeline', source ?? null],
    queryFn: () => db.pipeline.getStages(source),
    enabled: !!user,
  });
}

// Строгий вариант для редактора: только exact-source этапы, без fallback на дефолт
export function usePipelineStrict(source: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['pipeline-strict', source],
    queryFn: () => db.pipeline.getStages(source ?? undefined, true),
    enabled: !!user,
    retry: false, // не ретраить — если нет колонки source, повторы бесполезны
  });
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['pipeline'] });
  queryClient.invalidateQueries({ queryKey: ['pipeline-strict'] });
}

export function useUpdatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stages: PipelineStage[]) => db.pipeline.updateStages(stages),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useAddPipelineStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, color, orderIndex, source }: { name: string; color: string; orderIndex: number; source?: string }) =>
      db.pipeline.addStage(name, color, orderIndex, source),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeletePipelineStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => db.pipeline.deleteStage(id),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useRenamePipelineStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      db.pipeline.renameStage(id, name),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useSeedPipelinePreset() {
  const queryClient = useQueryClient();
  const sources = useDistinctSources();
  return useMutation({
    mutationFn: () => db.pipeline.seedPreset(sources),
    onSuccess: () => invalidateAll(queryClient),
  });
}
