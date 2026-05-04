# Схема Базы Данных

Последнее обновление: 2026-04-29

Этот документ — основной источник правды по базе данных CRM в Supabase. Его нужно обновлять при каждой миграции схемы и при каждом изменении n8n workflow, если workflow читает или записывает поля в базе.

## Устройство Системы

Система переносит вакансии из Telegram/n8n в Supabase, оценивает их через LLM-агентов, генерирует письма для отклика и показывает результат в React CRM.

Основной поток:

1. Telegram-бот собирает входные данные по вакансии.
2. Бот отправляет payload в n8n.
3. n8n парсит вакансию, создаёт или обновляет `companies` и `vacancies`.
4. n8n читает активные промпты из `prompts`.
5. LLM-агенты анализируют, скорят и генерируют письма.
6. n8n записывает текущее состояние в `vacancies` и каждый прогон в `analysis_log`.
7. CRM читает Supabase и даёт управлять статусами, заметками, промптами и этапами воронки.

## Таблицы

### `companies`

Справочник компаний/работодателей.

Поля:

| Поле | Тип | Назначение |
| --- | --- | --- |
| `id` | `uuid` | Первичный ключ |
| `created_at` | `timestamptz` | Время создания |
| `name` | `text` | Название компании |
| `site` | `text` | Сайт компании |
| `branch` | `text` | Индустрия/ниша |
| `size` | `text` | Размер компании |
| `size_comment` | `text` | Как был определён размер |
| `stage` | `text` | Стартап/рост/зрелая/корпорация и т.п. |
| `context` | `text` | Дополнительный контекст о компании |
| `resource` | `text` | Источник данных о компании |

Связи:

- `vacancies.company_id -> companies.id`
- `contacts.company_id -> companies.id`

### `vacancies`

Главная сущность CRM. Хранит текущее нормализованное состояние вакансии и текущие результаты агентов.

Поля:

| Поле | Тип | Назначение |
| --- | --- | --- |
| `id` | `uuid` | Первичный ключ |
| `published_at` | `timestamptz` | Время публикации/импорта вакансии |
| `sent_at` | `timestamptz` | Время отправки отклика |
| `link` | `text` | Исходная ссылка на вакансию |
| `role` | `text` | Название вакансии |
| `about` | `text` | Краткое нормализованное описание роли |
| `salary` | `text` | Нормализованная зарплата |
| `salary_raw` | `text` | Зарплата как в исходнике |
| `salary_comment` | `text` | Интерпретация зарплаты |
| `format` | `text` | Удалёнка/офис/гибрид и т.п. |
| `city` | `text` | Город/локация |
| `experience` | `text` | Требуемый опыт |
| `employment` | `text` | Тип занятости |
| `hard_skills` | `jsonb` | Требуемые инструменты/навыки |
| `soft_skills` | `jsonb` | Soft skills |
| `relocation` | `text` | Требования по релокации |
| `visa_support` | `text` | Информация о визовой поддержке |
| `status` | `text` | Текущий статус в CRM |
| `last_stage` | `text` | Последний этап воронки перед отказом |
| `source` | `text` | Источник, например `hh`, `tg`, `outreach` |
| `source_type` | `text` | Тип источника, например `inbound` |
| `utm` | `text` | UTM-метки |
| `priority` | `text` | Приоритет/категория |
| `notes` | `text` | Заметки пользователя |
| `next_action` | `text` | Следующее действие |
| `next_action_at` | `timestamptz` | Дата следующего действия |
| `company_id` | `uuid` | FK на `companies` |
| `parser_prompt_version` | `int` | Версия промпта парсера, использованная для текущих структурированных полей вакансии |
| `parsed_at` | `timestamptz` | Время последнего парсинга вакансии |
| `analyzer_prompt_version` | `int` | Версия промпта аналитика, использованная для текущих полей вакансии |
| `analyzed_at` | `timestamptz` | Время последнего прогона аналитика |
| `score` | `numeric` | Текущая оценка скоринга, которую показывает CRM |
| `category` | `text` | Текущая категория скоринга |
| `reason` | `text` | Текущее объяснение скоринга |
| `scoring_prompt_version` | `int` | Версия промпта скоринга, использованная для текущей оценки |
| `scored_at` | `timestamptz` | Время последнего скоринга |
| `copywriter_prompt_version` | `int` | Версия промпта копирайтера, использованная для текущего письма |
| `copywritten_at` | `timestamptz` | Время последней генерации письма |

