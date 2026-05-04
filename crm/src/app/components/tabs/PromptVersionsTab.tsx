import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { usePromptVersions } from '../../hooks/usePrompts';
import { useVacancyAnalysisLog, useDeleteAnalysisLog } from '../../hooks/useAnalysisLog';
import { useReanalyze } from '../../hooks/useReanalyze';
import { ScoreBadge } from '../ui/ScoreBadge';
import type { AgentKey, AnalysisLog, PromptKey, Vacancy } from '../../lib/types';

interface PromptVersionsTabProps {
  vacancy: Vacancy;
}

type AgentConfig = {
  agent: AgentKey;
  promptKey: PromptKey;
  label: string;
  currentVersion?: number | null;
  updatedAt?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return 'not run yet';
  return new Date(value).toLocaleString('ru');
}

function getLoggedScore(output: unknown): number | null {
  if (!output || typeof output !== 'object') return null;
  const data = output as Record<string, unknown>;
  const nested = ['output', 'result', 'data', 'json']
    .map(key => data[key])
    .find(value => value && typeof value === 'object') as Record<string, unknown> | undefined;
  const source = data.score != null ? data : nested ?? data;
  const rawScore = source.score;
  const score = typeof rawScore === 'number'
    ? rawScore
    : typeof rawScore === 'string' && rawScore.trim() !== ''
    ? Number(rawScore)
    : null;

  return score != null && Number.isFinite(score) ? score : null;
}

function getOutputPreview(log: AnalysisLog) {
  if (log.error) return log.error;
  if (typeof log.raw_output === 'string' && log.raw_output.trim()) {
    return log.raw_output.replace(/\s+/g, ' ').trim().slice(0, 220);
  }
  if (log.parsed_output) {
    return JSON.stringify(log.parsed_output).slice(0, 220);
  }
  return 'No output saved';
}

