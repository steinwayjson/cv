/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ЕДИНЫЙ РЕЕСТР ИСТОЧНИКОВ ВАКАНСИЙ
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Единственный источник истины для всех источников вакансий.
 * Все компоненты (Dashboard, Filters, PipelineEditor, Analytics, Forms)
 * берут список только отсюда — НЕ из БД.
 *
 * Нераспознанные значения из БД приводятся к 'Other'.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * КАК ДОБАВИТЬ НОВЫЙ ИСТОЧНИК:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Добавить каноническое имя в FIXED_SOURCES
 * 2. Добавить синонимы в SOURCE_ALIASES
 * 3. Добавить URL-паттерны в SOURCE_URL_PATTERNS
 * 4. Добавить пресет в PIPELINE_PRESETS (supabase.ts)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── КАНОНИЧЕСКИЕ ИМЕНА ИСТОЧНИКОВ ──────────────────────────────────────────
// Порядок важен для отображения.
export const FIXED_SOURCES = [
  'HeadHunter',
  'LinkedIn',
  'SuperJob',
  'Telegram',
  'Zarplata',
  'Habr Career',
] as const;

export type FixedSource = typeof FIXED_SOURCES[number];

/** Все возможные значения source у вакансии */
export type Source = FixedSource | 'Other';

// ─── СИНОНИМЫ ───────────────────────────────────────────────────────────────
// Любое значение поля vacancy.source будет приведено к каноническому.
// Ключ = каноническое имя, значение = массив синонимов.
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

// ─── URL-ПАТТЕРНЫ (для парсера / автоопределения) ──────────────────────────
export const SOURCE_URL_PATTERNS: Record<string, string[]> = {
  HeadHunter: ['hh.ru', 'headhunter.ru'],
  LinkedIn: ['linkedin.com'],
  SuperJob: ['superjob.ru'],
  Telegram: ['t.me', 'telegram.me', 'telegram.org'],
  Zarplata: ['zarplata.ru'],
  'Habr Career': ['habr.com', 'career.habr.com'],
};

// ─── УТИЛИТЫ ────────────────────────────────────────────────────────────────

function normalizeSourceKey(source?: string | null): string {
  return (source ?? '').trim();
}

/**
 * Привести любой синоним к каноническому имени источника.
 * Если значение не распознано — возвращает 'Other'.
 */
export function canonicalSource(source?: string | null): string {
  const key = normalizeSourceKey(source).toLowerCase();
  if (!key) return '';

  for (const [canonical, aliases] of Object.entries(SOURCE_ALIASES)) {
    const keys = [canonical, ...aliases].map(s => s.toLowerCase());
    if (keys.includes(key)) return canonical;
  }

  // Нераспознанное → Other
  return 'Other';
}

/** Проверка: является ли источник фиксированным (предопределённым) */
export function isFixedSource(source?: string | null): boolean {
  return (FIXED_SOURCES as readonly string[]).includes(canonicalSource(source));
}

/** Проверка эквивалентности двух источников (по каноническому имени) */
export function sourceMatches(left?: string | null, right?: string | null): boolean {
  return canonicalSource(left).toLowerCase() === canonicalSource(right).toLowerCase();
}

/**
 * Determines source from URL.
 * Returns canonical source name or '' if not matched.
 */
export function detectSourceFromUrl(url: string): string {
  if (!url) return '';
  const lower = url.toLowerCase();
  for (const [source, patterns] of Object.entries(SOURCE_URL_PATTERNS)) {
    if (patterns.some(p => lower.includes(p))) return source;
  }
  return '';
}

/** Все синонимы + каноническое имя для данного источника */
export function sourceAliases(source?: string | null): string[] {
  const canonical = canonicalSource(source);
  if (!canonical || canonical === 'Other') return [];
  return [canonical, ...(SOURCE_ALIASES[canonical] ?? [])];
}
