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
import { GripVertical, Lock, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import {
  useAddPipelineStage,
  useCreatePipelineSource,
  useDeletePipelineSource,
  useDeletePipelineStage,
  usePipeline,
  usePipelineStrict,
  useRenamePipelineStage,
  useUpdatePipeline,
} from '../../hooks/usePipeline';

import { FIXED_SOURCES, canonicalSource } from '../../lib/sources';
import { toast } from 'sonner';
import type { PipelineStage } from '../../lib/types';

const PRESET_COLORS = ['#6B7280', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444'];
const EMPTY_STAGES: PipelineStage[] = [];

function SortableStage({
  stage,
  isBase,
  onDelete,
  onRename,
}: {
  stage: PipelineStage;
  isBase: boolean;
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
      className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded ${
        isBase ? 'opacity-90' : ''
      }`}
    >
      <div {...attributes} {...listeners} className={`cursor-grab touch-none ${isBase ? 'cursor-not-allowed opacity-40' : ''}`}>
        <GripVertical size={18} className="text-gray-400" />
      </div>
      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
      {editing && !isBase ? (
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
          onClick={() => !isBase && setEditing(true)}
          className={`flex-1 text-left ${isBase ? 'cursor-default' : ''}`}
          title={isBase ? 'Базовый этап — переименуйте на вкладке «По умолчанию»' : 'Переименовать этап'}
        >
          <span className="flex items-center gap-1.5">
            {stage.name}
            {isBase && <Lock size={12} className="text-gray-400 flex-shrink-0" />}
          </span>
        </button>
      )}
      {!isBase && (
        <button
          type="button"
          onClick={() => onDelete(stage.id)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Удалить этап"
        >
          <X size={16} className="text-gray-400 hover:text-red-500" />
        </button>
      )}
    </div>
  );
}

export function PipelineEditor() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const isSelectedTabDefault = selectedSource === null;

  // Загружаем дефолтные этапы (всегда) и source-specific этапы (если не дефолт)
  const { data: defaultStages = [] } = usePipeline();
  const { data: strictStages = [] } = usePipelineStrict(selectedSource);


  // Мержим: на вкладке источника интерливим базовые этапы с source-specific
  // source-specific с base_key переопределяют базовые; без base_key — кастомные
  const mergedStages = useMemo<PipelineStage[]>(() => {
    if (isSelectedTabDefault) return strictStages;
    // Source tab: дефолтные этапы + переопределения по base_key + кастомные (без base_key)
    const sourceByBaseKey = new Map<string, PipelineStage>(
      strictStages.filter(s => s.base_key).map(s => [s.base_key!, s])
    );
    const sourceCustom = strictStages.filter(s => !s.base_key);
    const merged = defaultStages.map(b => {
      const override = sourceByBaseKey.get(b.base_key!);
      return override || b;
    });
    merged.push(...sourceCustom);
    merged.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    return merged;
  }, [isSelectedTabDefault, defaultStages, strictStages]);

  const updatePipeline = useUpdatePipeline();
  const addStage = useAddPipelineStage();
  const deleteStage = useDeletePipelineStage();
  const renameStage = useRenamePipelineStage();
  const createSource = useCreatePipelineSource();
  const deleteSource = useDeletePipelineSource();

  const [items, setItems] = useState<PipelineStage[]>([]);
  const [addingStage, setAddingStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState(PRESET_COLORS[0]);
  const [newSource, setNewSource] = useState('');
  const [pendingStageDeleteId, setPendingStageDeleteId] = useState<string | null>(null);
  const [pendingSourceDelete, setPendingSourceDelete] = useState<string | null>(null);

  const allTabSources = useMemo(() => [...FIXED_SOURCES], []);

  useEffect(() => setItems(mergedStages), [mergedStages]);


  useEffect(() => {
    if (selectedSource) {
      const canonical = canonicalSource(selectedSource);
      const isKnown = allTabSources.some(s => canonicalSource(s) === canonical);
      if (!isKnown) setSelectedSource(null);
    }
  }, [selectedSource, allTabSources]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Определяем, какие этапы базовые
  const baseKeys = ['new', 'sent', 'replied', 'sobes', 'meeting', 'closed'];

  const isBaseStage = (stage: PipelineStage) =>
    isSelectedTabDefault ? stage.is_base === true : baseKeys.includes(stage.base_key ?? '');

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
      // На вкладке источника сохраняем только source-specific этапы,
      // чтобы не перезаписать дефолтные
      const toSave = isSelectedTabDefault
        ? reordered
        : reordered.filter(s => s.source);
      updatePipeline.mutate(toSave, {
        onSuccess: () => toast.success('Порядок сохранён'),
        onError: () => toast.error('Не удалось сохранить порядок'),
      });
      return reordered;
    });
  };

  const handleAddSource = () => {
    const source = newSource.trim();
    if (!source) return;
    createSource.mutate(source, {
      onSuccess: () => {
        setSelectedSource(source);
        setNewSource('');
        toast.success(`Источник ${source} добавлен`);
      },
      onError: (error: Error) => toast.error(error.message || 'Не удалось добавить источник'),
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
        onError: (error: Error) => toast.error(error.message || 'Не удалось добавить этап'),
      }
    );
  };

  const confirmStageDelete = () => {
    if (!pendingStageDeleteId) return;
    // Проверяем, не пытаемся ли удалить базовый этап
    const stage = items.find(s => s.id === pendingStageDeleteId);
    if (stage && isBaseStage(stage)) {
      setPendingStageDeleteId(null);
      toast.error('Нельзя удалить базовый этап воронки');
      return;
    }
    deleteStage.mutate(pendingStageDeleteId, {
      onSuccess: () => {
        setPendingStageDeleteId(null);
        toast.success('Этап удалён');
      },
      onError: (error: Error) => {
        setPendingStageDeleteId(null);
        toast.error(error.message || 'Не удалось удалить этап');
      },
    });
  };

  const confirmSourceDelete = () => {
    if (!pendingSourceDelete) return;
    const src = pendingSourceDelete;
    deleteSource.mutate(src, {
      onSuccess: () => {
        setPendingSourceDelete(null);
        if (selectedSource?.toLowerCase() === src.toLowerCase()) setSelectedSource(null);
        toast.success(`Настройки источника ${src} удалены`);
      },
      onError: (error: Error) => {
        setPendingSourceDelete(null);
        toast.error(error.message || 'Не удалось удалить источник');
      },
    });
  };

  const canDeleteTab = (source: string) => {
    const canonical = canonicalSource(source);
    return !(FIXED_SOURCES as readonly string[]).includes(canonical);
  };

  return (
    <div className="space-y-4">
      {/* ── Табы источников ── */}
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex gap-1 flex-wrap border-b border-gray-200 dark:border-gray-700 pb-3 flex-1">
          {/* Дефолтная воронка */}
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

          {/* Фиксированные источники */}
          {allTabSources.map(source => {
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
                {canDeleteTab(source) && (
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
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Этапы воронки ── */}
      {items.length === 0 && (
        <div className="text-center py-7 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded">
          <p className="text-sm">
            {selectedSource
              ? `Для «${selectedSource}» этапы пока не созданы`
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
                isBase={isBaseStage(stage)}
                onDelete={setPendingStageDeleteId}
                onRename={(id, name) =>
                  renameStage.mutate(
                    { id, name },
                    {
                      onSuccess: () => toast.success('Название сохранено'),
                      onError: (error: Error) => toast.error(error.message || 'Не удалось сохранить название'),
                    }
                  )
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* ── Добавить этап ── */}
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
