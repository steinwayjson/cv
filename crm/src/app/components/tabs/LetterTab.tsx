import { useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { useUpdateVacancyLetter } from '../../hooks/useVacancies';
import { toast } from 'sonner';
import type { Vacancy } from '../../lib/types';

interface LetterTabProps {
  vacancy: Vacancy;
}

export function LetterTab({ vacancy }: LetterTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(vacancy.letter_edited || vacancy.letter || '');
  const updateLetter = useUpdateVacancyLetter();

  const displayText = vacancy.letter_edited || vacancy.letter || '';
  const isEdited = !!vacancy.letter_edited;

  const handleSave = () => {
    updateLetter.mutate(
      { id: vacancy.id, letterEdited: editedText },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success('Письмо сохранено');
        },
      }
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText);
    toast.success('Скопировано в буфер обмена');
  };

  const handleRevert = () => {
    updateLetter.mutate(
      { id: vacancy.id, letterEdited: '' },
      {
        onSuccess: () => {
          setEditedText(vacancy.letter || '');
          toast.success('Восстановлен оригинал');
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      {vacancy.link && (
        <a
          href={vacancy.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <ExternalLink size={14} />
          <span>Открыть вакансию</span>
        </a>
      )}

      {isEdited && (
        <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm">
          <span>Показана отредактированная версия</span>
          <button
            onClick={handleRevert}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Вернуть оригинал
          </button>
        </div>
      )}

      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <Copy size={16} />
        </button>

        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="p-4 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm cursor-text min-h-[256px] whitespace-pre-wrap"
          >
            {displayText}
          </div>
        )}
      </div>

      {isEditing && (
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Сохранить правки
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditedText(displayText);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Отмена
          </button>
        </div>
      )}
    </div>
  );
}
