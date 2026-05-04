const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, LevelFormat, PageNumber, PageBreak
} = require('docx');
const fs = require('fs');

// ── Helpers ──────────────────────────────────────────────────────────────────

const COLORS = {
  accent:    '2563EB',
  accent2:   '7C3AED',
  green:     '16A34A',
  red:       'DC2626',
  gray:      '6B7280',
  lightGray: 'F3F4F6',
  midGray:   'E5E7EB',
  darkGray:  '374151',
  white:     'FFFFFF',
  black:     '111827',
};

const border = (color = COLORS.midGray) => ({ style: BorderStyle.SINGLE, size: 1, color });
const borders = (color) => ({ top: border(color), bottom: border(color), left: border(color), right: border(color) });
const noBorder = () => ({ style: BorderStyle.NONE, size: 0, color: 'FFFFFF' });
const noBorders = () => ({ top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder() });

const sp = (before = 0, after = 0) => ({ spacing: { before, after } });

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, size: 36, color: COLORS.black, font: 'Arial' })],
    ...sp(320, 160),
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.accent, space: 4 } },
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: 26, color: COLORS.accent, font: 'Arial' })],
    ...sp(280, 100),
  });
}

function h3(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, color: COLORS.darkGray, font: 'Arial' })],
    ...sp(200, 80),
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, color: COLORS.darkGray, font: 'Arial', ...opts })],
    ...sp(60, 60),
  });
}

function bullet(text, bold_prefix = null) {
  const children = [];
  if (bold_prefix) {
    children.push(new TextRun({ text: bold_prefix + ' ', bold: true, size: 20, color: COLORS.black, font: 'Arial' }));
  }
  children.push(new TextRun({ text, size: 20, color: COLORS.darkGray, font: 'Arial' }));
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children,
    ...sp(40, 40),
  });
}

function code(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: 'Courier New', size: 18, color: COLORS.accent2 })],
    shading: { fill: 'F5F3FF', type: ShadingType.CLEAR },
    indent: { left: 360 },
    ...sp(40, 40),
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: COLORS.accent2, space: 6 } },
  });
}

function gap(size = 120) {
  return new Paragraph({ children: [new TextRun('')], spacing: { before: size, after: 0 } });
}

function badge(text, color = COLORS.accent) {
  return new TextRun({ text: ` ${text} `, bold: true, size: 16, color: COLORS.white,
    shading: { fill: color, type: ShadingType.CLEAR }, font: 'Arial' });
}

// ── Table builders ───────────────────────────────────────────────────────────

function makeCell(children, opts = {}) {
  const { fill = COLORS.white, width = 2340, bold = false, isHeader = false } = opts;
  const textColor = isHeader ? COLORS.white : COLORS.darkGray;
  const content = typeof children === 'string'
    ? [new Paragraph({ children: [new TextRun({ text: children, size: 18, color: textColor, bold: bold || isHeader, font: 'Arial' })], ...sp(60, 60) })]
    : children;
  return new TableCell({
    borders: borders(isHeader ? COLORS.accent : COLORS.midGray),
    width: { size: width, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: content,
    verticalAlign: VerticalAlign.TOP,
  });
}

function headerRow(cols, widths) {
  return new TableRow({
    children: cols.map((c, i) => makeCell(c, { fill: COLORS.accent, width: widths[i], isHeader: true })),
    tableHeader: true,
  });
}

function dataRow(cols, widths, altFill = COLORS.white) {
  return new TableRow({
    children: cols.map((c, i) => makeCell(c, { width: widths[i], fill: altFill })),
  });
}

function schemaTable(tableName, fields, colWidths = [2200, 1400, 1400, 4000]) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      headerRow(['Поле', 'Тип', 'Nullable', 'Описание'], colWidths),
      ...fields.map((f, i) =>
        dataRow([f[0], f[1], f[2], f[3]], colWidths, i % 2 === 0 ? COLORS.white : COLORS.lightGray)
      ),
    ],
  });
}

// ── Content ──────────────────────────────────────────────────────────────────

