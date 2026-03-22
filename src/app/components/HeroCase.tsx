import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp } from "lucide-react";
import type { CaseStudy } from "@/data/portfolioData";

interface HeroCaseProps {
  caseStudy: CaseStudy;
}

/**
 * Шапка кейса: тёмный градиент, заголовок, метрики, инструменты.
 */
/* ─── Статичные стили (вынесены чтобы не создавались заново) ─── */
const heroStyle = {
  maxHeight: "760px",
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
} as const;
const glowStyle = {
  background: "radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.08) 0%, transparent 60%)",
} as const;
const noiseStyle = {
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
  backgroundRepeat: "repeat",
  backgroundSize: "128px 128px",
} as const;
const trendStyle = { position: "relative", top: "1px" } as const;

export const HeroCase = memo(function HeroCase({ caseStudy }: HeroCaseProps) {
  return (
    <section
      className="relative flex min-h-[60vh] items-end overflow-hidden md:min-h-[70vh]"
      style={heroStyle}
    >
      {/* Фоновое свечение */}
      <div
        className="absolute inset-0 opacity-30"
        style={glowStyle}
      />
      {/* Шумовая текстура */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={noiseStyle}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1140px] px-5 pb-10 pt-20 sm:px-8 md:pb-12 md:pt-24">
        {/* Ссылка «Назад» */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white md:mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Назад
        </Link>

        {/* Ниша */}
        <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/35">
          {caseStudy.niche}
        </p>

        {/* Заголовок */}
        <h1 className="mb-[13px] max-w-[900px] text-[1.625rem] font-bold leading-[1.2] text-white md:mb-[21px] md:text-[2.0625rem] md:leading-[1.15]">
          {caseStudy.title}
        </h1>

        {/* Подзаголовок */}
        {caseStudy.subtitle && (
          <p className="mb-[21px] max-w-[700px] text-[15px] leading-[1.618] text-white/55 md:mb-[34px]">
            {caseStudy.subtitle}
          </p>
        )}

        {!caseStudy.subtitle && <div className="mb-[21px] md:mb-[34px]" />}

        {/* Метрики */}
        {caseStudy.kpis.length > 0 && (
          <div
            className={`grid max-w-[900px] gap-3 md:gap-4 ${
              caseStudy.kpis.length === 3
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                : caseStudy.kpis.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : caseStudy.kpis.length >= 5
                    ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {caseStudy.kpis.map((kpi, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-xl bg-white/[0.07] px-[21px] py-[21px] text-center backdrop-blur-sm md:max-w-[280px] md:px-[34px] md:py-[34px]"
              >
                <div className="mb-1.5 flex items-baseline gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" style={trendStyle} />
                  <span className="text-[1.375rem] font-bold leading-tight text-white sm:text-[1.5rem] md:text-[1.25rem]">
                    {kpi.value}
                  </span>
                </div>
                <p className="text-[12px] font-medium leading-snug text-white/45 md:text-[13px]">
                  {kpi.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Период сравнения */}
        {caseStudy.comparisonPeriod && (
          <p className="mt-4 text-[11px] font-medium text-white/25 md:mt-5">
            {caseStudy.comparisonPeriod}
          </p>
        )}

        {/* Инструменты */}
        {caseStudy.tools.length > 0 && (
          <div className="mt-[34px] flex flex-wrap gap-2">
            {caseStudy.tools.map((tool) => (
              <span
                key={tool}
                className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[12px] font-medium text-white/40"
              >
                {tool}
              </span>
            ))}
          </div>
        )}

        {/* Сноска */}
        {caseStudy.heroNote && (
          <p className="mt-[21px] text-[11px] leading-[1.618] text-white/25">
            {caseStudy.heroNote}
          </p>
        )}
      </div>
    </section>
  );
});
