import { useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { useUpdateVacancyLetter } from '../../hooks/useVacancies';
import { toast } from 'sonner';
import { parseLetterParts } from '../../lib/supabase';
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
  const parts = !isEditing ? parseLetterParts(displayText) : null;

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
    // Копируем только тело + PS (без строки «Тема:»), чтобы сразу вставить в письмо
    const textToCopy = parts
      ? [parts.body, parts.ps ? `P.S. ${parts.ps}` : null].filter(Boolean).join('\n\n')
      : displayText;
    navigator.clipboard.writeText(textToCopy);
    toast.success('Скопировано в буфер обмена');
  };

  const handleCopySubject = () => {
    if (parts?.subject) {
      navigator.clipboard.writeText(parts.subject);
      toast.success('Тема скопирована');
    }
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
        ) : parts ? (
          <div className="border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {parts.subject && (
              <div className="flex items-start justify-between gap-2 px-4 py-2.5">
                <div className="min-w-0">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Тема</span>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{parts.subject}</p>
                </div>
                <button onClick={handleCopySubject} className="shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Копировать тему">
                  <Copy size={13} className="text-gray-400" />
                </button>
              </div>
            )}
            <div className="px-4 py-3 cursor-text" onClick={() => { setEditedText(displayText); setIsEditing(true); }}>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{parts.body}</p>
            </div>
            {parts.ps && (
              <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-gray-500 dark:text-gray-400"><span className="font-medium">P.S.</span> {parts.ps}</p>
              </div>
            )}
          </div>
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
