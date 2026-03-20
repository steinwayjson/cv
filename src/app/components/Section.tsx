import { memo, type ReactNode } from "react";
import { FadeIn } from "./FadeIn";

interface SectionProps {
  children: ReactNode;
  /** Section heading (optional — e.g. "Стратегия") */
  title?: string;
  /** Small label above title (optional — e.g. "До начала работ") */
  label?: string;
  /** Background variant */
  bg?: "white" | "gray" | "dark";
  /** Vertical spacing multiplier: "normal" = 120px desktop / 64px mobile, "compact" = 80px / 48px */
  spacing?: "normal" | "compact";
  /** Section HTML id */
  id?: string;
  className?: string;
}

const bgMap = {
  white: "",
  gray: "bg-gray-50 dark:bg-gray-900/50",
  dark: "bg-gray-900 dark:bg-gray-800",
} as const;

const titleColor = {
  white: "text-gray-900 dark:text-gray-100",
  gray: "text-gray-900 dark:text-gray-100",
  dark: "text-white",
} as const;

/**
 * Unified section wrapper with consistent spacing.
 * Desktop: py-[100px] (≈ 100–140 range).
 * Mobile:  py-16 (64px).
 */
const spacingMap = {
  normal: "py-16 md:py-[120px]",
  compact: "py-12 md:py-20",
} as const;

export const Section = memo(function Section({
  children,
  title,
  label,
  bg = "white",
  spacing = "normal",
  id,
  className = "",
}: SectionProps) {
  const outer = "mx-auto max-w-[1140px] px-5 sm:px-8";

  return (
    <FadeIn
      as="section"
      id={id}
      className={`${spacingMap[spacing]} ${bgMap[bg]} ${className}`}
    >
      <div className={outer}>
        {label && (
          <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] ${bg === "dark" ? "text-white/40" : "text-gray-400"}`}>
            {label}
          </p>
        )}
        {title && (
          <h2 className={`mb-8 text-[1.375rem] font-bold md:text-[1.625rem] ${titleColor[bg]}`}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </FadeIn>
  );
});
