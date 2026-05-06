import { useState, useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import { useAgentConfig, useUpdateAgentConfig } from '../hooks/useAgentConfig';
import {
  useActivatePromptVersion,
  useCreatePromptVersion,
  useDeletePromptVersion,
  usePrompts,
  usePromptVersions,
  useUpdatePrompt,
} from '../hooks/usePrompts';
import { useManualSources } from '../hooks/useManualSources';
import { useDistinctSources } from '../hooks/useDistinctSources';
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
  const { data: agentConfig } = useAgentConfig();
  const updateAgentConfig = useUpdateAgentConfig();
  const { sources: manualSources, add: addSource, remove: removeSource } = useManualSources();
  const sources = useDistinctSources();
  const [newSource, setNewSource] = useState('');
  const [activePromptKey, setActivePromptKey] = useState<PromptKey | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [promptDrafts, setPromptDrafts] = useState<Record<string, string>>({});
  const [minSalary, setMinSalary] = useState(0);
  const { data: promptVersionsData, isLoading: versionsLoading } = usePromptVersions(activePromptKey);
  const promptVersions = promptVersionsData ?? EMPTY_PROMPTS;

  const autoSources = Array.from(
    new Set(sources.map(s => s.toLowerCase()))
  ).sort();

  useEffect(() => {
    const drafts: Record<string, string> = {};
    for (const p of prompts) drafts[p.id] = p.content;
    setPromptDrafts(drafts);
    setActivePromptKey(prev => prev ?? prompts[0]?.key ?? null);
  }, [prompts]);

  useEffect(() => {
    if (promptVersions.length === 0) return;
    setPromptDrafts(prev => {
      const drafts = { ...prev };
      for (const p of promptVersions) drafts[p.id] = drafts[p.id] ?? p.content;
      return drafts;
    });
    setSelectedPromptId(prev => {
      if (prev && promptVersions.some(p => p.id === prev)) return prev;
      return promptVersions.find(p => p.is_active)?.id ?? promptVersions[0]?.id ?? null;
    });
  }, [promptVersions]);

  useEffect(() => {
    if (agentConfig) setMinSalary(agentConfig.params?.min_salary ?? 0);
  }, [agentConfig]);

  const activePrompt = prompts.find(p => p.key === activePromptKey);
  const selectedPrompt = promptVersions.find(p => p.id === selectedPromptId) ?? activePrompt;

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

  const handleSaveMinSalary = () => {
    updateAgentConfig.mutate(
      { params: { min_salary: minSalary, work_formats: [], stop_words: [] } },
      { onSuccess: () => toast.success('Сохранено') }
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Настройки</h1>

      <div className="space-y-8">

        {/* Настройки обработки вакансий */}
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
          <h2 className="text-lg font-semibold mb-1">Настройки обработки вакансий</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
            Таблица{' '}
            <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">prompts</code>{' '}
            в Supabase. n8n читает по ключу.
          </p>

          {promptsLoading ? (
            <p className="text-sm text-gray-400">Загрузка промптов...</p>
          ) : promptsError ? (
            <p className="text-sm text-red-500">
              Не удалось загрузить промпты: {promptsError.message}
            </p>
          ) : prompts.length === 0 ? (
            <p className="text-sm text-gray-400">
              Промпты не найдены — проверьте RLS-политики для таблицы{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">prompts</code>.
            </p>
          ) : (
            <>
              {/* Переключатель */}
              <div className="flex flex-wrap gap-2 mb-5">
                {prompts.map(p => (
                  <button
                    key={p.key}
                    onClick={() => {
                      setActivePromptKey(p.key);
                      setSelectedPromptId(null);
                    }}
                    className={[
                      'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                      activePromptKey === p.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
                    ].join(' ')}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Редактор активного промпта */}
              {selectedPrompt && (
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {versionsLoading ? (
                      <span className="text-sm text-gray-400">Загрузка версий...</span>
                    ) : (
                      promptVersions.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPromptId(p.id)}
                          className={[
                            'px-2.5 py-1 rounded text-xs font-medium border transition-colors',
                            selectedPrompt.id === p.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                          ].join(' ')}
                        >
                          v{p.version}{p.is_active ? ' · active' : ''}
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
                    onChange={e => setPromptDrafts(prev => ({ ...prev, [selectedPrompt.id]: e.target.value }))}
                    rows={12}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm font-mono mb-3"
                    placeholder={'Текст промпта для ' + selectedPrompt.name + '...'}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleSavePrompt}
                      disabled={updatePrompt.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                      {updatePrompt.isPending ? 'Сохранение...' : 'Сохранить текущую версию'}
                    </button>
                    <button
                      onClick={handleCreatePromptVersion}
                      disabled={createPromptVersion.isPending}
                      className="px-4 py-2 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 rounded hover:opacity-90 disabled:opacity-50 text-sm"
                    >
                      {createPromptVersion.isPending ? 'Создание...' : 'Создать новую версию'}
                    </button>
                    {!selectedPrompt.is_active && (
                      <button
                        onClick={handleActivatePromptVersion}
                        disabled={activatePromptVersion.isPending}
                        className="px-4 py-2 border border-blue-600 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50 text-sm"
                      >
                        {activatePromptVersion.isPending ? 'Активация...' : 'Сделать активной'}
                      </button>
                    )}
                    {!selectedPrompt.is_active && (
                      <button
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

        {/* Фильтр зарплаты */}
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
          <h2 className="text-lg font-semibold mb-1">Фильтр зарплаты</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            n8n проверяет до вызова модели — вакансии ниже порога не анализируются.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={minSalary}
              onChange={e => setMinSalary(Number(e.target.value))}
              step={10000}
              className="w-48 p-2.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
            />
            <span className="text-sm text-gray-500">₽ / мес</span>
            <button
              onClick={handleSaveMinSalary}
              disabled={updateAgentConfig.isPending}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              Сохранить
            </button>
          </div>
        </div>

        {/* Источники */}
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
          <h2 className="text-lg font-semibold mb-1">Источники</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Добавляй заранее — до первой вакансии из этого канала.
          </p>
          {autoSources.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Доступные</p>
              <div className="flex flex-wrap gap-2">
                {autoSources.map(src => (
                  <span key={src} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300">
                    {src}
                  </span>
                ))}
              </div>
            </div>
          )}
          {manualSources.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Добавлены вручную</p>
              <div className="flex flex-wrap gap-2">
                {manualSources.map(src => (
                  <div key={src} className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full text-sm">
                    <span>{src}</span>
                    {!autoSources.includes(src) && (
                      <button onClick={() => removeSource(src)} className="ml-1 text-gray-400 hover:text-red-500" title="Удалить">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSource}
              onChange={e => setNewSource(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { addSource(newSource); setNewSource(''); } }}
              placeholder="Новый источник... (например: telegram)"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
            />
            <button
              onClick={() => { addSource(newSource); setNewSource(''); }}
              disabled={!newSource.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              Добавить
            </button>
          </div>
        </div>

        {/* TG-парсер */}
        <TgParserSection />

        {/* Воронка */}
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
          <h2 className="text-lg font-semibold mb-1">Воронка</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Названия этапов по источникам.
          </p>
          <PipelineEditor />
        </div>

      </div>
    </div>
  );
}