const titleSection = [
  gap(200),
  new Paragraph({
    children: [new TextRun({ text: 'DATABASE ARCHITECTURE', size: 52, bold: true, color: COLORS.accent, font: 'Arial' })],
    alignment: AlignmentType.CENTER,
    ...sp(0, 80),
  }),
  new Paragraph({
    children: [new TextRun({ text: 'Документация для разработчика', size: 26, color: COLORS.gray, font: 'Arial' })],
    alignment: AlignmentType.CENTER,
    ...sp(0, 40),
  }),
  new Paragraph({
    children: [new TextRun({ text: 'Job Tracking & AI Pipeline System · Supabase (PostgreSQL)', size: 20, color: COLORS.gray, font: 'Arial' })],
    alignment: AlignmentType.CENTER,
    ...sp(0, 80),
  }),
  new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.midGray } },
    children: [],
    ...sp(0, 200),
  }),
  gap(200),
];

// ── 1. OVERVIEW ──────────────────────────────────────────────────────────────
const overviewSection = [
  h1('1. Обзор системы'),
  para('Система автоматизирует обработку вакансий через AI-pipeline. Пользователь отправляет ссылку или текст вакансии в Telegram-бота, система анализирует, скорит и при высоком score генерирует персонализированное письмо.'),
  gap(80),
  h3('Pipeline (порядок обработки):'),
  bullet('Telegram-бот → Webhook → n8n'),
  bullet('Parse Input — извлекает URL, source, site'),
  bullet('LLM Аналитик-парсер — структурирует вакансию в JSON'),
  bullet('Supabase: создание companies + vacancies'),
  bullet('LLM Скоринг — оценивает соответствие профилю (0–100)'),
  bullet('IF score ≥ 70 → Fetch Site → LLM Копирайтер → Telegram'),
  bullet('IF score < 70 → краткое уведомление в Telegram'),
  gap(160),
];

