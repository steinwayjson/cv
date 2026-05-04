-- =========================================================
-- Migration 001: per-source pipeline + agent_configs
-- Выполнить в Supabase → SQL Editor
-- =========================================================

-- 1. Добавить поле source в pipeline_stages
-- NULL = дефолтная воронка (для дашборда и если у источника нет своей)
-- 'HH' / 'TG' / 'LinkedIn' / 'Сайт' = воронка для конкретного источника
ALTER TABLE pipeline_stages
  ADD COLUMN IF NOT EXISTS source text DEFAULT NULL;

-- 2. Таблица конфигов агентов
-- Хранит системный промт и параметры для каждого агента цепочки
CREATE TABLE IF NOT EXISTS agent_configs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        UNIQUE NOT NULL,
  system_prompt text      NOT NULL DEFAULT '',
  params      jsonb       NOT NULL DEFAULT '{}',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. Seed — пустой конфиг скорера
INSERT INTO agent_configs (name, system_prompt, params)
VALUES (
  'scorer',
  '',
  '{"min_salary": 0, "work_formats": [], "stop_words": []}'
) ON CONFLICT (name) DO NOTHING;
