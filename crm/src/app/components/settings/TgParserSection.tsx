import { useState } from 'react';
import { Plus, Trash2, Zap, CheckCircle, XCircle, Loader, ExternalLink, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { useTgChannels } from '../../hooks/useTgChannels';
import { useParserRuns, useParserTrigger } from '../../hooks/useParserRuns';
import { useRawVacanciesStats, useResetSkipped, useResetProcessing } from '../../hooks/useRawVacancies';
import type { TgChannel, ParserRun } from '../../lib/types';

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} дн. назад`;
  if (hours > 0) return `${hours} ч. назад`;
  if (minutes > 0) return `${minutes} мин. назад`;
  return 'только что';
}

function formatElapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function getChannelLastRun(runs: ParserRun[], channelId: string): ParserRun | null {
  return runs.find(r => r.channel_id === channelId) ?? null;
}

function DepthInput({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(value); setEditing(true); }}
        className="text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 underline decoration-dashed"
        title="Изменить глубину"
      >
        {value} дн.
      </button>
    );
  }
  return (
    <span className="flex items-center gap-1">
      <input
        type="number"
        min={1}
        max={90}
        value={draft}
        onChange={e => setDraft(Number(e.target.value))}
        className="w-14 px-1 py-0.5 text-xs border border-blue-400 rounded bg-white dark:bg-gray-800"
        autoFocus
        onKeyDown={e => {
          if (e.key === 'Enter') { onSave(draft); setEditing(false); }
          if (e.key === 'Escape') setEditing(false);
        }}
      />
      <button
        onClick={() => { onSave(draft); setEditing(false); }}
        className="text-xs text-blue-600 hover:underline"
      >
        OK
      </button>
    </span>
  );
}

export function TgParserSection() {
  const { channels, isLoading, addChannel, toggleChannel, deleteChannel, updateDepth, isAdding } = useTgChannels();
  const { lastRun, runs } = useParserRuns();
  const { trigger, isRunning, result } = useParserTrigger();
  const { data: queueStats } = useRawVacanciesStats();
  const resetSkipped = useResetSkipped();
  const resetProcessing = useResetProcessing();

  const [newUsername, setNewUsername] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDepth, setNewDepth] = useState(40);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; username: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleAdd = () => {
    const username = newUsername.replace(/^@/, '').trim();
    if (!username) return;
    addChannel(
      { username, title: newTitle.trim() || username, depthDays: newDepth },
      {
        onSuccess: () => {
          toast.success(`Канал @${username} добавлен`);
          setNewUsername('');
          setNewTitle('');
          setNewDepth(40);
        },
        onError: (err) => toast.error(`Ошибка: ${err.message}`),
      },
    );
  };

  const handleDelete = (id: string, username: string) => setPendingDelete({ id, username });

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const { id, username } = pendingDelete;
    deleteChannel(id, {
      onSuccess: () => { toast.success(`Канал @${username} удалён`); setPendingDelete(null); },
      onError: (err) => { toast.error(`Ошибка: ${err.message}`); setPendingDelete(null); },
    });
  };

  const activeChannels = channels.filter((c: TgChannel) => c.is_active);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded space-y-5">

      {/* Шапка */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Telegram-парсер</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Парсит вакансии из Telegram-каналов → пишет в raw_vacancies → n8n обрабатывает
          </p>
        </div>
        <button
          onClick={trigger}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {isRunning
            ? <><Loader size={14} className="animate-spin" />Запуск...</>
            : <><Zap size={14} />Запустить</>
          }
        </button>
      </div>

      {/* Результат ручного запуска */}
      {result && (
        <div className={`px-4 py-3 rounded text-sm flex items-start gap-2 ${
          result.ok
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        }`}>
          {result.ok
            ? <CheckCircle size={16} className="mt-0.5 shrink-0" />
            : <XCircle size={16} className="mt-0.5 shrink-0" />
          }
          <span>{result.message}</span>
        </div>
      )}

      {/* Последний запуск из БД */}
      {lastRun && !result && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          {lastRun.status === 'ok'
            ? <CheckCircle size={14} className="text-green-500 shrink-0" />
            : <XCircle size={14} className="text-red-500 shrink-0" />
          }
          <span>
            Последний запуск: {formatRelativeTime(lastRun.created_at)}
            {lastRun.posts_found > 0 && ` · ${lastRun.posts_found} постов`}
            {lastRun.elapsed_ms > 0 && ` · ${formatElapsed(lastRun.elapsed_ms)}`}
          </span>
        </div>
      )}

      {/* Автозапуск */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Автозапуск: каждые 6 часов (YC Cloud Scheduler)
      </p>

      {/* Очередь raw_vacancies */}
      {queueStats && (
        <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Очередь обработки
            </span>
            {(queueStats.skipped ?? 0) > 0 && (
              <button
                onClick={() => resetSkipped.mutate()}
                disabled={resetSkipped.isPending}
                className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 disabled:opacity-60"
                title="Сбросить skipped → new для повторной обработки"
              >
                <RefreshCw size={11} className={resetSkipped.isPending ? 'animate-spin' : ''} />
                Сбросить {queueStats.skipped} skipped
              </button>
            )}
            {(queueStats.processing ?? 0) > 0 && (
              <button
                onClick={() => resetProcessing.mutate()}
                disabled={resetProcessing.isPending}
                className="flex items-center gap-1 text-xs text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 disabled:opacity-60"
                title="Сбросить processing → new для повторной обработки"
              >
                <RefreshCw size={11} className={resetProcessing.isPending ? 'animate-spin' : ''} />
                Сбросить {queueStats.processing} processing
              </button>
            )}
          </div>
          <div className="flex gap-4">
            {[
              { key: 'new',        label: 'Новых',       color: 'text-blue-600 dark:text-blue-400' },
              { key: 'processing', label: 'В обработке', color: 'text-yellow-600 dark:text-yellow-400' },
              { key: 'done',       label: 'Готово',      color: 'text-green-600 dark:text-green-400' },
              { key: 'skipped',    label: 'Пропущено',   color: 'text-red-500 dark:text-red-400' },
            ].map(({ key, label, color }) => (
              <div key={key} className="text-center">
                <div className={`text-lg font-semibold ${color}`}>
                  {(queueStats as Record<string, number>)[key] ?? 0}
                </div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Таблица каналов */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Каналы ({activeChannels.length} активных из {channels.length})
        </p>

        {isLoading ? (
          <div className="py-6 text-center text-sm text-gray-400">Загрузка...</div>
        ) : channels.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-400">
            Нет каналов. Добавьте первый ниже.
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400">
                  <th className="text-left px-3 py-2 font-medium w-8">Вкл</th>
                  <th className="text-left px-3 py-2 font-medium">Канал</th>
                  <th className="text-left px-3 py-2 font-medium">Глубина</th>
                  <th className="text-left px-3 py-2 font-medium">Последний пост</th>
                  <th className="text-left px-3 py-2 font-medium">Последний запуск</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {channels.map((ch: TgChannel) => {
                  const chLastRun = getChannelLastRun(runs, ch.id);
                  return (
                    <tr key={ch.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => toggleChannel({ id: ch.id, isActive: !ch.is_active })}
                          className={`w-9 h-5 rounded-full relative transition-colors ${
                            ch.is_active ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                          style={{ padding: 0 }}
                          aria-label={ch.is_active ? 'Выключить' : 'Включить'}
                        >
                          <span className={`block absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            ch.is_active ? 'translate-x-[18px]' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </td>
                      <td className="px-3 py-2.5">
                        <a
                          href={`https://t.me/${ch.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400 font-mono text-xs flex items-center gap-1"
                        >
                          @{ch.username}<ExternalLink size={10} />
                        </a>
                        {ch.title && ch.title !== ch.username && (
                          <div className="text-xs text-gray-400 mt-0.5">{ch.title}</div>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <DepthInput
                          value={ch.depth_days ?? 40}
                          onSave={(v) => updateDepth({ id: ch.id, depthDays: v }, {
                            onSuccess: () => toast.success(`Глубина @${ch.username} → ${v} дн.`),
                          })}
                        />
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                        {ch.last_post_id
                          ? `#${ch.last_post_id}`
                          : <span className="text-gray-300 dark:text-gray-600">—</span>
                        }
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                        {chLastRun ? (
                          <span className="flex items-center gap-1">
                            {chLastRun.status === 'ok'
                              ? <CheckCircle size={11} className="text-green-500 shrink-0" />
                              : <XCircle size={11} className="text-red-500 shrink-0" />
                            }
                            {formatRelativeTime(chLastRun.created_at)}
                            {chLastRun.posts_found > 0 && ` · ${chLastRun.posts_found} п.`}
                          </span>
                        ) : (
                          ch.last_run_at
                            ? formatRelativeTime(ch.last_run_at)
                            : <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => handleDelete(ch.id, ch.username)}
                          className="text-gray-400 hover:text-red-500"
                          title="Удалить"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Форма добавления */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          placeholder="@username канала"
          className="flex-1 min-w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
        />
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Название (необязательно)"
          className="w-44 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
        />
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-500 whitespace-nowrap">Глубина:</label>
          <input
            type="number"
            min={1}
            max={90}
            value={newDepth}
            onChange={(e) => setNewDepth(Number(e.target.value))}
            className="w-16 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
          />
          <span className="text-xs text-gray-400">дн.</span>
        </div>
        <button
          onClick={handleAdd}
          disabled={!newUsername.trim() || isAdding}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          <Plus size={14} />Добавить
        </button>
      </div>

      {/* История запусков — сворачиваемая */}
      {runs.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(v => !v)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            История запусков ({runs.length})
          </button>
          {showHistory && (
            <div className="mt-2 space-y-1">
              {runs.map((run: ParserRun) => (
                <div key={run.id} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  {run.status === 'ok'
                    ? <CheckCircle size={12} className="text-green-400 shrink-0" />
                    : <XCircle size={12} className="text-red-400 shrink-0" />
                  }
                  <span>{formatRelativeTime(run.created_at)}</span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span>{run.trigger === 'manual' ? 'вручную' : 'cron'}</span>
                  {run.posts_found > 0 && (
                    <><span className="text-gray-300 dark:text-gray-600">·</span><span>{run.posts_found} постов</span></>
                  )}
                  {run.elapsed_ms > 0 && (
                    <><span className="text-gray-300 dark:text-gray-600">·</span><span>{formatElapsed(run.elapsed_ms)}</span></>
                  )}
                  {run.error_message && (
                    <span className="text-red-400 truncate max-w-[200px]">{run.error_message}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="Удалить канал?"
        onConfirm={confirmDelete}
        confirmText="Удалить"
        cancelText="Отмена"
      >
        <p>
          Удалить канал @{pendingDelete?.username}? last_post_id сбросится —
          при следующем запуске канал будет прочитан заново.
        </p>
      </Modal>
    </div>
  );
}
