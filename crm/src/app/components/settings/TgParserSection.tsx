import { useState } from 'react';
import { Plus, Trash2, Zap, CheckCircle, XCircle, Loader, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useTgChannels } from '../../hooks/useTgChannels';
import { useParserRuns, useParserTrigger } from '../../hooks/useParserRuns';

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
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

export function TgParserSection() {
  const { channels, isLoading, addChannel, toggleChannel, deleteChannel, isAdding } = useTgChannels();
  const { lastRun, runs } = useParserRuns();
  const { trigger, isRunning, result } = useParserTrigger();

  const [newUsername, setNewUsername] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = () => {
    const username = newUsername.replace(/^@/, '').trim();
    if (!username) return;
    addChannel(
      { username, title: newTitle.trim() || username },
      {
        onSuccess: () => {
          toast.success(`Канал @${username} добавлен`);
          setNewUsername('');
          setNewTitle('');
        },
        onError: (err) => toast.error(`Ошибка: ${err.message}`),
      },
    );
  };

  const handleDelete = (id: string, username: string) => {
    if (!confirm(`Удалить канал @${username}?`)) return;
    deleteChannel(id, {
      onSuccess: () => toast.success(`Канал @${username} удалён`),
      onError: (err) => toast.error(`Ошибка: ${err.message}`),
    });
  };

  const activeChannels = channels.filter((c) => c.is_active);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
      {/* Шапка */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold mb-1">Telegram-парсер</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Парсит новые вакансии из Telegram-каналов и отправляет в n8n.
          </p>
        </div>
        <button
          onClick={trigger}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
        >
          {isRunning ? (
            <>
              <Loader size={14} className="animate-spin" />
              Запуск...
            </>
          ) : (
            <>
              <Zap size={14} />
              Запустить сейчас
            </>
          )}
        </button>
      </div>

      {/* Статус последнего запуска */}
      {result && (
        <div
          className={`mb-4 px-4 py-3 rounded text-sm flex items-start gap-2 ${
            result.ok
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          }`}
        >
          {result.ok ? <CheckCircle size={16} className="mt-0.5 shrink-0" /> : <XCircle size={16} className="mt-0.5 shrink-0" />}
          <span>{result.message}</span>
        </div>
      )}

      {/* Статус последнего запуска (из БД) */}
      {lastRun && !result && (
        <div className="mb-4 flex items-center gap-3 text-sm">
          {lastRun.status === 'ok' ? (
            <CheckCircle size={16} className="text-green-500 shrink-0" />
          ) : (
            <XCircle size={16} className="text-red-500 shrink-0" />
          )}
          <span className="text-gray-600 dark:text-gray-400">
            Последний запуск: <strong className={lastRun.status === 'ok' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {lastRun.status === 'ok' ? '✓' : '✗'}
            </strong>{' '}
            {lastRun.trigger === 'manual' ? 'вручную' : 'по расписанию'},{' '}
            {formatRelativeTime(lastRun.created_at)}
            {lastRun.posts_found > 0 && ` · ${lastRun.posts_found} постов`}
            {lastRun.elapsed_ms > 0 && ` · ${formatElapsed(lastRun.elapsed_ms)}`}
            {lastRun.error_message && (
              <span className="block mt-1 text-red-500 dark:text-red-400 text-xs">
                {lastRun.error_message}
              </span>
            )}
          </span>
        </div>
      )}

      {/* Расписание */}
      <div className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        Автозапуск: каждые 6 часов (YC Cloud Scheduler → cron-триггер tg-parser)
      </div>

      {/* Таблица каналов */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Каналы ({activeChannels.length} активных из {channels.length})
          </p>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-400">Загрузка...</div>
        ) : channels.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            Нет каналов. Добавьте первый канал ниже.
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                  <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-8">Вкл</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Канал</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Последний пост</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {channels.map((ch) => (
                  <tr key={ch.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => toggleChannel({ id: ch.id, isActive: !ch.is_active })}
                        className={`w-9 h-5 rounded-full relative transition-colors ${
                          ch.is_active ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        style={{ padding: 0 }}
                        aria-label={ch.is_active ? 'Выключить' : 'Включить'}
                      >
                        <span
                          className={`block absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            ch.is_active ? 'translate-x-[18px]' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <a
                        href={`https://t.me/${ch.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline dark:text-blue-400 font-mono text-xs flex items-center gap-1"
                      >
                        @{ch.username}
                        <ExternalLink size={11} />
                      </a>
                      {ch.title && ch.title !== ch.username && (
                        <div className="text-xs text-gray-400 mt-0.5">{ch.title}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 text-xs">
                      {ch.last_post_id
                        ? `#${ch.last_post_id}`
                        : <span className="text-gray-300 dark:text-gray-600">—</span>
                      }
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => handleDelete(ch.id, ch.username)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Форма добавления */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          placeholder="@username канала"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
        />
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Название (необязательно)"
          className="w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
        />
        <button
          onClick={handleAdd}
          disabled={!newUsername.trim() || isAdding}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          <Plus size={14} />
          Добавить
        </button>
      </div>

      {/* История запусков */}
      {runs.length > 1 && (
        <div className="mt-5">
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
            История запусков
          </p>
          <div className="space-y-1">
            {runs.slice(0, 5).map((run) => (
              <div key={run.id} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                {run.status === 'ok' ? (
                  <CheckCircle size={12} className="text-green-400 shrink-0" />
                ) : (
                  <XCircle size={12} className="text-red-400 shrink-0" />
                )}
                <span>{formatRelativeTime(run.created_at)}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span>{run.trigger === 'manual' ? 'вручную' : 'cron'}</span>
                {run.posts_found > 0 && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <span>{run.posts_found} постов</span>
                  </>
                )}
                {run.elapsed_ms > 0 && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <span>{formatElapsed(run.elapsed_ms)}</span>
                  </>
                )}
                {run.error_message && (
                  <span className="text-red-400 ml-1 truncate max-w-[200px]">{run.error_message}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