CRM читает текущие `score`, `category`, `reason` из `vacancies`. `analysis_log` хранит все версии прогонов scoring/analyzer/copywriter. `vacancy_analysis` остаётся для текущих длинных артефактов, например письма и ручной правки.

### `vacancy_analysis`

Legacy/current денормализованная таблица результатов агентов, которую сейчас использует CRM.

Поля:

| Поле | Тип | Назначение |
| --- | --- | --- |
| `id` | `uuid` | Первичный ключ |
| `created_at` | `timestamptz` | Время создания |
| `vacancy_id` | `uuid` | Ссылка на `vacancies` |
| `score` | numeric/int | Текущая оценка |
| `category` | `text` | Категория hot/normal/skip |
| `reason` | `text` | Объяснение скоринга |
| `letter` | `text` | Сгенерированное письмо |
| `letter_edited` | `text` | Письмо после ручной правки |
| `model` | `text` | Использованная модель |
| `site_content` | `text` | Полученный контент сайта компании |
| `feedback` | `text` | Обратная связь пользователя/системы |
| `version` | numeric/int | Legacy-маркер версии |

Статус: оставить для совместимости и текущих длинных артефактов. `score`, `category`, `reason` в этой таблице legacy; источник правды для текущего скоринга теперь `vacancies`. Версии писем и скоринга хранятся в `analysis_log`.

### `prompts`

Версионируемое хранилище промптов.

Поля:

| Поле | Тип | Назначение |
| --- | --- | --- |
| `id` | `uuid` | Первичный ключ |
| `key` | `text` | Ключ промпта: `parser`, `analyzer`, `scoring`, `copywriter`, `profile` |
| `version` | `int` | Номер версии внутри `key` |
| `name` | `text` | Человекочитаемое название |
| `content` | `text` | Тело промпта |
| `description` | `text` | Changelog/описание версии |
| `is_active` | `boolean` | Флаг текущей активной версии |
| `created_at` | `timestamptz` | Время создания версии |
| `updated_at` | `timestamptz` | Время последнего обновления |

Правила:

- Ровно одна активная строка на каждый `key`.
- Нельзя перезаписывать старую историю промптов при смысловых изменениях.
- Новое смысловое изменение = новая строка с `version = max(version) + 1`, старая строка получает `is_active = false`.
- Мелкие исправления опечаток можно вносить в текущую активную строку, если они не меняют поведение.

Вспомогательная функция:

- `create_prompt_version(p_key, p_name, p_content, p_description)` создаёт следующую активную версию и деактивирует предыдущую.
- `activate_prompt_version(p_key, p_version)` переключает активную версию без создания новой строки.

### `analysis_log`

Почти неизменяемый лог каждого прогона LLM-агента.

Поля:

| Поле | Тип | Назначение |
| --- | --- | --- |
| `id` | `uuid` | Первичный ключ |
| `created_at` | `timestamptz` | Время прогона |
| `vacancy_id` | `uuid` | Связанная вакансия, может быть `null` |
| `agent` | `text` | `analyzer`, `scoring`, `copywriter` |
| `prompt_key` | `text` | Использованный ключ промпта |
| `prompt_version` | `int` | Использованная версия промпта |
| `input` | `jsonb` | Входные данные, отправленные агенту |
| `raw_output` | `text` | Сырой ответ LLM |
| `parsed_output` | `jsonb` | Распарсенный результат |
| `model` | `text` | Название модели |
| `error` | `text` | Текст ошибки, если прогон завершился неудачно |

Правила:

- Вставлять строку для каждого прогона, успешного или неуспешного.
- Не использовать эту таблицу как основное живое состояние CRM.
- Использовать для аудита, сравнения, повторной обработки и отката.

