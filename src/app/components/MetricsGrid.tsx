import { memo } from "react";
import { MetricCard } from "./MetricCard";

interface KPI {
  value: string;
  label: string;
}

interface MetricsGridProps {
  items: KPI[];
  variant?: "hero" | "light" | "dark";
  tone?: "neutral" | "success" | "warning";
}

/**
 * Grid of MetricCards.
 * Desktop: max 4 cols. On ≤1280px → 2×2. Mobile → 1 col (light/dark) or 2 cols (hero).
 */
export const MetricsGrid = memo(function MetricsGrid({
  items,
  variant = "light",
  tone = "neutral",
}: MetricsGridProps) {
  if (items.length === 0) return null;

  const colsMap: Record<number, string> = {
    1: "grid-cols-1 sm:grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
  };

  const cols =
    variant === "hero"
      ? "grid-cols-2 lg:grid-cols-4"
      : items.length <= 3
        ? colsMap[items.length] ?? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid gap-3 md:gap-3.5 ${cols}`}>
      {items.map((kpi, i) => (
        <MetricCard key={i} value={kpi.value} label={kpi.label} variant={variant} tone={tone} />
      ))}
    </div>
  );
});
