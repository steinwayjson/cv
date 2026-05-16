import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FIXED_SOURCES } from '../lib/constants/sources';
import type { PipelineStage, VacancyStatus } from '../lib/types';

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
  queryClient.invalidateQueries({ queryKey: ['pipeline-sources'] });
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
    mutationFn: ({ name, color, orderIndex, source, canonicalStatus }: { name: string; color: string; orderIndex: number; source?: string; canonicalStatus?: VacancyStatus | null }) =>
      db.pipeline.addStage(name, color, orderIndex, source, canonicalStatus),
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

export function useCreatePipelineSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (source: string) => db.pipeline.createSource(source),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeletePipelineSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (source: string) => db.pipeline.deleteSource(source),
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
  return useMutation({
    mutationFn: () => db.pipeline.seedPreset([...FIXED_SOURCES]),
    onSuccess: () => invalidateAll(queryClient),
  });
}
