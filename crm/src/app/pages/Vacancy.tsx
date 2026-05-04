import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useVacancy } from '../hooks/useVacancies';
import { ScoreBadge } from '../components/ui/ScoreBadge';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { AnalysisTab } from '../components/tabs/AnalysisTab';
import { LetterTab } from '../components/tabs/LetterTab';
import { ActionsTab } from '../components/tabs/ActionsTab';
import { PromptVersionsTab } from '../components/tabs/PromptVersionsTab';

type Tab = 'analysis' | 'letter' | 'versions' | 'actions';

export function Vacancy() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: vacancy } = useVacancy(id || '');
  const [activeTab, setActiveTab] = useState<Tab>('analysis');

  if (!vacancy) {
    return <div className="p-6">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <ArrowLeft size={20} />
          <span>Назад</span>
        </button>

        <h1 className="text-xl font-bold mb-1">{vacancy.company_name}</h1>
        <div className="text-lg mb-3">{vacancy.role}</div>

        <div className="flex items-center gap-2 flex-wrap">
          {vacancy.score != null && <ScoreBadge score={vacancy.score} />}
          {vacancy.category && <CategoryBadge category={vacancy.category} />}
          {vacancy.salary && (
            <span className="text-sm text-gray-600 dark:text-gray-400">{vacancy.salary}</span>
          )}
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

      <div className="p-6">
        {activeTab === 'analysis' && <AnalysisTab vacancy={vacancy} />}
        {activeTab === 'letter' && <LetterTab vacancy={vacancy} />}
        {activeTab === 'versions' && <PromptVersionsTab vacancy={vacancy} />}
        {activeTab === 'actions' && (
          <ActionsTab vacancy={vacancy} onDelete={() => navigate('/dashboard')} />
        )}
      </div>
    </div>
  );
}
