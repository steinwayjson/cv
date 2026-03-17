import { memo } from "react";

interface MetricCardProps {
  value: string;
  label: string;
  /** "hero" — white on glass, "light" — dark on white card, "dark" — white on dark card */
  variant?: "hero" | "light" | "dark";
  /** Semantic tone — affects accent color of the value */
  tone?: "neutral" | "success" | "warning";
}

const variantStyles = {
  hero: {
    card: "rounded-lg bg-white/[0.08] px-4 py-3.5 backdrop-blur-sm md:px-5 md:py-4 overflow-hidden",
    value: "text-[1.25rem] font-bold leading-tight text-white sm:text-[1.5rem] md:text-[1.75rem]",
    label: "mt-1.5 text-[12px] font-medium leading-snug text-white/50 md:text-[13px]",
  },
  light: {
    card: "rounded-lg border border-gray-200 bg-white px-5 py-4 md:px-6 md:py-5",
    value: "text-[1.5rem] font-bold leading-none text-gray-900 md:text-[2rem]",
    label: "mt-1 text-[12px] font-medium text-gray-400 md:text-[13px]",
  },
  dark: {
    card: "rounded-lg bg-white/[0.08] px-5 py-4 text-center backdrop-blur-sm md:px-6 md:py-5",
    value: "text-[2rem] font-bold leading-none text-white md:text-[2.5rem]",
    label: "mt-1.5 text-[13px] font-medium text-white/50",
  },
} as const;

const toneColors = {
  neutral: "",
  success: "!text-emerald-400",
  warning: "!text-amber-400",
} as const;

/**
 * Unified metric card.
 * – Max 2 lines: value (large) + label (small)
 * – Lighter visual weight: smaller radius, less padding, thinner glass
 * – Tone prop for semantic coloring
 */
export const MetricCard = memo(function MetricCard({
  value,
  label,
  variant = "light",
  tone = "neutral",
}: MetricCardProps) {
  const v = variantStyles[variant];
  const toneClass = toneColors[tone];
  return (
    <div className={v.card}>
      <div className={`${v.value} ${toneClass}`}>{value}</div>
      <div className={v.label}>{label}</div>
    </div>
  );
});