// ── 2. ТАБЛИЦЫ ───────────────────────────────────────────────────────────────
const tablesSection = [
  h1('2. Структура таблиц'),

  h2('2.1 companies'),
  para('Хранит данные о компании-работодателе. Одна компания может иметь несколько вакансий.'),
  gap(80),
  schemaTable('companies', [
    ['id', 'uuid', 'NOT NULL', 'PK, gen_random_uuid()'],
    ['created_at', 'timestamptz', 'NOT NULL', 'Дата создания записи, default now()'],
    ['name', 'text', 'YES', 'Название компании'],
    ['site', 'text', 'YES', 'URL сайта компании'],
    ['branch', 'text', 'YES', 'Ниша: Fintech, EdTech, SaaS, Digital-агентство и т.п.'],
    ['size', 'text', 'YES', 'до 50 чел / 50-200 чел / 200-1000 чел / 1000+ чел / Не определено'],
    ['size_comment', 'text', 'YES', 'Пояснение откуда взят размер (косвенные признаки)'],
    ['stage', 'text', 'YES', 'Стадия: Стартап / Рост / Зрелая / Корпорация / Не определено'],
    ['context', 'text', 'YES', 'Дополнительный контекст о компании'],
    ['resource', 'text', 'YES', 'Источник данных о компании'],
  ]),
  gap(200),

  h2('2.2 vacancies'),
  para('Основная таблица. Хранит всю информацию о вакансии включая данные от LLM-аналитика.'),
  gap(80),
  schemaTable('vacancies', [
    ['id', 'uuid', 'NOT NULL', 'PK, gen_random_uuid()'],
    ['published_at', 'timestamptz', 'YES', 'Дата публикации вакансии'],
    ['sent_at', 'timestamptz', 'YES', 'Дата отправки письма кандидату'],
    ['link', 'text', 'YES', 'Ссылка на вакансию (заполняется из Parse Input, не LLM)'],
    ['role', 'text', 'YES', 'Точное название должности из заголовка вакансии'],
    ['about', 'text', 'YES', 'Суть задач (2-3 предложения, без копипаста)'],
    ['salary', 'text', 'YES', 'Нормализованная зарплата или оценка'],
    ['salary_raw', 'text', 'YES', 'Зарплата дословно из текста вакансии'],
    ['salary_comment', 'text', 'YES', 'Комментарий: рыночный ли уровень'],
    ['format', 'text', 'YES', 'Удалённо / Офис / Гибрид / Не указано'],
    ['city', 'text', 'YES', 'Город или "Любой" для удалёнки'],
    ['experience', 'text', 'YES', 'Требуемый опыт: "1-3 года", "без опыта" и т.п.'],
    ['employment', 'text', 'YES', 'Полная / Частичная / Проектная / Стажировка'],
    ['hard_skills', 'jsonb', 'YES', 'Массив инструментов из требований: ["VK Ads", "Figma"]'],
    ['soft_skills', 'jsonb', 'YES', 'Массив личных качеств: ["самостоятельность"]'],
    ['relocation', 'text', 'YES', 'Требуется / Возможна / Не требуется / Не указано'],
    ['visa_support', 'text', 'YES', 'Есть / Нет / Не указано'],
    ['reason', 'text', 'YES', 'Анализ соответствия вакансии профилю кандидата'],
    ['status', 'text', 'YES', 'new / scored / sent / rejected / archived'],
    ['source', 'text', 'YES', 'Источник: hh / telegram / linkedin и т.п.'],
    ['source_type', 'text', 'YES', 'Тип источника'],
    ['utm', 'text', 'YES', 'UTM-метки если есть'],
    ['priority', 'text', 'YES', 'Приоритет вакансии'],
    ['notes', 'text', 'YES', 'Заметки пользователя'],
    ['next_action', 'text', 'YES', 'Следующее действие'],
    ['next_action_at', 'timestamptz', 'YES', 'Дата следующего действия'],
    ['last_stage', 'text', 'YES', 'Последний этап воронки'],
    ['company_id', 'uuid', 'YES', 'FK → companies.id'],
    ['analyzer_prompt_version', 'int', 'YES', 'Версия промпта аналитика которым обработана вакансия'],
    ['analyzed_at', 'timestamptz', 'YES', 'Время последнего прогона аналитика'],
    ['scoring_prompt_version', 'int', 'YES', 'Версия промпта скоринга'],
    ['scored_at', 'timestamptz', 'YES', 'Время последнего скоринга'],
    ['copywriter_prompt_version', 'int', 'YES', 'Версия промпта копирайтера'],
    ['copywritten_at', 'timestamptz', 'YES', 'Время последней генерации письма'],
  ]),
  gap(200),

  h2('2.3 prompts'),
  para('Хранит все промпты системы с полной историей версий. Активная версия определяется флагом is_active = true.'),
  gap(80),
  schemaTable('prompts', [
    ['id', 'uuid', 'NOT NULL', 'PK, gen_random_uuid()'],
    ['key', 'text', 'NOT NULL', 'Идентификатор: analyzer / scoring / copywriter / profile'],
    ['version', 'int', 'NOT NULL', 'Версия промпта, default 1. Автоинкремент при создании новой'],
    ['name', 'text', 'YES', 'Человекочитаемое название'],
    ['content', 'text', 'NOT NULL', 'Тело промпта'],
    ['description', 'text', 'YES', 'Описание изменений в этой версии (changelog)'],
    ['is_active', 'bool', 'NOT NULL', 'Активна ли эта версия, default true. Только одна версия на key'],
    ['created_at', 'timestamptz', 'NOT NULL', 'Время создания версии, default now()'],
  ]),
  gap(80),
  para('Важно: уникальность (key, is_active=true) обеспечивается на уровне приложения или partial unique index.'),
  code("CREATE UNIQUE INDEX prompts_active_key ON prompts(key) WHERE is_active = true;"),
  gap(200),

  h2('2.4 analysis_log'),
  para('Лог каждого прогона любого LLM-агента. Позволяет сравнивать качество разных версий промптов и откатывать данные.'),
  gap(80),
  schemaTable('analysis_log', [
    ['id', 'uuid', 'NOT NULL', 'PK, gen_random_uuid()'],
    ['created_at', 'timestamptz', 'NOT NULL', 'Время прогона, default now()'],
    ['vacancy_id', 'uuid', 'YES', 'FK → vacancies.id'],
    ['agent', 'text', 'NOT NULL', 'Агент: analyzer / scoring / copywriter'],
    ['prompt_key', 'text', 'NOT NULL', 'Ключ промпта: analyzer / scoring / copywriter'],
    ['prompt_version', 'int', 'NOT NULL', 'Версия промпта на момент прогона'],
    ['input', 'jsonb', 'YES', 'Входные данные переданные агенту'],
    ['raw_output', 'text', 'YES', 'Сырой ответ LLM до парсинга'],
    ['parsed_output', 'jsonb', 'YES', 'Распарсенный JSON результат'],
    ['model', 'text', 'YES', 'Модель: groq/llama-3.3-70b и т.п.'],
    ['error', 'text', 'YES', 'Текст ошибки если прогон завершился неудачей'],
  ]),
  gap(200),

  h2('2.5 pipeline_stages'),
  para('Справочник этапов воронки. Используется для отслеживания прогресса по каждой вакансии.'),
  gap(80),
  schemaTable('pipeline_stages', [
    ['id', 'uuid', 'NOT NULL', 'PK'],
    ['name', 'text', 'NOT NULL', 'Название этапа: Новая, Скоринг, Письмо отправлено и т.п.'],
    ['color', 'text', 'YES', 'HEX цвет для UI'],
    ['order_index', 'int4', 'YES', 'Порядок отображения'],
    ['is_active', 'bool', 'YES', 'Активен ли этап'],
    ['source', 'text', 'YES', 'Источник этапа'],
  ]),
  gap(160),
];

