/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ЕДИНЫЙ ИСТОЧНИК ИСТИНЫ ДЛЯ ИСТОЧНИКОВ ВАКАНСИЙ
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ВСЕ источники вакансий определены ТОЛЬКО здесь.
 * Здесь НЕ хранятся этапы воронки — только источники и их синонимы.
 *
 * Этапы воронки по источникам хранятся в БД (таблица pipeline_stages).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * КАК ДОБАВИТЬ НОВЫЙ ИСТОЧНИК:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Добавить каноническое имя в массив ниже (например 'MySource')
 * 2. Добавить синонимы в SOURCE_ALIASES: 'MySource': ['mysrc', 'мойисточник', ...]
 * 3. Добавить начальные этапы воронки в supabase.ts → PIPELINE_PRESETS
 *    (или они автоматически возьмутся из дефолтного пресета)
 * 4. Готово — источник сразу появится в фильтрах и в PipelineEditor
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── СПИСОК КАНОНИЧЕСКИХ ИМЁН ИСТОЧНИКОВ ──────────────────────────────────────
// Порядок важен для отображения. НЕ УДАЛЯЙ и не меняй существующие без причины.
export const FIXED_SOURCES = [
  'HeadHunter',
  'LinkedIn',
  'SuperJob',
  'Telegram',
  'Zarplata',
  'Habr Career',
] as const;

export type FixedSource = typeof FIXED_SOURCES[number];

// ─── СИНОНИМЫ ИСТОЧНИКОВ ──────────────────────────────────────────────────────
// Любое из этих значений в поле vacancy.source будет приведено к каноническому
// Ключ = каноническое имя, значение = массив синонимов (url, названия, языки)
const SOURCE_ALIASES: Record<string, string[]> = {
  HeadHunter: [
    'hh', 'headhunter', 'head hunter', 'head-hunter', 'head_hunter',
    'hh.ru', 'headhunter.ru',
  ],
  LinkedIn: [
    'linkedin', 'linkedin.com', 'ln',
  ],
  SuperJob: [
    'superjob', 'superjob.ru', 'sj', 'суперджоб',
  ],
  Telegram: [
    'tg', 'telegram', 'телеграм', 'телега', 't.me', 'telegram.me',
  ],
  Zarplata: [
    'zarplata', 'zarplata.ru', 'z', 'зарплата',
  ],
  'Habr Career': [
    'habr', 'habr.com', 'habr career', 'habrcareer', 'хбр',
  ],
};

// ─── URL-ПАТТЕРНЫ (для парсера / автоопределения) ────────────────────────────
// Используются для автоопределения источника из URL вакансии
export const SOURCE_URL_PATTERNS: Record<string, string[]> = {
  HeadHunter: ['hh.ru', 'headhunter.ru'],
  LinkedIn: ['linkedin.com'],
  SuperJob: ['superjob.ru'],
  Telegram: ['t.me', 'telegram.me', 'telegram.org'],
  Zarplata: ['zarplata.ru'],
  'Habr Career': ['habr.com', 'career.habr.com'],
};

/**
 * Determines source from URL.
 * Returns canonical source name or '' if not matched.
 * Priority: first matched URL wins.
 *
 * Используется в парсере (n8n/tg-parser) для записи правильного source в вакансию.
 */
export function detectSourceFromUrl(url: string): string {
  if (!url) return '';
  const lower = url.toLowerCase();
  for (const [source, patterns] of Object.entries(SOURCE_URL_PATTERNS)) {
    if (patterns.some(p => lower.includes(p))) return source;
  }
  return '';
}

// ─── УТИЛИТЫ ─────────────────────────────────────────────────────────────────

export function normalizeSourceKey(source?: string | null): string {
  return (source ?? '').trim();
}

/** Привести любой синоним к каноническому имени источника */
export function canonicalSource(source?: string | null): string {
  const key = normalizeSourceKey(source).toLowerCase();
  if (!key) return '';

  for (const [canonical, aliases] of Object.entries(SOURCE_ALIASES)) {
    const keys = [canonical, ...aliases].map(s => s.toLowerCase());
    if (keys.includes(key)) return canonical;
  }

  return source?.trim() ?? '';
}

/** Все синонимы + каноническое имя для данного источника */
export function sourceAliases(source?: string | null): string[] {
  const canonical = canonicalSource(source);
  if (!canonical) return [];
  return [canonical, ...(SOURCE_ALIASES[canonical] ?? [])];
}

/** Проверка эквивалентности двух источников (по каноническому имени) */
export function sourceMatches(left?: string | null, right?: string | null): boolean {
  return canonicalSource(left).toLowerCase() === canonicalSource(right).toLowerCase();
}

/**
 * Получить массив уникальных канонических имён источников из сырого списка.
 * Дубликаты и синонимы сворачиваются в одно каноническое имя.
 */
export function uniqueCanonicalSources(sources: Array<string | null | undefined>): string[] {
  const seen = new Map<string, string>();
  for (const source of sources) {
    const canonical = canonicalSource(source);
    if (!canonical) continue;
    seen.set(canonical.toLowerCase(), canonical);
  }
  return Array.from(seen.values()).sort((a, b) => {
    const idxA = FIXED_SOURCES.indexOf(a as FixedSource);
    const idxB = FIXED_SOURCES.indexOf(b as FixedSource);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
}

/** Проверка: является ли источник фиксированным (предопределённым) */
export function isFixedSource(source?: string | null): boolean {
  const canonical = canonicalSource(source);
  return (FIXED_SOURCES as readonly string[]).includes(canonical);
}
