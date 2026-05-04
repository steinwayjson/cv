# WORK CRM — Frontend Guidelines

## Контекст проекта
Персональная CRM для отслеживания поиска работы Андрея Михайличенко.
Один пользователь. Данные из Supabase (прямые запросы, без бэкенда).
URL: work.andrey-mikhaylichenko.ru

## Стек
- React 18 + React Router v6
- Supabase JS client (@supabase/supabase-js)
- Tailwind CSS
- React Query (@tanstack/react-query)
- Supabase Auth (email/password)
- Recharts (графики)
- @dnd-kit (drag & drop в настройках)

## Стиль
Между Linear и Google — чистый, минималистичный, функциональный.
Референсы: Linear, Notion, Google Workspace.
Две темы: светлая и тёмная с переключателем. Хранится в localStorage.

---

## НАВИГАЦИЯ

Одна строка вверху на всех страницах (кроме /login):

```
WORK · [Вакансии] [Аналитика] [Настройки] · [hh↗] [tg↗] [сайт↗] [🔍] [🌙]
```

- WORK — логотип, клик → /dashboard
- Вакансии / Аналитика / Настройки — активный таб подчёркнут акцентным цветом
- hh↗ — открывает hh.ru в новой вкладке
- tg↗ — открывает Telegram (t.me/username)
- сайт↗ — открывает andrey-mikhaylichenko.ru
- 🔍 — поиск появляется inline, ищет по компании и роли
- 🌙 — переключатель темы

На мобиле: WORK слева, гамбургер справа. Меню — bottom sheet снизу.

---

## ЭКРАНЫ

### 1. /login
По центру страницы:
- Логотип WORK крупно
- Подзаголовок "Персональная CRM"
- Input email
- Input password
- Кнопка "Войти"
- После входа → редирект на /dashboard

### 2. /dashboard — Вакансии

#### Метрики (4 карточки в ряд)
```
[Всего вакансий] [Горячих (score 70+)] [Отправлено] [Получено ответов]
```
Каждая: большая цифра + подпись + тренд ↑↓ относительно прошлой недели.

#### Воронка (горизонтальная)
Этапы из таблицы `pipeline_stages` (настраиваемые).
Каждый этап: название + количество вакансий.
Клик → фильтрует таблицу по статусу.
Между этапами — стрелка с % конверсии.

#### Фильтры
```
[Категория ▾] [Статус ▾] [Источник ▾] [Период ▾] [Поиск...] [Сбросить]
```
Все фильтры сохраняются в URL params.

#### Таблица вакансий
Колонки:
1. Score — цветной бейдж
2. Компания
3. Роль
4. Зарплата
5. Статус — dropdown прямо в ячейке
6. Дата — относительная ("2 дня назад")
7. → открыть

Поведение:
- Клик по строке → side panel (десктоп) / /vacancy/:id (мобиль)
- Горячие вакансии — красная левая граница строки
- Сортировка кликом на заголовок
- Пагинация 20 строк
- Skeleton loader при загрузке
- Realtime: новая вакансия появляется без перезагрузки

На мобиле — карточки:
```
🔴 85  Компания
       Роль · Зарплата
       [Статус ▾]          [→]
```

#### Side Panel (десктоп, 480px, выезжает справа)
URL меняется на /dashboard?vacancy=uuid.
Закрытие: крестик / Escape / клик вне панели.

Шапка (фиксированная):
- Компания + ссылка на сайт компании
- Роль
- Score бейдж + категория + зарплата + источник

Три таба:

**[Анализ]**
- Score — горизонтальный прогресс-бар с цветом
- Reason от агента
- Два блока: ✅ Что совпадает / ❌ Что не совпадает
- Кнопка "Переанализировать" → webhook в n8n

**[Письмо]**
- Показываем letter_edited если есть, иначе letter
- Клик на текст → inline редактирование
- Иконка копировать в углу
- Кнопка "Сохранить правки" → пишет в letter_edited
- Плашка "Редактировано" + кнопка вернуть оригинал

**[Действия]**
- Статус — большой dropdown с цветами
- Заметки — textarea, автосохранение через 1.5 секунды
- Следующий шаг — input + datepicker
- Кнопка сохранить шаг
- Внизу: "Удалить вакансию" (серая, с модалкой подтверждения)

### 3. /vacancy/:id (мобиль + прямая ссылка)
Полноэкранная версия side panel.

Шапка:
- ← Назад
- Компания + роль
- Score + категория + зарплата

Три таба идентичны side panel.

### 4. /analytics — Аналитика

#### Воронка детально
```
Добавлено(45) —80%→ Отправлено(36) —25%→ Ответ(9) —33%→ Интервью(3)
```

#### Графики (2x2)
1. Вакансии по времени — линейный график (30 дней)
2. Score distribution — гистограмма (0-39 / 40-69 / 70-100)
3. Конверсия по источнику — таблица (HH / TG / LinkedIn)
4. Топ компаний по score — горизонтальный bar chart топ-10

Переключатель: Неделя | Месяц | Всё время

### 5. /settings — Настройки

#### Профиль кандидата
- Большой textarea с текстом из таблицы `profile`
- Подсказка: "Этот текст использует AI для оценки вакансий"
- Кнопка Сохранить

