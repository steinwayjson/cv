-- Миграция: приведение статусов к каноническому набору
-- (6 статусов: new, sent, replied, interview, offer, closed)
-- Все старые/алиасные статусы маппятся:
--   meeting → interview
--   rejected → closed
--   archive → closed
--   done → new
--   sobes → interview

-- 1. Обновление статусов в vacancies
UPDATE vacancies
SET status = 'interview'
WHERE status IN ('meeting', 'sobes');

UPDATE vacancies
SET status = 'closed'
WHERE status IN ('rejected', 'archive');

UPDATE vacancies
SET status = 'new'
WHERE status = 'done';

-- 2. Обновление last_stage (если там были старые статусы)
UPDATE vacancies
SET last_stage = 'interview'
WHERE last_stage IN ('meeting', 'sobes');

UPDATE vacancies
SET last_stage = 'closed'
WHERE last_stage IN ('rejected', 'archive');

UPDATE vacancies
SET last_stage = 'new'
WHERE last_stage = 'done';

-- 3. Добавление constraint на статусы (опционально — после чистки данных)
-- ALTER TABLE vacancies ADD CONSTRAINT vacancies_status_check
--   CHECK (status IN ('new', 'sent', 'replied', 'interview', 'offer', 'closed'));

-- 4. Обновление pipeline_stages: меняем 'Встреча' на 'Оффер' и 'meeting' на 'offer'
UPDATE pipeline_stages
SET name = 'Оффер', base_key = 'offer', color = '#10B981'
WHERE base_key = 'meeting';

-- 5. Удаляем лишние базовые ключи (rejected, archive — их больше нет)
DELETE FROM pipeline_stages
WHERE base_key IN ('rejected', 'archive');

-- 6. Добавляем offer если его нет (создаём новый базовый этап)
INSERT INTO pipeline_stages (name, color, order_index, source, is_base, base_key)
SELECT 'Оффер', '#10B981', 5, NULL, true, 'offer'
WHERE NOT EXISTS (
  SELECT 1 FROM pipeline_stages WHERE base_key = 'offer'
);
