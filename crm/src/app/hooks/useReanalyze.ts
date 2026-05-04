import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PromptKey } from '../lib/types';

const WEBHOOK = import.meta.env.VITE_N8N_SCORE_WEBHOOK as string | undefined;

type PromptVersionSelection = Partial<Record<PromptKey, number>>;

type ReanalyzeRequest =
  | string[]
  | {
      vacancyIds: string[];
      promptVersions?: PromptVersionSelection;
    };

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
    onSuccess: (_data, request) => {
      const ids = Array.isArray(request) ? request : request.vacancyIds;
      toast.success(
        ids.length === 1
          ? 'Запрос на анализ отправлен. Оценка появится через несколько секунд.'
          : `Отправлено ${ids.length} вакансий на анализ.`,
      );
      // Обновляем список через 5 сек
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['vacancies'] });
        qc.invalidateQueries({ queryKey: ['analysisLog'] });
        ids.forEach(id => qc.invalidateQueries({ queryKey: ['vacancy', id] }));
      }, 5000);
    },
    onError: (e: Error) => {
      toast.error(e.message || 'Ошибка при запросе анализа');
    },
  });
}
