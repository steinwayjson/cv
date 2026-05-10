import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import {
  useAddPipelineStage,
  useCreatePipelineSource,
  useDeletePipelineSource,
  useDeletePipelineStage,
  usePipelineStrict,
  useRenamePipelineStage,
  useSeedPipelinePreset,
  useUpdatePipeline,
} from '../../hooks/usePipeline';
import { usePipelineSources } from '../../hooks/useDistinctSources';
import { toast } from 'sonner';
import type { PipelineStage } from '../../lib/types';

const PRESET_COLORS = ['#6B7280', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444'];
const EMPTY_STAGES: PipelineStage[] = [];

function normalizeSource(value: string) {
  return value.trim();
}

function SortableStage({
  stage,
  onDelete,
  onRename,
}: {
  stage: PipelineStage;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(stage.name);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stage.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  useEffect(() => setName(stage.name), [stage.name]);

  const saveName = () => {
    const next = name.trim();
    setEditing(false);
    if (next && next !== stage.name) onRename(stage.id, next);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded"
    >
      <div {...attributes} {...listeners} className="cursor-grab touch-none">
        <GripVertical size={18} className="text-gray-400" />
      </div>
      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
      {editing ? (
        <input
          autoFocus
          value={name}
          onChange={event => setName(event.target.value)}
          onBlur={saveName}
          onKeyDown={event => {
            if (event.key === 'Enter') saveName();
            if (event.key === 'Escape') {
              setName(stage.name);
              setEditing(false);
            }
          }}
          className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex-1 text-left"
          title="Переименовать этап"
        >
          {stage.name}
        </button>
      )}
      <button
        type="button"
        onClick={() => onDelete(stage.id)}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        title="Удалить этап"
      >
        <X size={16} className="text-gray-400 hover:text-red-500" />
      </button>
    </div>
  );
}

export function PipelineEditor() {
  const { data: sourceRows = [] } = usePipelineSources();
  const sources = useMemo(
    () => sourceRows.map(normalizeSource).filter(Boolean).sort((a, b) => a.localeCompare(b)),
    [sourceRows]
  );
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const { data } = usePipelineStrict(selectedSource);
  const stages = data ?? EMPTY_STAGES;

  const updatePipeline = useUpdatePipeline();
  const addStage = useAddPipelineStage();
  const deleteStage = useDeletePipelineStage();
  const renameStage = useRenamePipelineStage();
  const seedPreset = useSeedPipelinePreset();
  const createSource = useCreatePipelineSource();
  const deleteSource = useDeletePipelineSource();

  const [items, setItems] = useState<PipelineStage[]>([]);
  const [addingStage, setAddingStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState(PRESET_COLORS[0]);
  const [newSource, setNewSource] = useState('');
  const [pendingStageDeleteId, setPendingStageDeleteId] = useState<string | null>(null);
  const [pendingSourceDelete, setPendingSourceDelete] = useState<string | null>(null);

  useEffect(() => setItems(stages), [stages]);

  useEffect(() => {
    if (selectedSource && !sources.some(source => source.toLowerCase() === selectedSource.toLowerCase())) {
      setSelectedSource(null);
    }
  }, [selectedSource, sources]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems(prev => {
      const oldIndex = prev.findIndex(item => item.id === active.id);
      const newIndex = prev.findIndex(item => item.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        order_index: idx + 1,
      }));
      updatePipeline.mutate(reordered, {
        onSuccess: () => toast.success('Порядок сохранён'),
        onError: () => toast.error('Не удалось сохранить порядок'),
      });
      return reordered;
    });
  };

  const handleAddSource = () => {
    const source = normalizeSource(newSource);
    if (!source) return;

    createSource.mutate(source, {
      onSuccess: () => {
        setSelectedSource(source);
        setNewSource('');
        toast.success(`Источник ${source} добавлен`);
      },
      onError: error => toast.error(error.message || 'Не удалось добавить источник'),
    });
  };

  const handleAddStage = () => {
    const name = newStageName.trim();
    if (!name) return;

    addStage.mutate(
      {
        name,
        color: newStageColor,
        orderIndex: items.length + 1,
        source: selectedSource ?? undefined,
      },
      {
        onSuccess: () => {
          setNewStageName('');
          setAddingStage(false);
          toast.success('Этап добавлен');
        },
        onError: error => toast.error(error.message || 'Не удалось добавить этап'),
      }
    );
  };

  const confirmStageDelete = () => {
    if (!pendingStageDeleteId) return;
    deleteStage.mutate(pendingStageDeleteId, {
      onSuccess: () => {
        setPendingStageDeleteId(null);
        toast.success('Этап удалён');
      },
      onError: error => {
        setPendingStageDeleteId(null);
        toast.error(error.message || 'Не удалось удалить этап');
      },
    });
  };

  const confirmSourceDelete = () => {
    if (!pendingSourceDelete) return;
    const source = pendingSourceDelete;
    deleteSource.mutate(source, {
      onSuccess: () => {
        setPendingSourceDelete(null);
        if (selectedSource?.toLowerCase() === source.toLowerCase()) setSelectedSource(null);
        toast.success(`Настройки источника ${source} удалены`);
      },
      onError: error => {
        setPendingSourceDelete(null);
        toast.error(error.message || 'Не удалось удалить источник');
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex gap-1 flex-wrap border-b border-gray-200 dark:border-gray-700 pb-3 flex-1">
          <button
            type="button"
            onClick={() => setSelectedSource(null)}
            className={`px-3 py-1.5 text-sm rounded-t transition-colors ${
              selectedSource === null
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            По умолчанию
          </button>
          {sources.map(source => {
            const active = selectedSource?.toLowerCase() === source.toLowerCase();

            return (
              <div
                key={source}
                className={`group inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-t transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedSource(source)}
                  className="min-w-0"
                >
                  {source}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingSourceDelete(source)}
                  className={`rounded p-0.5 ${
                    active ? 'hover:bg-blue-700' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Удалить источник"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() =>
            seedPreset.mutate(undefined, {
              onSuccess: () => toast.success('Базовые этапы созданы'),
              onError: error => toast.error(error.message || 'Не удалось создать этапы'),
            })
          }
          disabled={seedPreset.isPending}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 whitespace-nowrap"
        >
          По умолчанию
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newSource}
          onChange={event => setNewSource(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') handleAddSource();
          }}
          placeholder="Новый источник... (например: telegram)"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
        />
        <button
          type="button"
          onClick={handleAddSource}
          disabled={!newSource.trim() || createSource.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          Добавить
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-7 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded">
          <p className="text-sm">
            {selectedSource
              ? `Для ${selectedSource} пока нет своих этапов`
              : 'Базовая воронка пока не настроена'}
          </p>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(stage => stage.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map(stage => (
              <SortableStage
                key={stage.id}
                stage={stage}
                onDelete={setPendingStageDeleteId}
                onRename={(id, name) =>
                  renameStage.mutate(
                    { id, name },
                    {
                      onSuccess: () => toast.success('Название сохранено'),
                      onError: error => toast.error(error.message || 'Не удалось сохранить название'),
                    }
                  )
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {addingStage ? (
        <div className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded">
          <div className="flex gap-1">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setNewStageColor(color)}
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  newStageColor === color ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <input
            autoFocus
            value={newStageName}
            onChange={event => setNewStageName(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') handleAddStage();
              if (event.key === 'Escape') setAddingStage(false);
            }}
            placeholder="Название этапа"
            className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none text-sm"
          />
          <button
            type="button"
            onClick={handleAddStage}
            disabled={!newStageName.trim() || addStage.isPending}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Добавить
          </button>
          <button
            type="button"
            onClick={() => {
              setAddingStage(false);
              setNewStageName('');
            }}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
          >
            Отмена
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAddingStage(true)}
          className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-500"
        >
          + Добавить этап
        </button>
      )}

      <Modal
        isOpen={!!pendingStageDeleteId}
        onClose={() => setPendingStageDeleteId(null)}
        title="Удалить этап?"
        onConfirm={confirmStageDelete}
        confirmText="Удалить"
        cancelText="Отмена"
      >
        <p>Вакансии не удалятся. Удалится только настройка этапа воронки.</p>
      </Modal>

      <Modal
        isOpen={!!pendingSourceDelete}
        onClose={() => setPendingSourceDelete(null)}
        title="Удалить источник?"
        onConfirm={confirmSourceDelete}
        confirmText="Удалить"
        cancelText="Отмена"
      >
        <p>
          Удалятся только этапы воронки для источника {pendingSourceDelete}. Сами вакансии и их поле source не изменятся.
        </p>
      </Modal>
    </div>
  );
}
