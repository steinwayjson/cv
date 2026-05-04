/**
 * Иконка источника вакансии.
 * Значения source из n8n: hh, linkedin, superjob, other.
 */

interface SourceIconProps {
  source?: string | null;
  size?: number;
  className?: string;
}

export function SourceIcon({ source, size = 16, className = '' }: SourceIconProps) {
  const s = source?.toLowerCase() ?? '';

  if (s === 'hh' || s === 'hh.ru') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="HH">
        <rect width="24" height="24" rx="4" fill="#D6001C" />
        <text x="3" y="17" fontSize="13" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">hh</text>
      </svg>
    );
  }

  if (s === 'tg' || s === 'telegram') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="Telegram">
        <rect width="24" height="24" rx="12" fill="#2AABEE" />
        <path d="M5 12l2.5 1.5 1.5 4 2.5-2.5L15 19l4-14L5 12z" fill="white" stroke="white" strokeWidth="0.5" />
      </svg>
    );
  }

  if (s === 'linkedin') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="LinkedIn">
        <rect width="24" height="24" rx="4" fill="#0A66C2" />
        <path d="M7 9h2v8H7V9zm1-1a1.1 1.1 0 110-2.2A1.1 1.1 0 018 8zm3 1h2v1.1c.3-.6 1-1.1 2-1.1 2 0 2.5 1.3 2.5 3V17h-2v-3.5c0-.8-.3-1.5-1.1-1.5-.9 0-1.4.6-1.4 1.5V17h-2V9z" fill="white" />
      </svg>
    );
  }

  if (s === 'superjob') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="SuperJob">
        <rect width="24" height="24" rx="4" fill="#1DA462" />
        <text x="3" y="16" fontSize="9" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">SJ</text>
      </svg>
    );
  }

  if (s === 'сайт' || s === 'site' || s === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="Сайт">
        <rect width="24" height="24" rx="4" fill="#6366F1" />
        <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="1.5" fill="none" />
        <path d="M12 7c-1.5 2-1.5 6 0 10" stroke="white" strokeWidth="1" fill="none" />
        <path d="M12 7c1.5 2 1.5 6 0 10" stroke="white" strokeWidth="1" fill="none" />
        <path d="M7 12h10" stroke="white" strokeWidth="1" />
      </svg>
    );
  }

  // Fallback — первая буква
  const letter = source?.charAt(0).toUpperCase() ?? '?';
  return (
    <span
      className={`inline-flex items-center justify-center rounded text-white font-bold ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.5,
        backgroundColor: '#6B7280',
        flexShrink: 0,
      }}
      aria-label={source ?? 'Источник'}
    >
      {letter}
    </span>
  );
}
