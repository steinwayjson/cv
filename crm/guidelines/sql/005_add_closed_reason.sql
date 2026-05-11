-- ═══════════════════════════════════════════════════════════════════════════════
-- Миграция: Добавление closed_reason в vacancies
-- Дата: 2026-05-11
-- Описание:
--   - Новая колонка closed_reason для детальной причины закрытия вакансии
--   - Миграция старых rejected → closed (с null closed_reason)
--   - Индекс для аналитики
-- ═══════════════════════════════════════════════════════════════════════════════

-- Шаг 1: Добавляем колонку
alter table vacancies
add column closed_reason text;

-- Шаг 2: Мигрируем старые rejected → closed
-- Старые вакансии получают closed_reason = null (общая причина неизвестна)
update vacancies
set status = 'closed'
where status = 'rejected';

-- Шаг 3: Индекс для быстрой группировки по причинам
create index if not exists vacancies_closed_reason_idx
on vacancies(closed_reason);

-- Шаг 4: Обновляем индекс статуса (он уже есть, но на всякий случай)
create index if not exists vacancies_status_idx
on vacancies(status);
