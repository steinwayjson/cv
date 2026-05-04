# CLAUDE.md — Проект WORK

## Кто я
Андрей Михайличенко, digital-маркетолог с техническим уклоном.
Сайт: andrey-mikhaylichenko.ru · Цель: оффер 150-200к на growth/product

## Что строим
Агентная система автоматизированного найма себя как продукта.
Полная архитектура: `guidelines/system-architecture.md`

## Стек
- **Сайт:** React + Яндекс Object Storage
- **Аналитика:** Posthog + Яндекс.Метрика
- **БД:** Supabase (companies / vacancies / contacts / messages)
- **Автоматизация:** n8n на Amvera Cloud
- **Агенты:** Claude API
- **Управление:** Telegram-бот

## Папки в монорепо
- `bot/` — YC Function `work-bot`: Telegram-бот, webhook, ручной flow с HH (подтверждение писем через Telegram)
- `tg-parser/` — YC Function `work-parser`: парсинг публичных Telegram-каналов с вакансиями (timer-триггер, раз в день)
- `crm/` — React-приложение, CRM-дашборд
- `src/` — портфолио-сайт andrey-mikhaylichenko.ru

## Поток данных
```
Вакансия (HH) → n8n → Supabase → Агент-копирайтер → Telegram → Отправка → Posthog трекает переход
Tg-каналы → tg-parser → n8n → Claude скоринг → Supabase vacancies
```

## Таблицы БД
- `companies` — компании (name, site, branch, size, context, resource)
- `vacancies` — вакансии (company_id, link, role, about, salary, status, utm)
- `contacts` — контакты HR/owner (company_id, name, role, telegram, email)
- `messages` — письма (vacancy_id, contact_id, channel, message_text, utm, status)

## Агенты
1. **HH-парсер** — ссылка → данные в Supabase
2. **Копирайтер** — вакансия + контекст → письмо на подтверждение
3. **Аналитик** — данные Posthog → инсайты
4. **Советник** — инсайты → правки сайта
5. **Аутрич** — отправка + трекинг статусов

## Правила
- Все письма через подтверждение в Telegram — не автоматически
- UTM обязателен в каждом письме
- Статусы вакансий: new / sent / replied / interview / rejected / offer
- Аналитика: `src/lib/analytics.ts` (SSR-защита через window check)
