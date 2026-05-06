import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { db } from '../lib/supabase';

export function useParserRuns() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['parser-runs'],
    queryFn: () => db.parserRuns.getRecent(20),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  const lastRun = query.data?.[0] ?? null;

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['parser-runs'] });
  }, [queryClient]);

  return {
    runs: query.data ?? [],
    lastRun,
    isLoading: query.isLoading,
    error: query.error,
    refresh,
  };
}

export function useChannelRuns(channelId: string | null) {
  return useQuery({
    queryKey: ['parser-runs', 'channel', channelId],
    queryFn: () => db.parserRuns.getForChannel(channelId!, 5),
    enabled: !!channelId,
  });
}

export function useParserTrigger() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const queryClient = useQueryClient();

  const trigger = useCallback(async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const parserUrl = import.meta.env.VITE_TG_PARSER_URL;
      const secret = import.meta.env.VITE_TG_PARSER_SECRET;
      if (!parserUrl || !secret) {
        setResult({ ok: false, message: 'Parser URL или секрет не настроены (VITE_TG_PARSER_URL / VITE_TG_PARSER_SECRET)' });
        return;
      }
      const res = await fetch(parserUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': secret,
        },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (res.ok) {
        setResult({ ok: true, message: `Запущено. Постов: ${json.posts_found ?? '?'}, время: ${json.elapsed}ms` });
      } else {
        setResult({ ok: false, message: json.error ?? 'Ошибка запуска' });
      }
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsRunning(false);
      // через небольшую задержку — парсер уже записал лог
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['parser-runs'] });
      }, 2000);
    }
  }, [queryClient]);

  return { trigger, isRunning, result };
}
