# Supabase DB Schema

Проект: `xwdqovnhkeesxhntseat.supabase.co`  
URL: `https://xwdqovnhkeesxhntseat.supabase.co`

---

## Table `companies`

Компании-работодатели.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `created_at` | `timestamptz` | |
| `name` | `text` | |
| `site` | `text` | |
| `branch` | `text` | Отрасль |
| `size` | `text` | Размер компании |
| `context` | `text` | Контекст для агента |
| `resource` | `text` | |

---

## Table `vacancies`

Вакансии. FK: `company_id → companies.id`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `published_at` | `timestamptz` | Дата публикации (НЕ created_at!) |
| `sent_at` | `text` | |
| `link` | `text` | UNIQUE |
| `role` | `text` | Название вакансии |
| `about` | `text` | Описание вакансии |
| `salary` | `text` | |
| `status` | `text` | `new / sent / replied / interview / rejected / offer` |
| `utm` | `text` | |
| `source` | `text` | Источник: HH / TG / LinkedIn / Сайт |
| `source_type` | `text` | Тип источника (доп. классификация) |
| `company_id` | `uuid` | FK → companies.id |
| `priority` | `text` | Приоритет (горячая / норм / мимо) |
| `notes` | `text` | Заметки |
| `next_action` | `text` | Следующий шаг |
| `next_action_at` | `timestamptz` | Когда сделать |

> **Важно**: сортировка по `published_at`, не `created_at`. Колонки `created_at` нет.

---

## Table `vacancy_analysis`

Результат работы агента-скорера. FK: `vacancy_id → vacancies.id`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `created_at` | `timestamptz` | |
| `vacancy_id` | `uuid` | FK → vacancies.id |
| `score` | `int4` | 0–100 |
| `category` | `text` | горячая / норм / мимо |
| `reason` | `text` | Объяснение оценки |
| `letter` | `text` | Сгенерированное письмо |
| `letter_edited` | `text` | Отредактированное письмо |
| `model` | `text` | Модель Claude |
| `site_content` | `text` | Контент сайта компании |
| `feedback` | `text` | Обратная связь по письму |

> Таблица заполняется n8n-агентом. Пустая пока агент не запущен.

---

## Table `contacts`

HR/владельцы компаний.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `created_at` | `timestamptz` | |
| `company_id` | `uuid` | FK → companies.id |
| `name` | `text` | |
| `role` | `text` | Должность |
| `email` | `text` | |
| `linkedin` | `text` | |
| `telegram` | `text` | |
| `max` | `text` | |
| `source` | `text` | Откуда контакт |

---

## Table `messages`

Отправленные письма/сообщения.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `created_at` | `timestamptz` | |
| `vacancy_id` | `uuid` | FK → vacancies.id |
| `contact_id` | `uuid` | FK → contacts.id |
| `channel` | `text` | email / telegram / linkedin |
| `message_text` | `text` | |
| `utm` | `text` | UTM-метка |
| `sent_at` | `timestamptz` | |
| `status` | `text` | |
| `replied_at` | `timestamptz` | |

---

## Table `pipeline_stages`

Этапы воронки. `source = NULL` = дефолтная воронка; `source = 'HH'` = воронка для конкретного источника.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `name` | `text` | |
| `color` | `text` | HEX |
| `order_index` | `int4` | Порядок сортировки |
| `source` | `text` | NULL = дефолт; 'HH'/'TG'/етц = per-source |
| `is_active` | `bool` | |

---

## Table `agent_configs`

Конфиги AI-агентов (системный промт + параметры). Сейчас есть одна запись: `name = 'scorer'`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `name` | `text` | UNIQUE; 'scorer' — агент-скорер |
| `system_prompt` | `text` | Полный системный промт для Claude |
| `params` | `jsonb` | `{min_salary, work_formats, stop_words}` |
| `updated_at` | `timestamptz` | |

> **n8n** читает `agent_configs` перед каждым вызовом Claude — промт всегда актуален.

---

## Table `profile`

Профиль кандидата (одна строка).

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `created_at` | `timestamptz` | |
| `content` | `text` | Текст профиля для AI-агента |

> **Важно**: колонка называется `content`, НЕ `text`. Колонок `min_salary`, `work_formats`, `stop_words` нет.

---

## Table `sessions`

Telegram-бот сессии.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `created_at` | `timestamptz` | |
| `chat_id` | `int8` | |
| `step` | `varchar` | |
| `vacancy_link` | `text` | |
| `site` | `text` | |
| `vacancy_text` | `text` | |
| `company_text` | `text` | |
| `updated_at` | `timestamptz` | |
| `last_update_id` | `int8` | |

---

## Связи

```
companies (1) ──< vacancies (N)
companies (1) ──< contacts (N)
vacancies (1) ──< vacancy_analysis (1)
vacancies (1) ──< messages (N)
contacts  (1) ──< messages (N)
```

## RLS

Все таблицы — политика `auth.uid() is not null` (только для авторизованных пользователей).
