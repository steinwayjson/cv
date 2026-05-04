# Analytics Spec — Проект WORK

> Последнее обновление: апрель 2026  
> Владелец: Андрей Михайличенко  
> Сайт: andrey-mikhaylichenko.ru

---

## Цель проекта

Конверсия HR / owner / ЛПР в контакт, собеседование и оффер.

---

## Метрики

| Уровень | Метрика | Описание |
|---|---|---|
| Главная | `contact_clicked` | HR нажал на контакт |
| Вторичная | `case_opened` | HR дошёл до кейсов |
| Итоговая | `offer_received` | Оффер получен (фиксируется вручную) |

---

## Воронка

```
pageview
    ↓
case_opened
    ↓
contact_clicked
    ↓
hr_replied          ← фиксируется через n8n / вручную
    ↓
interview_scheduled ← фиксируется через n8n / вручную
    ↓
offer_received      ← фиксируется вручную
```

---

## События

### `pageview`
Автоматически, Posthog из коробки.

| Свойство | Тип | Пример |
|---|---|---|
| `utm_source` | string | `hh`, `telegram`, `outreach` |
| `utm_medium` | string | `cpc`, `social`, `manual` |
| `utm_campaign` | string | `spring_2026` |
| `referrer` | string | `hh.ru` |

---

### `case_opened`
Срабатывает когда HR открывает кейс.

| Свойство | Тип | Пример |
|---|---|---|
| `case_name` | string | `revilal`, `meesoterics`, `msk` |
| `time_on_page` | number | `45` (секунды) |

---

### `contact_clicked`
Срабатывает при клике на любой контакт.

| Свойство | Тип | Пример |
|---|---|---|
| `contact_type` | string | `telegram`, `email`, `phone` |

---

### `cv_downloaded`
Срабатывает при скачивании резюме.

| Свойство | Тип | Пример |
|---|---|---|
| `source` | string | `main_page`, `case_page` |

---

### `scroll_depth`
Срабатывает при достижении глубины скролла.

| Свойство | Тип | Пример |
|---|---|---|
| `depth` | number | `50`, `90` |

---

## Сегменты

| Сегмент | Условие |
|---|---|
| HH | `utm_source = hh` |
| Аутрич | `utm_source = outreach` |
| Telegram | `utm_source = telegram` |
| Органика | UTM отсутствует |

---

## Определение конверсии

`contact_clicked` после `case_opened` в рамках одной сессии.

---

## Триггеры n8n

| Событие | Действие |
|---|---|
| `contact_clicked` | Уведомление Андрею в Telegram |
| `case_opened` без `contact_clicked` за 24ч | Пометить как "не дошёл" |
| `hr_replied` | Обновить статус контакта в таблице |
| `interview_scheduled` | Напоминание за день до встречи |

---

## Примечания

- События `hr_replied`, `interview_scheduled`, `offer_received` происходят вне сайта — фиксируются через n8n-бот или вручную в таблице
- Все события реализованы через обёртку `src/lib/analytics.ts` (SSR-защита)
- UTM-метки обязательны для всех внешних ссылок на сайт
