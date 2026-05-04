import { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { AnalysisTab } from '../tabs/AnalysisTab';
import { LetterTab } from '../tabs/LetterTab';
import { ActionsTab } from '../tabs/ActionsTab';
import { PromptVersionsTab } from '../tabs/PromptVersionsTab';
import { ScoreBadge } from '../ui/ScoreBadge';
import { CategoryBadge } from '../ui/CategoryBadge';
import { useVacancy } from '../../hooks/useVacancies';
import type { Vacancy } from '../../lib/types';

interface SidePanelProps {
  vacancy: Vacancy | null;
  onClose: () => void;
}

type Tab = 'analysis' | 'letter' | 'versions' | 'actions';

export function SidePanel({ vacancy, onClose }: SidePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('analysis');
  const { data: detailedVacancy } = useVacancy(vacancy?.id ?? '');
  const currentVacancy = detailedVacancy ?? vacancy;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (vacancy) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [vacancy, onClose]);

  if (!currentVacancy) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X size={20} />
          </button>

          <div className="flex items-start gap-2 mb-2">
            <h2 className="text-xl font-bold">{currentVacancy.company_name}</h2>
            {currentVacancy.company_site && (
              <a
                href={currentVacancy.company_site}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>

          <div className="text-lg mb-3">{currentVacancy.role}</div>

          <div className="flex items-center gap-2 flex-wrap">
            {currentVacancy.score != null && <ScoreBadge score={currentVacancy.score} />}
            {currentVacancy.category && <CategoryBadge category={currentVacancy.category} />}
            {currentVacancy.salary && (
              <span className="text-sm text-gray-600 dark:text-gray-400">{currentVacancy.salary}</span>
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">{currentVacancy.source}</span>
          </div>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'analysis'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Анализ
          </button>
          <button
            onClick={() => setActiveTab('letter')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'letter'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Письмо
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'versions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Версии
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'actions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Действия
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'analysis' && <AnalysisTab vacancy={currentVacancy} />}
          {activeTab === 'letter' && <LetterTab vacancy={currentVacancy} />}
          {activeTab === 'versions' && <PromptVersionsTab vacancy={currentVacancy} />}
          {activeTab === 'actions' && <ActionsTab vacancy={currentVacancy} onDelete={onClose} />}
        </div>
      </div>
    </>
  );
}
