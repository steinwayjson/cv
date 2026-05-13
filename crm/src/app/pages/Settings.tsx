import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

import {
  useActivatePromptVersion,
  useCreatePromptVersion,
  useDeletePromptVersion,
  usePrompts,
  usePromptVersions,
  useUpdatePrompt,
} from '../hooks/usePrompts';
import { PipelineEditor } from '../components/settings/PipelineEditor';
import { TgParserSection } from '../components/settings/TgParserSection';
import { toast } from 'sonner';
import type { Prompt, PromptKey } from '../lib/types';

const EMPTY_PROMPTS: Prompt[] = [];

export function Settings() {
  const { data: promptsData, isLoading: promptsLoading, error: promptsError } = usePrompts();
  const prompts = promptsData ?? EMPTY_PROMPTS;
  const updatePrompt = useUpdatePrompt();
  const createPromptVersion = useCreatePromptVersion();
  const activatePromptVersion = useActivatePromptVersion();
  const deletePromptVersion = useDeletePromptVersion();
  const [activePromptKey, setActivePromptKey] = useState<PromptKey | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [promptDrafts, setPromptDrafts] = useState<Record<string, string>>({});
  const { data: promptVersionsData, isLoading: versionsLoading } = usePromptVersions(activePromptKey);
  const promptVersions = promptVersionsData ?? EMPTY_PROMPTS;

  useEffect(() => {
    const drafts: Record<string, string> = {};
    for (const prompt of prompts) drafts[prompt.id] = prompt.content;
    setPromptDrafts(drafts);
    setActivePromptKey(prev => prev ?? prompts[0]?.key ?? null);
  }, [prompts]);

  useEffect(() => {
    if (promptVersions.length === 0) return;
    setPromptDrafts(prev => {
      const drafts = { ...prev };
      for (const prompt of promptVersions) {
        drafts[prompt.id] = drafts[prompt.id] ?? prompt.content;
      }
      return drafts;
    });
    setSelectedPromptId(prev => {
      if (prev && promptVersions.some(prompt => prompt.id === prev)) return prev;
      return promptVersions.find(prompt => prompt.is_active)?.id ?? promptVersions[0]?.id ?? null;
    });
  }, [promptVersions]);

  const activePrompt = prompts.find(prompt => prompt.key === activePromptKey);
  const selectedPrompt = promptVersions.find(prompt => prompt.id === selectedPromptId) ?? activePrompt;

  const handleSavePrompt = () => {
    if (!selectedPrompt) return;
    updatePrompt.mutate(
      { id: selectedPrompt.id, content: promptDrafts[selectedPrompt.id] ?? '' },
      {
        onSuccess: () => toast.success('Промпт сохранён'),
        onError: error => toast.error(error.message || 'Не удалось сохранить промпт'),
      }
    );
  };

  const handleCreatePromptVersion = () => {
    if (!selectedPrompt) return;
    createPromptVersion.mutate(
      {
        key: selectedPrompt.key,
        name: selectedPrompt.name,
        content: promptDrafts[selectedPrompt.id] ?? selectedPrompt.content,
        description: `Новая версия на основе v${selectedPrompt.version}`,
      },
      {
        onSuccess: prompt => {
          setSelectedPromptId(prompt.id);
          toast.success(`Создана версия v${prompt.version}`);
        },
        onError: error => toast.error(error.message || 'Не удалось создать версию'),
      }
    );
  };

  const handleActivatePromptVersion = () => {
    if (!selectedPrompt || selectedPrompt.is_active) return;
    activatePromptVersion.mutate(
      { key: selectedPrompt.key, version: selectedPrompt.version },
      {
        onSuccess: () => toast.success(`Активирована версия v${selectedPrompt.version}`),
        onError: error => toast.error(error.message || 'Не удалось активировать версию'),
      }
    );
  };

  const handleDeletePromptVersion = () => {
    if (!selectedPrompt || selectedPrompt.is_active) return;
    const confirmed = window.confirm(`Удалить версию v${selectedPrompt.version} для ${selectedPrompt.name}?`);
    if (!confirmed) return;
    deletePromptVersion.mutate(
      { id: selectedPrompt.id, key: selectedPrompt.key },
      {
        onSuccess: () => {
          setSelectedPromptId(null);
          toast.success(`Версия v${selectedPrompt.version} удалена`);
        },
        onError: error => toast.error(error.message || 'Не удалось удалить версию'),
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Настройки</h1>

      <div className="space-y-8">
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
          <h2 className="text-lg font-semibold mb-1">Настройки обработки вакансий</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
            Таблица <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">prompts</code> в Supabase.
            n8n читает по ключу.
          </p>

          {promptsLoading ? (
            <p className="text-sm text-gray-400">Загрузка промптов...</p>
          ) : promptsError ? (
            <p className="text-sm text-red-500">
              Не удалось загрузить промпты: {promptsError.message}
            </p>
          ) : prompts.length === 0 ? (
            <p className="text-sm text-gray-400">
              Промпты не найдены. Проверь RLS-политики для таблицы{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">prompts</code>.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-5">
                {prompts.map(prompt => (
                  <button
                    key={prompt.key}
                    type="button"
                    onClick={() => {
                      setActivePromptKey(prompt.key);
                      setSelectedPromptId(null);
                    }}
                    className={[
                      'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                      activePromptKey === prompt.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
                    ].join(' ')}
                  >
                    {prompt.name}
                  </button>
                ))}
              </div>

              {selectedPrompt && (
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {versionsLoading ? (
                      <span className="text-sm text-gray-400">Загрузка версий...</span>
                    ) : (
                      promptVersions.map(prompt => (
                        <button
                          key={prompt.id}
                          type="button"
                          onClick={() => setSelectedPromptId(prompt.id)}
                          className={[
                            'px-2.5 py-1 rounded text-xs font-medium border transition-colors',
                            selectedPrompt.id === prompt.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                          ].join(' ')}
                        >
                          v{prompt.version}{prompt.is_active ? ' · active' : ''}
                        </button>
                      ))
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                      key: {selectedPrompt.key} · v{selectedPrompt.version}
                    </code>
                    {selectedPrompt.is_active && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                        active
                      </span>
                    )}
                    {selectedPrompt.updated_at && (
                      <span className="text-xs text-gray-400 ml-auto">
                        Обновлён: {new Date(selectedPrompt.updated_at).toLocaleDateString('ru')}
                      </span>
                    )}
                  </div>
                  <textarea
                    value={promptDrafts[selectedPrompt.id] ?? ''}
                    onChange={event => setPromptDrafts(prev => ({ ...prev, [selectedPrompt.id]: event.target.value }))}
                    rows={12}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm font-mono mb-3"
                    placeholder={`Текст промпта для ${selectedPrompt.name}...`}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSavePrompt}
                      disabled={updatePrompt.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                      {updatePrompt.isPending ? 'Сохранение...' : 'Сохранить текущую версию'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCreatePromptVersion}
                      disabled={createPromptVersion.isPending}
                      className="px-4 py-2 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 rounded hover:opacity-90 disabled:opacity-50 text-sm"
                    >
                      {createPromptVersion.isPending ? 'Создание...' : 'Создать новую версию'}
                    </button>
                    {!selectedPrompt.is_active && (
                      <button
                        type="button"
                        onClick={handleActivatePromptVersion}
                        disabled={activatePromptVersion.isPending}
                        className="px-4 py-2 border border-blue-600 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50 text-sm"
                      >
                        {activatePromptVersion.isPending ? 'Активация...' : 'Сделать активной'}
                      </button>
                    )}
                    {!selectedPrompt.is_active && (
                      <button
                        type="button"
                        onClick={handleDeletePromptVersion}
                        disabled={deletePromptVersion.isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 dark:text-red-300 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 text-sm"
                      >
                        <Trash2 size={14} />
                        {deletePromptVersion.isPending ? 'Удаление...' : 'Удалить версию'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <TgParserSection />

        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
          <h2 className="text-lg font-semibold mb-1">Настройка воронки</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Базовые этапы наследуются по умолчанию
          </p>

          <PipelineEditor />
        </div>
      </div>
    </div>
  );
}
