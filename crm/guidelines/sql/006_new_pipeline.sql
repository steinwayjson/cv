-- ═══════════════════════════════════════════════════════════════════════════════
-- Миграция: Новая воронка — 6 базовых этапов + is_base/base_key колонки
-- Дата: 2026-05-12
-- Описание:
--   - Добавлены колонки is_base, base_key в pipeline_stages
--   - Создание 6 базовых этапов с is_base=true (source = null)
--   - Установка base_key для source-specific этапов, которые соответствуют базовым
--   - Базовые этапы: new, sent, replied, sobes, meeting, closed
-- ═══════════════════════════════════════════════════════════════════════════════

-- Шаг 1: Добавляем колонки
alter table pipeline_stages
add column if not exists is_base boolean default false;

alter table pipeline_stages
add column if not exists base_key text;

-- Шаг 2: Помечаем базовые этапы в дефолтной воронке (source IS NULL)
update pipeline_stages
set is_base = true,
    base_key = case
        when lower(name) = 'новые'         then 'new'
        when lower(name) = 'отправлено'    then 'sent'
        when lower(name) = 'ответ получен' then 'replied'
        when lower(name) = 'собеседование' then 'sobes'
        when lower(name) = 'встреча'       then 'meeting'
        when lower(name) = 'закрыто'       then 'closed'
    end
where source is null
  and lower(name) in ('новые', 'отправлено', 'ответ получен', 'собеседование', 'встреча', 'закрыто')
  and is_base = false;

-- Шаг 3: Создаём недостающие базовые этапы в дефолтной воронке (если их нет)
insert into pipeline_stages (name, color, order_index, source, is_base, base_key)
select 'Новые',         '#6B7280', 0, null, true, 'new'
where not exists (select 1 from pipeline_stages where source is null and base_key = 'new');

insert into pipeline_stages (name, color, order_index, source, is_base, base_key)
select 'Отправлено',    '#3B82F6', 1, null, true, 'sent'
where not exists (select 1 from pipeline_stages where source is null and base_key = 'sent');

insert into pipeline_stages (name, color, order_index, source, is_base, base_key)
select 'Ответ получен', '#EAB308', 2, null, true, 'replied'
where not exists (select 1 from pipeline_stages where source is null and base_key = 'replied');

insert into pipeline_stages (name, color, order_index, source, is_base, base_key)
select 'Собеседование', '#8B5CF6', 3, null, true, 'sobes'
where not exists (select 1 from pipeline_stages where source is null and base_key = 'sobes');

insert into pipeline_stages (name, color, order_index, source, is_base, base_key)
select 'Встреча',       '#22C55E', 4, null, true, 'meeting'
where not exists (select 1 from pipeline_stages where source is null and base_key = 'meeting');

insert into pipeline_stages (name, color, order_index, source, is_base, base_key)
select 'Закрыто',       '#EF4444', 5, null, true, 'closed'
where not exists (select 1 from pipeline_stages where source is null and base_key = 'closed');

-- Шаг 4: Для source-specific этапов сопоставляем base_key по имени
update pipeline_stages
set base_key = 'new'
where source is not null
  and lower(name) = 'новые'
  and base_key is null;

update pipeline_stages
set base_key = 'sent'
where source is not null
  and lower(name) = 'отправлено'
  and base_key is null;

update pipeline_stages
set base_key = 'replied'
where source is not null
  and lower(name) in ('ответ получен', 'ответ hr', 'ответили')
  and base_key is null;

update pipeline_stages
set base_key = 'sobes'
where source is not null
  and lower(name) = 'собеседование'
  and base_key is null;

update pipeline_stages
set base_key = 'meeting'
where source is not null
  and lower(name) in ('встреча', 'интервью')
  and base_key is null;

update pipeline_stages
set base_key = 'closed'
where source is not null
  and lower(name) = 'закрыто'
  and base_key is null;

-- Шаг 5: Мигрируем старые interview → meeting в вакансиях
update vacancies
set status = 'meeting'
where status = 'interview';

-- Шаг 6: Мигрируем старые offer → closed + 'offer' reason
update vacancies
set status = 'closed', closed_reason = 'offer'
where status = 'offer';

-- Шаг 7: Удаляем дублирующиеся этапы в source-specific, если они есть
-- (например старый 'Интервью' или 'Оффер')
delete from pipeline_stages
where source is not null
  and lower(name) in ('интервью', 'оффер', 'offer')
  and base_key is null;
