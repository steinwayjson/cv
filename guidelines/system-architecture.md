# System Architecture

## Overview

Система для поиска работы: парсинг вакансий, анализ, скоринг, генерация сопроводительных писем.

## Components

1. **TG Parser** (tg-parser/) — парсит TG-каналы, ищет вакансии
2. **Bot** (bot/) — TG-бот для ручного добавления вакансий, управления статусами
3. **CRM** (crm/) — React-панель управления вакансиями
4. **n8n** — автоматизация: вызов AI-агентов (промпты через CRM)

## Tech Stack

- **Frontend**: React 19, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + REST API)
- **Bot**: Node.js + Telegraf
- **Parser**: Node.js
- **AI**: DeepSeek / LLM (через API)
- **Auth**: Supabase Auth (anon key + RLS)

## Data Flow

```
TG Channels → Parser → raw_vacancies → AI Parser → vacancies
HF Vacancies → Bot → vacancies
CRM ←→ Supabase ←→ n8n ←→ AI Agents
```

## Vacancy Lifecycle

### Business Funnel (6 statuses)
```
new → sent → replied → interview → offer → closed
```

### Technical Pipeline (RawVacancy)
```
new → processing → done | error | skipped
```

### Agent Pipeline
```
RawVacancy → [Parser] → Vacancy → [Analyzer] → [Scoring] → [Copywriter]
```

## Key Design Decisions

1. **6 canonical statuses** — единый набор для всех систем (CRM, Bot, n8n). Никаких дополнительных кастомных статусов в lifecycle. PipelineStage (UI-воронка) отделён от статусов.
2. **PipelineStage** — UI-слой, не влияет на lifecycle. Этапы могут переименовываться, добавляться source-specific оверрайды, но base_key всегда ссылается на один из 6 canonical.
3. **Source-specific pipeline** — каждый источник (HH, TG, LinkedIn) может иметь свою воронку (свои названия этапов), но они отображаются на те же 6 canonical статусов.
4. **Terminal state** — только `closed`. Все старые terminal-алиасы (`rejected`, `archive`) маппятся в `closed`.
5. **last_stage** — сохраняется только при переходе в `closed`. Позволяет вернуться к предыдущему статусу (reopen).
6. **Mock mode** — если нет Supabase credentials, CRM работает с моками.

## Routing

```
/ → Dashboard (список вакансий)
/vacancy/:id → Детали вакансии (три вкладки: Info, Actions, Prompts)
/settings → Настройки (профиль, агенты, pipeline editor)
```

## Prompts & Versions

- Каждый AI-агент имеет набор промптов с версионированием
- Версии управляются через CRM
- n8n использует активную версию промпта

## Pipeline Editor

- Drag & drop для переупорядочивания этапов
- Source-specific вкладки (HH, TG, LinkedIn, ...)
- Базовые этапы (6 штук) нельзя удалить, но можно переименовать на вкладке "По умолчанию"
- Base key привязывает этап к canonical статусу
