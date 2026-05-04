import { ScoreBadge } from '../ui/ScoreBadge';
import { useVacancyAnalysisLog } from '../../hooks/useAnalysisLog';
import type { Vacancy } from '../../lib/types';

interface AnalysisTabProps {
  vacancy: Vacancy;
}

export function AnalysisTab({ vacancy }: AnalysisTabProps) {
  const { data: logs = [], isLoading: logsLoading } = useVacancyAnalysisLog(
    vacancy.id,
    undefined,
    20
  );
  const hasAnalysis = vacancy.score != null || vacancy.reason;
  const latestAnalyzerLog = logs.find(log =>
    String(log.agent).toLowerCase().trim() === 'analyzer' ||
    String(log.prompt_key).toLowerCase().trim() === 'analyzer'
  );
  const analyzerText = vacancy.analyzer_text || (latestAnalyzerLog?.raw_output
    ? latestAnalyzerLog.raw_output
        .replace(/<think>[\s\S]*?<\/think>/g, '')
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()
    : latestAnalyzerLog?.parsed_output
    ? JSON.stringify(latestAnalyzerLog.parsed_output, null, 2)
    : '');

  if (!hasAnalysis && !logsLoading && !analyzerText) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">Analysis has not been run yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {vacancy.score != null && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ScoreBadge score={vacancy.score} />
            <span className="text-sm text-gray-600 dark:text-gray-400">Match score</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${vacancy.score}%` }}
            />
          </div>
        </div>
      )}

      {vacancy.reason && (
        <div>
          <h3 className="font-medium mb-2">Scoring</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{vacancy.reason}</p>
        </div>
      )}

      <div>
        <h3 className="font-medium mb-2">Analyzer</h3>
        {logsLoading ? (
          <p className="text-sm text-gray-500">Loading analyzer result...</p>
        ) : analyzerText ? (
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{analyzerText}</p>
        ) : (
          <p className="text-sm text-gray-500">No analyzer result saved yet.</p>
        )}
      </div>

      {vacancy.category && (
        <div>
          <h3 className="font-medium mb-2">Category</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            vacancy.category === 'горячая'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : vacancy.category === 'норм'
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {vacancy.category}
          </span>
        </div>
      )}
    </div>
  );
}
