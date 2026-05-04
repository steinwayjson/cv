import { useState, useCallback, useEffect } from 'react';

/**
 * Ручные источники — добавленные пользователем до того, как n8n
 * начал реально присылать вакансии из этого канала.
 *
 * Интерфейс намеренно стабилен: { sources, add, remove }.
 * Для миграции на Supabase — создаёшь useSoucesRepo.ts с тем же
 * интерфейсом, меняешь строчку импорта здесь, остальной код не трогаешь:
 *
 * // было:
 * const [sources, setSources] = useState<string[]>(loadFromLocalStorage);
 * // станет:
 * const { data: sources } = useQuery(['manual-sources'], supabase...);
 * const addMutation = useMutation(...);
 */

const STORAGE_KEY = 'crm_manual_sources';
const SOURCES_CHANGED_EVENT = 'crm_manual_sources_changed';

function loadFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {}
  return [];
}

function saveToStorage(sources: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
  queueMicrotask(() => window.dispatchEvent(new Event(SOURCES_CHANGED_EVENT)));
}

export interface UseManualSourcesResult {
  /** Источники, добавленные вручную */
  sources: string[];
  /** Добавить новый источник. Игнорирует дубликаты и пустые строки. */
  add: (name: string) => void;
  /** Удалить источник (только ручной, не влияет на вакансии в БД) */
  remove: (name: string) => void;
}

export function useManualSources(): UseManualSourcesResult {
  const [sources, setSources] = useState<string[]>(loadFromStorage);

  useEffect(() => {
    const syncSources = () => setSources(loadFromStorage());
    window.addEventListener(SOURCES_CHANGED_EVENT, syncSources);
    window.addEventListener('storage', syncSources);
    return () => {
      window.removeEventListener(SOURCES_CHANGED_EVENT, syncSources);
      window.removeEventListener('storage', syncSources);
    };
  }, []);

  const add = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSources(prev => {
      if (prev.some(source => source.toLowerCase() === trimmed.toLowerCase())) return prev;
      const next = [...prev, trimmed].sort();
      saveToStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((name: string) => {
    setSources(prev => {
      const next = prev.filter(s => s !== name);
      saveToStorage(next);
      return next;
    });
  }, []);

  return { sources, add, remove };
}
