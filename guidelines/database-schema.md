# Database Schema

## Vacancies

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| company_id | uuid | FK → companies |
| link | text | Ссылка на вакансию |
| role | text | Название вакансии |
| salary | text | Зарплатная вилка |
| **status** | text | **Бизнес-воронка: new / sent / replied / interview / offer / closed** |
| last_stage | text | Предыдущий статус (для closed) |
| closed_reason | text | Причина закрытия (rejected_by_me, rejected_by_company, ghosted, low_salary, irrelevant, spam, duplicate) |
| source | text | HH / TG / LinkedIn / Сайт / ... |
| notes | text | Заметки |
| next_action | text | Следующий шаг |
| next_action_at | timestamptz | Дата напоминания |
| published_at | timestamptz | Дата публикации |
| priority | text | high / medium / low |
| score | int | Оценка скоринга |
| category | text | горячая / норм / мимо |
| reason | text | Причина оценки |
| parser_prompt_version | int | Версия промпта парсера |
| parsed_at | timestamptz | Дата парсинга |
| analyzer_prompt_version | int | Версия промпта анализатора |
| analyzed_at | timestamptz | Дата анализа |
| scoring_prompt_version | int | Версия промпта скоринга |
| scored_at | timestamptz | Дата скоринга |
| copywriter_prompt_version | int | Версия промпта копирайтера |
| copywritten_at | timestamptz | Дата генерации письма |
| pipeline_stage_id | uuid | FK → pipeline_stages |

## Vacancy Statuses

**Бизнес-воронка (6 статусов):**

```
new → sent → replied → interview → offer → closed
```

- **new** — новая вакансия
- **sent** — отклик отправлен
- **replied** — ответ получен
- **interview** — собеседование
- **offer** — оффер
- **closed** — терминальный статус (закрыто/отказ)

**Алиасы (обратная совместимость):**
- `sobes` → `interview`
- `meeting` → `interview`
- `rejected` → `closed`
- `archive` → `closed`
- `done` → `new`

**Technical Pipeline (RawVacancy):**
- `new` → `processing` → `done` / `error` / `skipped`

## Pipeline Stages

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| name | text | Название этапа |
| color | text | Цвет (hex) |
| order_index | int | Порядок сортировки |
| source | text | Источник (null = дефолт) |
| is_base | bool | Базовый этап (можно ли удалить) |
| base_key | text | Ключ из 6 базовых (new/sent/replied/interview/offer/closed) |

## Raw Vacancies

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| source | text | tg / agg / manual |
| tg_message_id | int | ID сообщения в TG |
| channel_username | text | Username канала |
| raw_text | text | Исходный текст |
| post_url | text | Ссылка на пост |
| posted_at | timestamptz | Дата поста |
| created_at | timestamptz | Дата создания |
| status | text | pipeline: new / processing / done / error / skipped |

## Analysis Log

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| vacancy_id | uuid | FK → vacancies |
| agent | text | parser / analyzer / scoring / copywriter |
| prompt_key | text | Ключ промпта |
| prompt_version | int | Версия промпта |
| input | jsonb | Входные данные |
| raw_output | text | Сырой вывод |
| parsed_output | jsonb | Распарсенный вывод |
| model | text | Модель |
| error | text | Ошибка |

## Prompts

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| key | text | profile / parser / analyzer / scoring / copywriter |
| version | int | Версия |
| name | text | Название |
| content | text | Содержимое промпта |
| description | text | Описание |
| is_active | bool | Активная версия |
| created_at | timestamptz | Дата создания |
| updated_at | timestamptz | Дата обновления |

## Other Tables

- **companies** — компании-работодатели
- **vacancy_analysis** — результаты анализа
- **profile** — профиль кандидата
- **agent_configs** — конфигурации агентов
- **sessions** — сессии TG-бота
- **tg_channels** — TG-каналы для парсинга
- **parser_runs** — логи запусков парсера