#### Воронка (pipeline_stages)
- Список этапов с drag & drop
- Inline редактирование названия
- Color picker для цвета этапа
- Кнопка "+ Добавить этап"
- Удаление с подтверждением

#### Параметры скоринга
- Минимальная зарплата (number input)
- Форматы работы (чекбоксы: удалёнка / гибрид / офис)
- Стоп-слова (textarea)
- Кнопка Сохранить

---

## ЦВЕТОВАЯ СХЕМА

### Score бейджи
- 70-100: текст #EF4444, фон #FEF2F2, граница #FECACA
- 40-69: текст #D97706, фон #FFFBEB, граница #FDE68A
- 0-39: текст #6B7280, фон #F9FAFB, граница #E5E7EB

### Статусы
- new: #6B7280 серый
- sent: #3B82F6 синий
- replied: #EAB308 жёлтый
- interview: #22C55E зелёный
- rejected: #EF4444 красный
- offer: #F59E0B золотой

### Категории
- горячая: красный бейдж
- норм: жёлтый бейдж
- мимо: серый бейдж

### Light тема
```
Background:     #FFFFFF
Surface:        #F9FAFB
Border:         #E5E7EB
Text primary:   #111827
Text secondary: #6B7280
Accent:         #2563EB
Hover:          #F3F4F6
```

### Dark тема
```
Background:     #0F172A
Surface:        #1E293B
Border:         #334155
Text primary:   #F1F5F9
Text secondary: #94A3B8
Accent:         #3B82F6
Hover:          #263348
```

---

## SUPABASE ЗАПРОСЫ

### Главный запрос
```javascript
const { data } = await supabase
  .from('vacancies')
  .select(`
    *,
    companies (name, site, branch),
    vacancy_analysis (score, category, reason, letter, letter_edited, model)
  `)
  .order('created_at', { ascending: false })
```

### Обновления
```javascript
// Статус
supabase.from('vacancies').update({ status }).eq('id', id)

// Заметки и следующий шаг
supabase.from('vacancies')
  .update({ notes, next_action, next_action_at })
  .eq('id', id)

// Письмо
supabase.from('vacancy_analysis')
  .update({ letter_edited })
  .eq('vacancy_id', id)
```

### Realtime
```javascript
supabase
  .channel('vacancies')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'vacancies'
  }, callback)
  .subscribe()
```

---

## АРХИТЕКТУРА ФАЙЛОВ

```
src/
  pages/
    Login.jsx
    Dashboard.jsx
    Vacancy.jsx
    Analytics.jsx
    Settings.jsx
  components/
    layout/
      Navbar.jsx
      MobileMenu.jsx
    dashboard/
      MetricsBar.jsx
      Funnel.jsx
      Filters.jsx
      VacancyTable.jsx
      VacancyCard.jsx
      SidePanel.jsx
      tabs/
        AnalysisTab.jsx
        LetterTab.jsx
        ActionsTab.jsx
    analytics/
      FunnelDetailed.jsx
      TimelineChart.jsx
      ScoreChart.jsx
      SourceTable.jsx
    settings/
      ProfileEditor.jsx
      PipelineEditor.jsx
      ScoringSettings.jsx
    ui/
      ScoreBadge.jsx
      StatusDropdown.jsx
      CategoryBadge.jsx
      Toast.jsx
      Modal.jsx
      Skeleton.jsx
  hooks/
    useVacancies.js
    useMetrics.js
    usePipeline.js
    useVacancy.js
  lib/
    supabase.js
    queries.js
  contexts/
    ThemeContext.jsx
    AuthContext.jsx
```

---

## UX ДЕТАЛИ

- Toast при каждом сохранении (успех/ошибка)
- Skeleton loader при загрузке данных
- Пустое состояние с подсказкой
- Escape закрывает side panel
- Фильтры в URL params (можно поделиться ссылкой)
- Realtime обновления
- Автосохранение заметок через 1.5 секунды
- Confirm модалка перед удалением
- Относительные даты ("2 дня назад")
- Мобиль: side panel → полноэкранная страница /vacancy/:id

---

## БАЗА ДАННЫХ — ТАБЛИЦЫ

### vacancies
| Поле | Тип | Редактируется |
|------|-----|---------------|
| id | uuid | ❌ |
| created_at | timestamptz | ❌ |
| company_id | uuid | ❌ |
| link | text | ❌ |
| role | text | ❌ |
| about | text | ❌ |
| salary | text | ❌ |
| source | text | ❌ |
| source_type | text | ❌ |
| status | text | ✅ dropdown |
| priority | text | ✅ |
| notes | text | ✅ textarea |
| next_action | text | ✅ input |
| next_action_at | timestamptz | ✅ datepicker |

### vacancy_analysis
| Поле | Тип | Редактируется |
|------|-----|---------------|
| id | uuid | ❌ |
| vacancy_id | uuid | ❌ |
| score | int4 | ❌ |
| category | text | ❌ |
| reason | text | ❌ |
| letter | text | ❌ |
| letter_edited | text | ✅ textarea |
| model | text | ❌ |
| feedback | text | ✅ |

### pipeline_stages
| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid | — |
| name | text | Название этапа |
| color | text | HEX цвет |
| order_index | integer | Порядок |
| is_active | boolean | Показывать/скрыть |
