import { useState, useEffect } from 'react';
import { StatusDropdown } from '../ui/StatusDropdown';
import { ClosedReasonDropdown } from '../ui/ClosedReasonDropdown';
import { Modal } from '../ui/Modal';
import { useUpdateVacancyStatus, useUpdateVacancyNotes, useUpdateClosedReason, useDeleteVacancy } from '../../hooks/useVacancies';
import { useIsVacancyReanalyzing } from '../../hooks/useReanalyze';
import { toast } from 'sonner';
import type { Vacancy, VacancyStatus } from '../../lib/types';

interface ActionsTabProps {
  vacancy: Vacancy;
  onDelete?: () => void;
}

export function ActionsTab({ vacancy, onDelete }: ActionsTabProps) {
  const [notes, setNotes] = useState(vacancy.notes || '');
  const [nextAction, setNextAction] = useState(vacancy.next_action || '');
  const [nextActionAt, setNextActionAt] = useState(
    vacancy.next_action_at ? vacancy.next_action_at.slice(0, 10) : ''
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const updateStatus = useUpdateVacancyStatus();
  const updateClosedReason = useUpdateClosedReason();
  const updateNotes = useUpdateVacancyNotes();
  const deleteVacancy = useDeleteVacancy();
  const isReanalyzing = useIsVacancyReanalyzing(vacancy.id);

  // Синхронизируем при смене вакансии
  useEffect(() => {
    setNotes(vacancy.notes || '');
    setNextAction(vacancy.next_action || '');
    setNextActionAt(vacancy.next_action_at ? vacancy.next_action_at.slice(0, 10) : '');
  }, [vacancy.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasChanges =
        notes !== (vacancy.notes ?? '') ||
        nextAction !== (vacancy.next_action ?? '') ||
        nextActionAt !== (vacancy.next_action_at?.slice(0, 10) ?? '');
      if (!hasChanges) return;
      updateNotes.mutate(
        { id: vacancy.id, notes, nextAction, nextActionAt: nextActionAt || undefined },
        { onSuccess: () => toast.success('Сохранено') }
      );
    }, 1500);

    return () => clearTimeout(timer);
  }, [notes, nextAction, nextActionAt, vacancy.id, vacancy.notes, vacancy.next_action, vacancy.next_action_at, updateNotes]);

  const handleDelete = () => {
    deleteVacancy.mutate(vacancy.id, {
      onSuccess: () => {
        toast.success('Вакансия удалена');
        onDelete?.();
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Статус</label>
        <StatusDropdown
          value={vacancy.status}
          source={vacancy.source}
          disabled={isReanalyzing}
          onChange={(status) => updateStatus.mutate({
            id: vacancy.id,
            status,
            lastStage: status === 'closed' ? vacancy.status : undefined,
          })}
          fullWidth
        />
      </div>

      {vacancy.status === 'closed' && (
        <div>
          <label className="block text-sm font-medium mb-2">Причина закрытия</label>
          <ClosedReasonDropdown
            value={vacancy.closed_reason}
            disabled={isReanalyzing}
            onChange={(reason) => updateClosedReason.mutate({ id: vacancy.id, closedReason: reason })}
            fullWidth
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Заметки</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
          placeholder="Автосохранение через 1.5 секунды..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Следующий шаг</label>
        <input
          type="text"
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
          placeholder="Отправить резюме, позвонить..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Дата напоминания</label>
        <input
          type="date"
          value={nextActionAt}
          onChange={(e) => setNextActionAt(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
        />
      </div>

      <button
        onClick={() => setShowDeleteModal(true)}
        className="w-full py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
      >
        Удалить вакансию
      </button>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Удалить вакансию?"
        onConfirm={handleDelete}
        confirmText="Удалить"
        cancelText="Отмена"
      >
        <p>Вы уверены, что хотите удалить вакансию {vacancy.role} в {vacancy.company_name}?</p>
      </Modal>
    </div>
  );
}
