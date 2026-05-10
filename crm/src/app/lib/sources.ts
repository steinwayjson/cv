export const DEFAULT_SOURCES = ['HeadHunter', 'Telegram'] as const;

const SOURCE_ALIASES: Record<string, string[]> = {
  HeadHunter: ['hh', 'head hunter', 'headhunter', 'head-hunter', 'head_hunter'],
  Telegram: ['tg', 'telegram', 'телеграм', 'телега'],
};

export function normalizeSourceKey(source?: string | null) {
  return (source ?? '').trim().toLowerCase();
}

export function canonicalSource(source?: string | null) {
  const key = normalizeSourceKey(source);
  if (!key) return '';

  for (const [canonical, aliases] of Object.entries(SOURCE_ALIASES)) {
    const keys = [canonical, ...aliases].map(normalizeSourceKey);
    if (keys.includes(key)) return canonical;
  }

  return source?.trim() ?? '';
}

export function sourceAliases(source?: string | null) {
  const canonical = canonicalSource(source);
  if (!canonical) return [];
  return [canonical, ...(SOURCE_ALIASES[canonical] ?? [])];
}

export function sourceMatches(left?: string | null, right?: string | null) {
  return canonicalSource(left).toLowerCase() === canonicalSource(right).toLowerCase();
}

export function uniqueCanonicalSources(sources: Array<string | null | undefined>) {
  const seen = new Map<string, string>();
  for (const source of sources) {
    const canonical = canonicalSource(source);
    if (!canonical) continue;
    seen.set(canonical.toLowerCase(), canonical);
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}
