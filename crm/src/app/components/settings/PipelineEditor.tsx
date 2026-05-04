import { useState, useEffect } from 'react';
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
import {
  usePipelineStrict,
  useUpdatePipeline,
  useAddPipelineStage,
  useDeletePipelineStage,
  useRenamePipelineStage,
  useSeedPipelinePreset,
} from '../../hooks/usePipeline';
import { useDistinctSources } from '../../hooks/useDistinctSources';
import { toast } from 'sonner';
import type { PipelineStage } from '../../lib/types';

const PRESET_COLORS = ['#6B7280', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444'];
const EMPTY_STAGES: PipelineStage[] = [];

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

  // sync if parent updates
  useEffect(() => setName(stage.name), [stage.name]);

  const handleBlur = () => {
    setEditing(false);
    if (name.trim() && name.trim() !== stage.name) onRename(stage.id, name.trim());
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded"
    >
      <div {...attributes} {...listeners} className="cursor-grab touch-none">
        <GripVertical size={20} className="text-gray-400" />
      </div>
      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
      {editing ? (
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={e => e.key === 'Enter' && handleBlur()}
          className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none"
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          className="flex-1 cursor-text"
          title="Нажмите для переименования"
        >
          {stage.name}
        </span>
      )}
      <button
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
  const sources = useDistinctSources();
  // null = дефолтная воронка; string = воронка для конкретного источника
  // По умолчанию открываем первый источник если есть
  const [selectedSource, setSelectedSource] = useState<string | null>(
    () => null
  );

  const { data } = usePipelineStrict(selectedSource);
  const stages = data ?? EMPTY_STAGES;
  const updatePipeline = useUpdatePipeline();
  const addStage = useAddPipelineStage();
  const deleteStage = useDeletePipelineStage();
  const renameStage = useRenamePipelineStage();
  const seedPreset = useSeedPipelinePreset();

  const [items, setItems] = useState<PipelineStage[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  // Синхронизируем локальный стейт при загрузке данных
  useEffect(() => {
    setItems(stages);
  }, [stages]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems(prev => {
        const oldIndex = prev.findIndex(item => item.id === active.id);
        const newIndex = prev.findIndex(item => item.id === over.id);
        const reordered = arrayMove(prev, oldIndex, newIndex).map((item, idx) => ({
          ...item,
          order_index: idx + 1,
        }));
        updatePipeline.mutate(reordered, {
          onSuccess: () => toast.success('Порядок сохранён'),
          onError: () => toast.error('Ошибка сохранения'),
        });
        return reordered;
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteStage.mutate(id, {
      onSuccess: () => toast.success('Этап удалён'),
      onError: () => toast.error('Ошибка удаления'),
    });
  };

  const handleRename = (id: string, name: string) => {
    renameStage.mutate({ id, name }, {
      onSuccess: () => toast.success('Название сохранено'),
      onError: () => toast.error('Ошибка сохранения'),
    });
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    addStage.mutate(
      { name: newName.trim(), color: newColor, orderIndex: items.length + 1, source: selectedSource ?? undefined },
      {
        onSuccess: () => {
          toast.success('Этап добавлен');
          setNewName('');
          setAdding(false);
        },
        onError: () => toast.error('Ошибка добавления'),
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Шапка: вкладки по источникам + кнопка "По умолчанию" */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex gap-1 flex-wrap border-b border-gray-200 dark:border-gray-700 pb-3 flex-1">
          <button
            onClick={() => setSelectedSource(null)}
            className={`px-3 py-1.5 text-sm rounded-t transition-colors ${
              selectedSource === null
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            По умолчанию
          </button>
          {sources.map(src => (
            <button
              key={src}
              onClick={() => setSelectedSource(src)}
              className={`px-3 py-1.5 text-sm rounded-t transition-colors ${
                selectedSource === src
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {src}
            </button>
          ))}
          {sources.length === 0 && (
            <span className="text-xs text-gray-400 py-1.5">Добавьте вакансии через n8n — источники появятся автоматически</span>
          )}
        </div>
        <button
          onClick={() =>
            seedPreset.mutate(undefined, {
              onSuccess: () => toast.success('Базовые этапы созданы для всех источников'),
              onError: () => toast.error('Ошибка при создании этапов'),
            })
          }
          disabled={seedPreset.isPending}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 whitespace-nowrap"
          title="Заполнит базовые этапы для источников у которых их ещё нет"
        >
          {seedPreset.isPending ? '⏳ Создаю...' : 'По умолчанию'}
        </button>
      </div>

      {selectedSource !== null && items.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-sm mb-2">Нет этапов для <strong className="text-gray-500 dark:text-gray-400">{selectedSource}</strong></p>
          <p className="text-xs mb-3">Используется базовая воронка (только для отображения)</p>
          <button
            onClick={() =>
              seedPreset.mutate(undefined, {
                onSuccess: () => toast.success(`Базовые этапы для ${selectedSource} созданы`),
                onError: () => toast.error('Ошибка при создании этапов'),
              })
            }
            disabled={seedPreset.isPending}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {seedPreset.isPending ? '⏳ Создаю...' : 'Создать этапы по умолчанию'}
          </button>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map(stage => (
              <SortableStage
                key={stage.id}
                stage={stage}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {adding ? (
        <div className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded">
          <div className="flex gap-1">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  newColor === c ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Название этапа"
            className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none text-sm"
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || addStage.isPending}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Добавить
          </button>
          <button
            onClick={() => { setAdding(false); setNewName(''); }}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
          >
            Отмена
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-500"
        >
          + Добавить этап
        </button>
      )}
    </div>
  );
}