// ── 3. ВЕРСИОНИРОВАНИЕ ───────────────────────────────────────────────────────
const versioningSection = [
  h1('3. Версионирование промптов'),

  h2('3.1 Принцип работы'),
  para('Каждый промпт имеет несколько версий в таблице prompts. В n8n всегда используется активная версия (is_active = true). При изменении промпта старая версия деактивируется, создаётся новая.'),
  gap(80),

  h2('3.2 Как создать новую версию промпта'),
  para('Выполнить в Supabase SQL Editor:'),
  code("-- 1. Деактивировать текущую версию"),
  code("UPDATE prompts SET is_active = false WHERE key = 'analyzer' AND is_active = true;"),
  gap(40),
  code("-- 2. Создать новую версию"),
  code("INSERT INTO prompts (key, version, name, content, description, is_active)"),
  code("VALUES ('analyzer', 2, 'Analyzer v2', '...текст промпта...', 'Добавлено поле salary_comment', true);"),
  gap(80),

  h2('3.3 Как перегнать вакансии через новый промпт'),
  para('В n8n создать отдельный workflow:'),
  bullet('Supabase Get Many: vacancies WHERE analyzer_prompt_version < текущей версии'),
  bullet('Loop Over Items'),
  bullet('LLM Аналитик (берёт активный промпт автоматически)'),
  bullet('Supabase Update: перезаписать поля + обновить analyzer_prompt_version и analyzed_at'),
  bullet('Supabase Insert: analysis_log — записать результат прогона'),
  gap(80),

  h2('3.4 Как сравнить качество версий'),
  para('Запрос для сравнения двух версий по конкретной вакансии:'),
  code("SELECT prompt_version, parsed_output, created_at"),
  code("FROM analysis_log"),
  code("WHERE vacancy_id = '<uuid>' AND agent = 'analyzer'"),
  code("ORDER BY created_at DESC;"),
  gap(80),

  h2('3.5 Как откатить вакансию к предыдущей версии'),
  para('Данные предыдущего прогона хранятся в analysis_log.parsed_output. Для отката:'),
  code("-- Найти предыдущий прогон"),
  code("SELECT * FROM analysis_log"),
  code("WHERE vacancy_id = '<uuid>' AND agent = 'analyzer' AND prompt_version = 1;"),
  gap(40),
  para('Затем вручную или через n8n записать parsed_output обратно в vacancies.'),
  gap(160),
];

