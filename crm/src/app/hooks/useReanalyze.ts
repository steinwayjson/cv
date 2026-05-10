import { useSyncExternalStore } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PromptKey, Vacancy } from '../lib/types';

const WEBHOOK = import.meta.env.VITE_N8N_SCORE_WEBHOOK as string | undefined;

type PromptVersionSelection = Partial<Record<PromptKey, number>>;

type ReanalyzeRequest =
  | string[]
  | {
      vacancyIds: string[];
      promptVersions?: PromptVersionSelection;
    };

type PendingRun = {
  startedAt: number;
  timer?: ReturnType<typeof setInterval>;
};

const pendingRuns = new Map<string, PendingRun>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyPendingChanged() {
  listeners.forEach(listener => listener());
}

function getPendingSnapshot() {
  return Array.from(pendingRuns.keys()).sort().join('|');
}

function getVacancyIds(request: ReanalyzeRequest) {
  return Array.isArray(request) ? request : request.vacancyIds;
}

function markPending(ids: string[], startedAt = Date.now()) {
  ids.forEach(id => {
    const existing = pendingRuns.get(id);
    if (existing?.timer) clearInterval(existing.timer);
    pendingRuns.set(id, { startedAt });
  });
  notifyPendingChanged();
}

function clearPending(ids: string[], clearTimers = true) {
  let changed = false;
  ids.forEach(id => {
    const existing = pendingRuns.get(id);
    if (!existing) return;
    if (clearTimers && existing.timer) clearInterval(existing.timer);
    pendingRuns.delete(id);
    changed = true;
  });
  if (changed) notifyPendingChanged();
}

function hasFreshRun(vacancy: Vacancy | undefined, startedAt: number) {
  if (!vacancy) return false;
  const checkpoint = startedAt - 2000;
  return [vacancy.scored_at, vacancy.analyzed_at, vacancy.copywritten_at]
    .some(value => value && Date.parse(value) >= checkpoint);
}

function startRefreshUntilUpdated(
  qc: ReturnType<typeof useQueryClient>,
  ids: string[],
) {
  const remaining = new Set(ids);
  const maxAttempts = 24;
  let attempts = 0;
  let timer: ReturnType<typeof setInterval>;

  const tick = () => {
    attempts += 1;
    qc.invalidateQueries({ queryKey: ['vacancies'] });
    qc.invalidateQueries({ queryKey: ['analysisLog'] });

    const vacancies = qc.getQueryData<Vacancy[]>(['vacancies']) ?? [];
    const byId = new Map(vacancies.map(vacancy => [vacancy.id, vacancy]));
    const finished: string[] = [];

    remaining.forEach(id => {
      const run = pendingRuns.get(id);
      const vacancy = qc.getQueryData<Vacancy>(['vacancy', id]) ?? byId.get(id);
      qc.invalidateQueries({ queryKey: ['vacancy', id] });

      if (!run || hasFreshRun(vacancy, run.startedAt) || attempts >= maxAttempts) {
        finished.push(id);
      }
    });

    finished.forEach(id => remaining.delete(id));
    if (finished.length > 0) clearPending(finished, false);
    if (remaining.size === 0) clearInterval(timer);
  };

  timer = setInterval(tick, 4000);
  ids.forEach(id => {
    const run = pendingRuns.get(id);
    if (run) pendingRuns.set(id, { ...run, timer });
  });
  setTimeout(tick, 1000);
}

async function triggerScore(request: ReanalyzeRequest): Promise<void> {
  if (!WEBHOOK) {
    throw new Error('VITE_N8N_SCORE_WEBHOOK не настроен в .env');
  }

  const body = Array.isArray(request)
    ? { vacancy_ids: request }
    : {
        vacancy_ids: request.vacancyIds,
        prompt_versions: request.promptVersions,
      };

  const res = await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`n8n вернул ${res.status}${body ? ': ' + body : ''}`);
  }
}

export function useReanalyze() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: triggerScore,
    onMutate: (request) => {
      markPending(getVacancyIds(request));
    },
    onSuccess: (_data, request) => {
      const ids = getVacancyIds(request);
      toast.success(
        ids.length === 1
          ? 'Запрос на анализ отправлен. Вакансия обновится после завершения.'
          : `Отправлено ${ids.length} вакансий на анализ.`,
      );
      startRefreshUntilUpdated(qc, ids);
    },
    onError: (e: Error, request) => {
      clearPending(getVacancyIds(request));
      toast.error(e.message || 'Ошибка при запросе анализа');
    },
  });
}

export function useReanalyzingVacancyIds() {
  const snapshot = useSyncExternalStore(subscribe, getPendingSnapshot, getPendingSnapshot);
  return new Set(snapshot ? snapshot.split('|') : []);
}

export function useIsVacancyReanalyzing(vacancyId: string) {
  return useReanalyzingVacancyIds().has(vacancyId);
}
