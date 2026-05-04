interface ScoreBadgeProps {
  score: number;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const getStyle = () => {
    if (score >= 70) {
      return 'text-[#EF4444] bg-[#FEF2F2] border-[#FECACA]';
    }
    if (score >= 40) {
      return 'text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]';
    }
    return 'text-[#6B7280] bg-[#F9FAFB] border-[#E5E7EB]';
  };

  const getEmoji = () => {
    if (score >= 70) return '🔴';
    if (score >= 40) return '🟡';
    return '⚫';
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-sm font-medium ${getStyle()}`}>
      <span>{getEmoji()}</span>
      <span>{score}</span>
    </span>
  );
}
