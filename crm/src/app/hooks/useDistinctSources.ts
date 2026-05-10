import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PRESET_SOURCES, db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const EMPTY_SOURCES: string[] = [];

export function usePipelineSources() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['pipeline-sources'],
    queryFn: () => db.pipeline.getSources(),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useVacancySources() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['vacancy-sources'],
    queryFn: () => db.vacancies.getSources(),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useDistinctSources(): string[] {
  const { data: pipelineSources } = usePipelineSources();
  const { data: vacancySources } = useVacancySources();

  return useMemo(() => {
    const dbSources = vacancySources ?? EMPTY_SOURCES;
    const stageSources = pipelineSources ?? EMPTY_SOURCES;
    const seen = new Map<string, string>();
    for (const source of [...PRESET_SOURCES, ...dbSources, ...stageSources]) {
      const normalized = source.trim();
      if (!normalized) continue;
      seen.set(normalized.toLowerCase(), normalized);
    }
    return Array.from(seen.values()).sort();
  }, [pipelineSources, vacancySources]);
}
