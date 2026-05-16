/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ОБЁРТКА ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Реэкспорт из единого реестра.
 * Весь код постепенно переводится на импорт напрямую из lib/constants/sources.
 *
 * @see lib/constants/sources.ts — единственный источник истины
 */

export {
  FIXED_SOURCES,
  canonicalSource,
  isFixedSource,
  sourceMatches,
  detectSourceFromUrl,
  sourceAliases,
} from './constants/sources';

export type { FixedSource, Source } from './constants/sources';