### `pipeline_stages`

Настраиваемые этапы воронки.

Поля:

| Поле | Тип | Назначение |
| --- | --- | --- |
| `id` | `uuid` | Первичный ключ |
| `name` | `text` | Название этапа |
| `color` | `text` | HEX-цвет для UI |
| `order_index` | `int4` | Порядок отображения |
| `is_active` | `boolean` | Флаг видимости/активности |
| `source` | `text` | Опциональные этапы для конкретного источника |

Правила:

- `source is null` = воронка по умолчанию.
- Значения `source` должны быть нормализованы в нижний регистр: `hh`, `tg`, `linkedin`, `site`, `outreach`.
- Не допускать дублей для одного `(source, order_index)`.

### `sessions`

Состояние wizard-сценария Telegram-бота.

Поля:

| Поле | Тип | Назначение |
| --- | --- | --- |
| `id` | `uuid` | Первичный ключ |
| `created_at` | `timestamptz` | Время создания |
| `chat_id` | numeric/bigint | Telegram chat/user id |
| `step` | `text` | Текущий шаг wizard |
| `vacancy_link` | `text` | Введённая ссылка на вакансию |
| `site` | `text` | Сайт компании |
| `vacancy_text` | `text` | Исходный текст вакансии |
| `company_text` | `text` | Исходный текст о компании |
| `updated_at` | `timestamptz` | Время последнего обновления wizard |
| `last_update_id` | numeric/int | Маркер дедупликации Telegram |

Правила:

- `chat_id` должен быть уникальным.
- Старые сессии можно безопасно удалять после устаревания.

### `agent_configs`

Runtime-настройки агентов, которые не являются текстом промпта.

Поля:

| Поле | Тип | Назначение |
| --- | --- | --- |
| `id` | `uuid` | Первичный ключ |
| `name` | `text` | Ключ конфига, сейчас `scorer` |
| `system_prompt` | `text` | Legacy/опциональный system prompt |
| `params` | `jsonb` | Структурированные параметры, например минимальная зарплата |
| `updated_at` | `timestamptz` | Время последнего обновления |

### `contacts`

Таблица контактов для outreach. Сейчас пустая, оставлена под будущий outreach.

Поля:

| Поле | Тип | Назначение |
| --- | --- | --- |
| `id` | `uuid` | Первичный ключ |
| `created_at` | `timestamptz` | Время создания |
| `company_id` | `uuid` | FK на `companies` |
| `name` | `text` | Имя контакта |
| `role` | `text` | Роль контакта |
| `email` | `text` | Email |
| `linkedin` | `text` | LinkedIn URL |
| `telegram` | `text` | Telegram handle |
| `max` | unknown/text | Существующее поле; уточнить перед использованием |
| `source` | `text` | Источник контакта |

### `messages`

Таблица отслеживания outreach-сообщений. Сейчас пустая, оставлена под будущий outreach.

Поля:

| Поле | Тип | Назначение |
| --- | --- | --- |
| `id` | `uuid` | Первичный ключ |
| `created_at` | `timestamptz` | Время создания |
| `vacancy_id` | `uuid` | Связанная вакансия |
| `contact_id` | `uuid` | Связанный контакт |
| `channel` | `text` | Канал сообщения |
| `message_text` | `text` | Текст сообщения |
| `utm` | `text` | UTM-метки |
| `sent_at` | `timestamptz` | Время отправки |
| `status` | `text` | Статус сообщения |
| `replied_at` | `timestamptz` | Время ответа |

### `tg_channels`

Список Telegram-каналов для парсера. Сейчас не используется CRM после отката парсера.

Поля:

| Поле | Тип | Назначение |
| --- | --- | --- |
| `id` | `uuid` | Первичный ключ |
| `username` | `text` | Username канала |
| `title` | `text` | Отображаемое название |
| `is_active` | `boolean` | Флаг активности парсера |
| `last_post_id` | numeric/int | Последний обработанный пост |
| `created_at` | `timestamptz` | Время создания |