function AgentHistoryRow({
  config,
  vacancy,
  selectedVersion,
  onSelectVersion,
}: {
  config: AgentConfig;
  vacancy: Vacancy;
  selectedVersion?: number;
  onSelectVersion: (key: PromptKey, version: number) => void;
}) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { data: versions = [], isLoading: versionsLoading } = usePromptVersions(config.promptKey);
  const { data: logs = [], isLoading: logsLoading } = useVacancyAnalysisLog(vacancy.id, config.agent, 10);
  const deleteLog = useDeleteAnalysisLog(vacancy.id);

  const activeVersion = versions.find(version => version.is_active);
  const defaultVersion = config.currentVersion ?? activeVersion?.version ?? versions[0]?.version;
  const effectiveSelectedVersion = selectedVersion ?? defaultVersion;
  const versionsByNumber = useMemo(
    () => new Map(versions.map(version => [version.version, version])),
    [versions]
  );

  useEffect(() => {
    if (selectedVersion == null && defaultVersion != null) {
      onSelectVersion(config.promptKey, defaultVersion);
    }
  }, [config.promptKey, defaultVersion, onSelectVersion, selectedVersion]);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="font-medium text-sm">{config.label}</div>
          <div className="text-xs text-gray-500">
            current: {config.currentVersion ? `v${config.currentVersion}` : 'none'} - {formatDate(config.updatedAt)}
          </div>
        </div>
        <div className="text-right">
          <select
            value={effectiveSelectedVersion ?? ''}
            onChange={event => onSelectVersion(config.promptKey, Number(event.target.value))}
            disabled={versionsLoading || versions.length === 0}
            className="min-w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
          >
            {versions.length === 0 && <option value="">No versions</option>}
            {versions.map(version => (
              <option key={version.id} value={version.version}>
                v{version.version}{version.is_active ? ' active' : ''}
              </option>
            ))}
          </select>
          <div className="mt-1 text-xs text-gray-500">
            active: {versionsLoading ? '...' : activeVersion ? `v${activeVersion.version}` : 'none'}
          </div>
          {config.currentVersion && activeVersion && config.currentVersion !== activeVersion.version && (
            <div className="text-amber-600 dark:text-amber-400">not active now</div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {logsLoading && <div className="text-xs text-gray-500">Loading history...</div>}
        {!logsLoading && logs.length === 0 && (
          <div className="text-xs text-gray-500">No saved runs yet.</div>
        )}
        {logs.map(log => {
          const prompt = versionsByNumber.get(log.prompt_version);
          const score = config.agent === 'scoring' ? getLoggedScore(log.parsed_output) : null;
          const isCurrent = config.currentVersion === log.prompt_version;
          const isExpanded = expandedLogId === log.id;

          return (
            <div key={log.id} className="border border-gray-200 dark:border-gray-700 rounded p-2">
              <button
                type="button"
                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium">v{log.prompt_version}</span>
                    {prompt?.is_active && (
                      <span className="text-[11px] px-1.5 py-0.5 border border-green-300 text-green-700 rounded">active</span>
                    )}
                    {isCurrent && (
                      <span className="text-[11px] px-1.5 py-0.5 border border-blue-300 text-blue-700 rounded">current</span>
                    )}
                    {log.error && (
                      <span className="text-[11px] px-1.5 py-0.5 border border-red-300 text-red-700 rounded">error</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {score != null && <ScoreBadge score={score} />}
                    <span className="text-xs text-gray-500">{formatDate(log.created_at)}</span>
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-500 truncate">{getOutputPreview(log)}</div>
              </button>

              <div className="mt-2 flex items-center justify-end gap-2">
                {pendingDeleteId === log.id ? (
                  <>
                    <span className="text-xs text-red-600">Удалить запись?</span>
                    <button
                      type="button"
                      onClick={() => { deleteLog.mutate(log.id); setPendingDeleteId(null); }}
                      disabled={deleteLog.isPending}
                      className="text-xs px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
                    >
                      Да
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(null)}
                      className="text-xs px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Нет
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(log.id)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                    title="Удалить запись"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {isExpanded && (
                <pre className="mt-2 max-h-48 overflow-auto rounded bg-gray-50 dark:bg-gray-900 p-2 text-xs whitespace-pre-wrap">
                  {JSON.stringify(log.parsed_output ?? log.raw_output ?? log.error ?? null, null, 2)}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PromptVersionsTab({ vacancy }: PromptVersionsTabProps) {
  const reanalyze = useReanalyze();
  const [selectedVersions, setSelectedVersions] = useState<Partial<Record<PromptKey, number>>>({});

  const agents: AgentConfig[] = [
    {
      agent: 'scoring',
      promptKey: 'scoring',
      label: 'Scoring',
      currentVersion: vacancy.scoring_prompt_version,
      updatedAt: vacancy.scored_at,
    },
    {
      agent: 'analyzer',
      promptKey: 'analyzer',
      label: 'Analyzer',
      currentVersion: vacancy.analyzer_prompt_version,
      updatedAt: vacancy.analyzed_at,
    },
    {
      agent: 'copywriter',
      promptKey: 'copywriter',
      label: 'Copywriter',
      currentVersion: vacancy.copywriter_prompt_version,
      updatedAt: vacancy.copywritten_at,
    },
  ];

  useEffect(() => {
    setSelectedVersions({});
  }, [vacancy.id]);

  const handleSelectVersion = (key: PromptKey, version: number) => {
    if (!version) return;
    setSelectedVersions(prev => ({ ...prev, [key]: version }));
  };

  const handleReanalyze = () => {
    reanalyze.mutate({
      vacancyIds: [vacancy.id],
      promptVersions: selectedVersions,
    });
  };

  const selectedCount = agents.filter(config => selectedVersions[config.promptKey] != null).length;

  return (
    <div className="space-y-3">
      {agents.map(config => (
        <AgentHistoryRow
          key={config.agent}
          config={config}
          vacancy={vacancy}
          selectedVersion={selectedVersions[config.promptKey]}
          onSelectVersion={handleSelectVersion}
        />
      ))}
      <div className="sticky bottom-0 pt-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleReanalyze}
          disabled={reanalyze.isPending || selectedCount === 0}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-60"
        >
          <RefreshCw size={14} className={reanalyze.isPending ? 'animate-spin' : ''} />
          {reanalyze.isPending ? 'Sending...' : 'Reanalyze with selected versions'}
        </button>
      </div>
    </div>
  );
}
