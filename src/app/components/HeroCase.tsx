import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Tag, Calendar } from "lucide-react";
import type { CaseStudy } from "@/data/portfolioData";

interface HeroCaseProps {
  caseStudy: CaseStudy;
}

export const HeroCase = memo(function HeroCase({ caseStudy }: HeroCaseProps) {
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-32">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">

        {/* Шапка с номером и навигацией */}
        <div className="mb-12">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Назад
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-6xl md:text-7xl font-light text-muted-foreground/30">
              {caseStudy.id === "msk-developer" ? "01" : caseStudy.id === "revitale-clinic" ? "02" : "03"}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>

          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
                {caseStudy.niche}
              </span>
            </div>

            <h1 className="text-2xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-6 leading-tight">
              {caseStudy.title}
            </h1>

            {caseStudy.subtitle && (
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {caseStudy.subtitle}
              </p>
            )}

            {caseStudy.tools.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {caseStudy.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-4 py-2 text-sm rounded-full bg-accent border border-border flex items-center gap-2"
                  >
                    <Tag className="w-3 h-3" />
                    {tool}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Изображение + метрики */}
        <div className="grid md:grid-cols-12 gap-8">
          {/* Изображение */}
          <div className="md:col-span-8">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-accent">
              <img
                src={caseStudy.image}
                alt={caseStudy.title}
                className="w-full h-full object-cover"
                width={960}
                height={540}
                loading="eager"
                {...{fetchpriority: "high"}}
                decoding="async"
              />
            </div>
          </div>

          {/* Метрики */}
          {caseStudy.kpis.length > 0 && (
            <div className="md:col-span-4 space-y-4">
              {caseStudy.kpis.slice(0, 4).map((kpi, i) => (
                <div
                  key={i}
                  className="p-6 bg-accent border border-border rounded-2xl"
                >
                  <TrendingUp className="w-6 h-6 mb-3 text-emerald-500" />
                  <div className="text-2xl md:text-4xl font-medium mb-2">
                    {kpi.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {kpi.label}
                  </div>
                </div>
              ))}
              {caseStudy.comparisonPeriod && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground/60 pt-1">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{caseStudy.comparisonPeriod}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Сноска */}
        {caseStudy.heroNote && (
          <p className="mt-6 text-xs text-muted-foreground/60">
            {caseStudy.heroNote}
          </p>
        )}
      </div>
    </section>
  );
});