Статус: оставить только если Telegram-парсер возвращается. Иначе позже можно архивировать.

## Deprecated / Removed

### `profile`

Удалена. Профиль кандидата теперь живёт в строке `prompts.key = 'profile'`.

### `parser_runs`

CRM-код раньше ссылался на `parser_runs`, но таблица не входит в текущую схему. Не возвращать её, пока парсер не будет пересобран заново.

## Важные Индексы И Constraints

Ожидаемые constraints и индексы:

```sql
alter table prompts
  drop constraint if exists prompts_key_key;

drop index if exists prompts_key_key;

create unique index if not exists prompts_key_version_uidx
  on prompts(key, version);

create unique index if not exists prompts_active_key_uidx
  on prompts(key)
  where is_active = true;

create unique index if not exists sessions_chat_id_uidx
  on sessions(chat_id);

create index if not exists analysis_log_vacancy_idx
  on analysis_log(vacancy_id);

create index if not exists analysis_log_agent_version_idx
  on analysis_log(agent, prompt_version);

create index if not exists analysis_log_created_at_idx
  on analysis_log(created_at desc);

create index if not exists analysis_log_vacancy_agent_version_idx
  on analysis_log(vacancy_id, agent, prompt_version desc);

create index if not exists prompts_key_version_desc_idx
  on prompts(key, version desc);

create index if not exists vacancies_published_at_idx
  on vacancies(published_at desc);

create index if not exists vacancies_status_idx
  on vacancies(status);

create index if not exists vacancies_source_idx
  on vacancies(source);

create index if not exists vacancies_score_idx
  on vacancies(score);

create index if not exists vacancies_category_idx
  on vacancies(category);

create index if not exists vacancies_company_id_idx
  on vacancies(company_id);

create index if not exists vacancy_analysis_vacancy_id_idx
  on vacancy_analysis(vacancy_id);

create index if not exists pipeline_stages_source_order_idx
  on pipeline_stages(source, order_index);
```

## Workflow Версионирования Промптов

Чтобы создать новую версию промпта:

```sql
select create_prompt_version(
  'analyzer',
  'Analyzer v2',
  'new prompt content',
  'Describe what changed'
);
```

n8n всегда должен читать:

```sql
select *
from prompts
where key = 'analyzer'
  and is_active = true
limit 1;
```

CRM reanalysis can run with either active prompt versions or a selected version set from the vacancy Versions tab.

Default payload:

```json
{
  "vacancy_ids": ["..."]
}
```

Selected-version payload:

```json
{
  "vacancy_ids": ["..."],
  "prompt_versions": {
    "scoring": 3,
    "analyzer": 2,
    "copywriter": 4
  }
}
```

If `prompt_versions[key]` is present, n8n must load that exact `key + version`. If it is absent, n8n must load `key + is_active = true`. Previous outputs remain available in `analysis_log` for comparison.

После прогона агента:

1. Обновить живое состояние в `vacancies` и/или `vacancy_analysis`.
2. Записать версию промпта в `vacancies.*_prompt_version`.
3. Вставить одну строку в `analysis_log`.

## Backlog На Чистку

Не выполнять без отдельного ревью:

- Нормализовать регистр `pipeline_stages.source` в нижний регистр.
- Удалить дубли этапов воронки по умолчанию.
- Решить, остаётся ли `vacancy_analysis` таблицей текущих результатов или сливается в `vacancies`.
- Решить, становятся ли `contacts/messages` полноценными outreach-таблицами.
- Удалять код/таблицы парсера только если парсер официально убран.

## Правила Изменений

1. Каждое изменение схемы получает SQL-миграцию или задокументированный ручной SQL-блок.
2. Каждая добавленная колонка должна быть отражена в этом документе.
3. Не удалять колонки/таблицы в том же шаге, где добавляется замещающий код.
4. Сначала предпочитать additive-миграции, чистку делать после проверки CRM/n8n/бота.
5. Держать названия полей n8n, типы CRM и этот документ синхронизированными.