// ── 4. SQL МИГРАЦИИ ──────────────────────────────────────────────────────────
const migrationsSection = [
  h1('4. SQL-миграции'),
  para('Выполнить в Supabase SQL Editor для приведения БД к актуальной схеме.'),
  gap(80),

  h2('4.1 Обновление таблицы companies'),
  code("ALTER TABLE companies"),
  code("  ADD COLUMN IF NOT EXISTS size_comment text,"),
  code("  ADD COLUMN IF NOT EXISTS stage text;"),
  gap(120),

  h2('4.2 Обновление таблицы vacancies'),
  code("ALTER TABLE vacancies"),
  code("  ADD COLUMN IF NOT EXISTS salary_raw text,"),
  code("  ADD COLUMN IF NOT EXISTS salary_comment text,"),
  code("  ADD COLUMN IF NOT EXISTS format text,"),
  code("  ADD COLUMN IF NOT EXISTS city text,"),
  code("  ADD COLUMN IF NOT EXISTS experience text,"),
  code("  ADD COLUMN IF NOT EXISTS employment text,"),
  code("  ADD COLUMN IF NOT EXISTS hard_skills jsonb DEFAULT '[]',"),
  code("  ADD COLUMN IF NOT EXISTS soft_skills jsonb DEFAULT '[]',"),
  code("  ADD COLUMN IF NOT EXISTS relocation text,"),
  code("  ADD COLUMN IF NOT EXISTS visa_support text,"),
  code("  ADD COLUMN IF NOT EXISTS analyzer_prompt_version int,"),
  code("  ADD COLUMN IF NOT EXISTS analyzed_at timestamptz,"),
  code("  ADD COLUMN IF NOT EXISTS scoring_prompt_version int,"),
  code("  ADD COLUMN IF NOT EXISTS scored_at timestamptz,"),
  code("  ADD COLUMN IF NOT EXISTS copywriter_prompt_version int,"),
  code("  ADD COLUMN IF NOT EXISTS copywritten_at timestamptz;"),
  gap(120),

  h2('4.3 Обновление таблицы prompts'),
  code("ALTER TABLE prompts"),
  code("  ADD COLUMN IF NOT EXISTS version int DEFAULT 1,"),
  code("  ADD COLUMN IF NOT EXISTS is_active bool DEFAULT true,"),
  code("  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();"),
  gap(40),
  code("-- Уникальный индекс: только одна активная версия на key"),
  code("CREATE UNIQUE INDEX IF NOT EXISTS prompts_active_key"),
  code("  ON prompts(key) WHERE is_active = true;"),
  gap(120),

  h2('4.4 Создание таблицы analysis_log'),
  code("CREATE TABLE IF NOT EXISTS analysis_log ("),
  code("  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,"),
  code("  created_at timestamptz DEFAULT now() NOT NULL,"),
  code("  vacancy_id uuid REFERENCES vacancies(id) ON DELETE SET NULL,"),
  code("  agent text NOT NULL,"),
  code("  prompt_key text NOT NULL,"),
  code("  prompt_version int NOT NULL,"),
  code("  input jsonb,"),
  code("  raw_output text,"),
  code("  parsed_output jsonb,"),
  code("  model text,"),
  code("  error text"),
  code(");"),
  gap(40),
  code("-- Индекс для быстрого поиска по вакансии"),
  code("CREATE INDEX IF NOT EXISTS analysis_log_vacancy_idx ON analysis_log(vacancy_id);"),
  code("CREATE INDEX IF NOT EXISTS analysis_log_agent_idx ON analysis_log(agent, prompt_version);"),
  gap(160),
];

// ── 5. N8N ИНТЕГРАЦИЯ ────────────────────────────────────────────────────────
const n8nSection = [
  h1('5. Интеграция с n8n'),

  h2('5.1 Как n8n берёт активный промпт'),
  para('Нода Supabase Get Many с фильтром:'),
  code("Table: prompts"),
  code("Filter: key = 'analyzer' AND is_active = true"),
  code("Limit: 1"),
  gap(40),
  para('Затем передаётся в LLM как System Prompt:'),
  code("{{ $('Get Prompt').first().json.content }}"),
  gap(80),

  h2('5.2 Запись версии в вакансию (Parse LLM Response)'),
  para('После прогона аналитика добавить в код ноды:'),
  code("const promptVersion = $('Get Prompt').first().json.version;"),
  code("parsed.vacancy.analyzer_prompt_version = promptVersion;"),
  code("parsed.vacancy.analyzed_at = new Date().toISOString();"),
  gap(80),

  h2('5.3 Запись в analysis_log'),
  para('Добавить ноду Supabase Insert после Parse LLM Response:'),
  code("Table: analysis_log"),
  code("agent: 'analyzer'"),
  code("prompt_key: 'analyzer'"),
  code("prompt_version: {{ $('Get Prompt').first().json.version }}"),
  code("vacancy_id: {{ $('Create vacancies').first().json.id }}"),
  code("raw_output: {{ $('LLM Analyzer').first().json.text }}"),
  code("parsed_output: {{ $json.vacancy }}  // весь объект vacancy"),
  code("model: 'groq/llama-3.3-70b'"),
  gap(160),
];

// ── DOC ASSEMBLY ─────────────────────────────────────────────────────────────

const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 360 } } },
        }],
      },
    ],
  },
  styles: {
    default: { document: { run: { font: 'Arial', size: 20, color: COLORS.darkGray } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: COLORS.black },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: COLORS.accent },
        paragraph: { spacing: { before: 280, after: 100 }, outlineLevel: 1 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 },
      },
    },
    children: [
      ...titleSection,
      ...overviewSection,
      ...tablesSection,
      ...versioningSection,
      ...migrationsSection,
      ...n8nSection,
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/mnt/user-data/outputs/db_architecture.docx', buf);
  console.log('Done');
});
