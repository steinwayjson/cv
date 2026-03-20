import { memo } from "react";
import { Link } from "react-router-dom";
import { type CaseStudy } from "@/data/portfolioData";
import { ArrowRight } from "lucide-react";

interface CaseCardProps {
  caseStudy: CaseStudy;
  featured?: boolean;
}

export const CaseCard = memo(function CaseCard({ caseStudy, featured }: CaseCardProps) {
  const visibleKpis = caseStudy.kpis.slice(0, 3);

  return (
    <Link
      to={`/case/${caseStudy.id}`}
      className="group block overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm md:rounded-2xl dark:border-white/8 dark:bg-gray-900"
    >
      <div className="relative overflow-hidden bg-gray-100 aspect-[16/9] dark:bg-gray-800">
        <img
          src={caseStudy.image}
          alt={caseStudy.title}
          loading="lazy"
          decoding="async"
          width={800}
          height={450}
          className="h-full w-full object-cover"
        />
        {/* KPI overlay */}
        {visibleKpis.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-3 pb-2.5 pt-6 md:px-5 md:pb-3 md:pt-8">
            <div className="flex items-end gap-4 md:gap-6">
              {visibleKpis.map((kpi, i) => (
                <div key={i} className="min-w-0">
                  <p className="truncate text-[13px] font-bold leading-tight text-white md:text-[15px]">
                    {kpi.value}
                  </p>
                  <p className="truncate text-[10px] leading-tight text-white/70 md:text-[11px]">
                    {kpi.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="p-[21px] md:p-[34px]">
        <p className="mb-[5px] text-[13px] font-medium text-gray-400 dark:text-gray-500">{caseStudy.niche}</p>
        <h3 className="mb-[5px] text-[1.25rem] font-bold leading-snug text-[#1a1a1a] dark:text-gray-100">
          {caseStudy.title}
        </h3>
        <p className="mb-[8px] text-[14px] font-medium text-gray-400 dark:text-gray-500">
          Роль: {caseStudy.role.length > 80 ? caseStudy.role.slice(0, 80) + '…' : caseStudy.role}
        </p>
        <p className="mb-[13px] text-[14px] leading-[1.618] text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-400 dark:text-gray-500">Задача: </span>
          {caseStudy.context.length > 120
            ? caseStudy.context.slice(0, 120) + '…'
            : caseStudy.context}
        </p>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-gray-200">
          Подробнее
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
});
