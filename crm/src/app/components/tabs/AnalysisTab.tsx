import { ScoreBadge } from '../ui/ScoreBadge';
import { useVacancyAnalysisLog } from '../../hooks/useAnalysisLog';
import type { Vacancy } from '../../lib/types';

interface AnalysisTabProps {
  vacancy: Vacancy;
}

function AnalyzerDisplay({ text }: { text: string }) {
  let data: Record<string, unknown> | null = null;
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) data = parsed as Record<string, unknown>;
  } catch { /* не JSON */ }

  if (!data) {
    return <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{text}</p>;
  }

  const comment = typeof data.comment === 'string' ? data.comment : null;
  const advice = typeof data.advice === 'string' ? data.advice : null;
  const greenFlags = Array.isArray(data.green_flags) ? data.green_flags as string[] : null;
  const redFlags = Array.isArray(data.red_flags) ? data.red_flags as string[] : null;
  const companyProduct = typeof data.company_product === 'string' ? data.company_product : null;
  const companyPains = typeof data.company_pains === 'string' ? data.company_pains : null;
  const brief = data.brief && typeof data.brief === 'object' ? data.brief as Record<string, unknown> : null;

  return (
    <div className="space-y-4 text-sm">
      {comment && (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Вывод</div>
          <p className="text-gray-700 dark:text-gray-300">{comment}</p>
        </div>
      )}

      {(greenFlags || redFlags) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {greenFlags && greenFlags.length > 0 && (
            <div>
              <div className="font-medium text-green-700 dark:text-green-400 mb-1">✓ Плюсы</div>
              <ul className="space-y-1">
                {greenFlags.map((f, i) => (
                  <li key={i} className="text-xs text-gray-700 dark:text-gray-300 leading-snug">{f}</li>
                ))}
              </ul>
            </div>
          )}
          {redFlags && redFlags.length > 0 && (
            <div>
              <div className="font-medium text-red-600 dark:text-red-400 mb-1">✕ Риски</div>
              <ul className="space-y-1">
                {redFlags.map((f, i) => (
                  <li key={i} className="text-xs text-gray-700 dark:text-gray-300 leading-snug">{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {advice && (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Совет перед интервью</div>
          <p className="text-gray-700 dark:text-gray-300">{advice}</p>
        </div>
      )}

      {brief && (
        <div className="border border-gray-200 dark:border-gray-700 rounded p-3 space-y-2">
          <div className="font-medium text-gray-900 dark:text-gray-100 text-xs uppercase tracking-wide">Бриф для письма</div>
          {typeof brief.tone === 'string' && (
            <p className="text-xs text-gray-600 dark:text-gray-400"><span className="font-medium">Тон:</span> {brief.tone}</p>
          )}
          {Array.isArray(brief.hooks) && (brief.hooks as string[]).length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">Хуки:</div>
              <ul className="space-y-0.5">
                {(brief.hooks as string[]).map((h, i) => (
                  <li key={i} className="text-xs text-gray-600 dark:text-gray-400">– {h}</li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(brief.avoid) && (brief.avoid as string[]).length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">Не упоминать:</div>
              <ul className="space-y-0.5">
                {(brief.avoid as string[]).map((a, i) => (
                  <li key={i} className="text-xs text-gray-600 dark:text-gray-400">– {a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {companyProduct && (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">О компании</div>
          <p className="text-gray-700 dark:text-gray-300 text-xs">{companyProduct}</p>
        </div>
      )}

      {companyPains && (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Боль компании</div>
          <p className="text-gray-700 dark:text-gray-300 text-xs">{companyPains}</p>
        </div>
      )}
    </div>
  );
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
          <AnalyzerDisplay text={analyzerText} />
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
