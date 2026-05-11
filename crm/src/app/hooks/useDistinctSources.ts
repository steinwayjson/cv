import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FIXED_SOURCES, canonicalSource } from '../lib/sources';
import { db } from '../lib/supabase';
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

/**
 * Returns all distinct canonical source names.
 * Priority order:
 * 1. FIXED_SOURCES (in defined order: HeadHunter, LinkedIn, SuperJob, Telegram, Zarplata, Habr Career)
 * 2. Unknown sources from vacancy table (alphabetically)
 * 3. Unknown sources from pipeline_stages table (alphabetically)
 */
export function useDistinctSources(): string[] {
  const { data: pipelineSources } = usePipelineSources();
  const { data: vacancySources } = useVacancySources();

  return useMemo(() => {
    const seen = new Map<string, string>();

    // 1. Все фиксированные источники — первыми, в заданном порядке
    for (const source of FIXED_SOURCES) {
      seen.set(source.toLowerCase(), source);
    }

    // 2. Источники из вакансий, которых нет в FIXED_SOURCES
    for (const source of vacancySources ?? EMPTY_SOURCES) {
      const canonical = canonicalSource(source);
      if (!canonical) continue;
      if (!(FIXED_SOURCES as readonly string[]).includes(canonical)) {
        seen.set(canonical.toLowerCase(), canonical);
      }
    }

    // 3. Источники из pipeline_stages, которых нет в предыдущих
    for (const source of pipelineSources ?? EMPTY_SOURCES) {
      const canonical = canonicalSource(source);
      if (!canonical) continue;
      if (!(FIXED_SOURCES as readonly string[]).includes(canonical)) {
        seen.set(canonical.toLowerCase(), canonical);
      }
    }

    return Array.from(seen.values());
  }, [pipelineSources, vacancySources]);
}
