import { memo, type ReactNode, useEffect, useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, CheckCircle2, Lightbulb, ChevronDown, ZoomIn } from "lucide-react";
import { HeroCase } from "./HeroCase";
import { ImageGallery } from "./ImageGallery";
import { ImageModal } from "./ImageModal";
import { ContactModal } from "./ContactModal";
import { FadeIn } from "./FadeIn";
import type { CaseStudy, PersonalInfo, FirstTestBlock } from "@/data/portfolioData";

interface CaseLayoutProps {
  caseStudy: CaseStudy;
  nextCase?: CaseStudy;
  personalInfo: PersonalInfo;
  children?: ReactNode;
}

/* ─── layout tokens ─── */
const cx = {
  outer: "mx-auto max-w-[1140px] px-5 sm:px-8",
  text: "max-w-[700px]",
  /** Vertical rhythm: Fibonacci 55/89 */
  sectionY: "py-[55px] md:py-[89px]",
};

/* ─── Approach card (with mobile accordion) ─── */
const MOBILE_VISIBLE_ITEMS = 4;

interface StrategyGroupData {
  title: string;
  label?: string;
  items: string[];
  secondary?: boolean;
}

function StrategyCard({ group }: { group: StrategyGroupData }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = group.items.length > MOBILE_VISIBLE_ITEMS;

  return (
    <div className={`flex h-full flex-col rounded-2xl border px-[21px] py-[21px] transition-transform duration-200 ease-out md:px-[34px] md:py-[34px] ${
      group.secondary
        ? "border-gray-100 bg-gray-50/60 opacity-85 dark:border-gray-800 dark:bg-gray-800/40"
        : "border-gray-200/80 bg-white md:hover:-translate-y-1 md:hover:shadow-md dark:border-white/10 dark:bg-gray-900"
    }`}>
      {/* Label */}
      {group.label && (
        <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
          {group.label}
        </span>
      )}
      {/* Title */}
      <h3 className="mb-[13px] text-[1.25rem] font-semibold leading-snug text-gray-900 dark:text-gray-100">
        {group.title}
      </h3>
      {/* Items */}
      <ul className="flex-1 space-y-2.5">
        {group.items.map((item, ii) => {
          const isLast = ii >= group.items.length - 2;
          const isHiddenMobile = !expanded && ii >= MOBILE_VISIBLE_ITEMS;
          return (
            <li
              key={ii}
              className={`flex gap-2.5 text-[14px] leading-[1.618] md:text-[15px] ${
                isLast
                  ? "font-medium text-gray-800 dark:text-gray-200"
                  : "text-gray-600 dark:text-gray-400"
              } ${isHiddenMobile ? "hidden md:flex" : "flex"}`}
            >
              <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
              <span className="max-w-[420px]">{item}</span>
            </li>
          );
        })}
      </ul>
      {/* Mobile expand toggle */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-[13px] font-medium text-gray-400 transition-colors hover:text-gray-600 md:hidden dark:text-gray-500 dark:hover:text-gray-300"
        >
          {expanded ? "Свернуть" : "Подробнее"}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}

function ContextAndApproachSection({
  startingPoint,
  challenge,
  groups,
  context,
  approach,
  firstTest,
}: {
  startingPoint?: string[];
  challenge: string[];
  groups: StrategyGroupData[];
  context?: string;
  approach?: string;
  firstTest?: FirstTestBlock;
}) {
  const activeGroups = groups.filter((g) => g.items.length > 0);
  const cols =
    activeGroups.length === 2
      ? "md:grid-cols-2"
      : "md:grid-cols-3";
  const hasMetrics = startingPoint && startingPoint.length > 0;

  return (
    <>
      {/* ── Контекст + Исходные данные (белый фон) ── */}
      {(context || hasMetrics) && (
        <div className="border-t border-gray-100 py-[34px] md:py-[55px] dark:border-white/8">
          <div className={cx.outer}>
            <div
              className={`flex flex-col gap-[34px] ${
                context && hasMetrics
                  ? "md:grid md:grid-cols-[1.618fr_1fr] md:items-start"
                  : ""
              }`}
            >
              {context && (
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                    Контекст
                  </p>
                  <p className="max-w-[700px] text-[0.9375rem] leading-[1.618] text-gray-600 dark:text-gray-400">
                    {context}
                  </p>
                </div>
              )}

              {hasMetrics && (
                <div>
                  <p className="mb-[13px] text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                    Исходные данные
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {startingPoint!.map((item, i) => {
                      const colonIdx = item.indexOf(":");
                      const dashIdx = item.indexOf("—");
                      const splitIdx = colonIdx > 0 ? colonIdx : dashIdx > 0 ? dashIdx : -1;
                      const sep = colonIdx > 0 ? ":" : "—";

                      if (splitIdx > 0) {
                        const label = item.slice(0, splitIdx).trim();
                        const value = item.slice(splitIdx + sep.length).trim();
                        return (
                          <div
                            key={i}
                            className="relative flex min-h-[80px] flex-col justify-center overflow-hidden rounded-lg border border-amber-100 bg-amber-50/40 px-4 py-3 pl-5"
                          >
                            <span className="absolute left-0 top-0 h-full w-[3px] rounded-l-lg bg-amber-300/70 dark:bg-amber-500/50" />
                            <div className="text-[1.25rem] font-bold leading-tight text-gray-900 dark:text-gray-100">
                              {value}
                            </div>
                            <div className="mt-0.5 text-[11px] font-medium leading-snug text-amber-700/70 md:text-[12px] dark:text-amber-400/60">
                              {label}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={i}
                          className="relative flex min-h-[80px] flex-col justify-center overflow-hidden rounded-lg border border-amber-100 bg-amber-50/40 px-4 py-3 pl-5 dark:border-amber-900/30 dark:bg-amber-900/10"
                        >
                          <span className="absolute left-0 top-0 h-full w-[3px] rounded-l-lg bg-amber-300/70 dark:bg-amber-500/50" />
                          <p className="text-[13px] font-medium leading-[1.45] text-gray-700 dark:text-gray-300">
                            {item}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Подход + карточки стратегий (серый фон) ── */}
      {(approach || activeGroups.length > 0) && (
        <section className="bg-gray-50/80 py-[34px] md:py-[55px] dark:bg-gray-900/60">
          <div className={cx.outer}>
            {approach && (
              <div className="mb-6">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                  Подход
                </p>
                <p className="max-w-[700px] text-[0.9375rem] leading-[1.618] text-gray-500 dark:text-gray-400">
                  {approach}
                </p>
              </div>
            )}

            {/* First Test — after approach text */}
            {firstTest && (
              <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50/50 px-6 py-7 md:px-8 md:py-8 dark:border-amber-900/30 dark:bg-amber-900/10">
                <h3 className="mb-[13px] text-[1.25rem] font-bold text-gray-900 dark:text-gray-100">
                  {firstTest.title}
                </h3>
                <div className={`space-y-3 ${cx.text}`}>
                  {firstTest.paragraphs.map((p, i) => (
                    <p key={i} className="text-[15px] leading-[1.618] text-gray-600 dark:text-gray-400">{p}</p>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Результат</span>
                  <span className="text-[15px] font-semibold text-gray-800 dark:text-gray-200">{firstTest.result}</span>
                </div>
                {firstTest.note && (
                  <p className="mt-2 text-[13px] italic text-gray-400 dark:text-gray-500">{firstTest.note}</p>
                )}
              </div>
            )}
            <div className={`grid gap-[13px] md:gap-[21px] ${cols}`}>
              {activeGroups.map((group, gi) => (
                <StrategyCard key={gi} group={group} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/**
 * Unified case page layout.
 * All case pages use this component — no custom markup per case.
 *
 * Visual hierarchy (top→bottom):
 * 1. Hero (title + KPIs)
 * 2. Tools
 * 3. Role + Context
 * 4. Starting Point (gray bg, card-style)
 * 5. Challenge (inline intro text)
 * 6. Strategy (columns)
 * 7. Galleries / Before-After
 * 8. Results
 * 9. Organic Comparison (if present)
 * 10. Business Effect (dark)
 * 11. Growth Plan (if present)
 * 12. Learned
 * 13. CTA
 */
export const CaseLayout = memo(function CaseLayout({
  caseStudy,
  nextCase,
  personalInfo,
}: CaseLayoutProps) {
  /* scroll progress — direct DOM update, no re-renders */
  const progressRef = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);
  const [analyticsLightbox, setAnalyticsLightbox] = useState<{ index: number } | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  const updateProgress = useCallback(() => {
    const bar = progressRef.current;
    if (!bar) return;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
    rafId.current = 0;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(updateProgress);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [updateProgress]);

  return (
    <div className="min-h-screen bg-white transition-colors duration-300 dark:bg-gray-950">
      {/* Scroll progress bar */}
      <div ref={progressRef} className="scroll-progress" />

      {/* ═══════════  1. HERO  ═══════════ */}
      <HeroCase caseStudy={caseStudy} />

      {/* ═══════════  CONTENT  ═══════════ */}
      <article>
        {/* ─── Role ─── */}
        <FadeIn className={`py-[34px] md:py-[55px] ${cx.outer}`} as="section">
          <p className="mb-[13px] text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
            Роль
          </p>
          <p className={`text-[0.9375rem] leading-[1.618] text-gray-600 md:text-[1rem] dark:text-gray-400 ${cx.text}`}>
            {caseStudy.role}
          </p>
        </FadeIn>


        {/* ─── Context & Approach (combined) ─── */}
        {(caseStudy.startingPoint?.length || caseStudy.strategyGroups.length > 0) && (
          <ContextAndApproachSection
            startingPoint={caseStudy.startingPoint}
            challenge={caseStudy.challenge}
            groups={caseStudy.strategyGroups}
            context={caseStudy.context}
            approach={caseStudy.approach}
            firstTest={caseStudy.firstTest}
          />
        )}

        {/* ─── Galleries / Before-After ─── */}
        {caseStudy.galleries && caseStudy.galleries.length > 0 && (
          <FadeIn as="section" className={`${cx.sectionY} ${cx.outer}`}>
            <h2 className="mb-[34px] text-[1.625rem] font-bold text-gray-900 dark:text-gray-100">
              Реализация
            </h2>
            <ImageGallery galleries={caseStudy.galleries} />
          </FadeIn>
        )}

        {/* ─── Metrics + Analytics (combined) ─── */}
        {(caseStudy.organicComparison || (caseStudy.analyticsScreenshots && caseStudy.analyticsScreenshots.items.length > 0)) && (
          <FadeIn as="section" className={`${cx.sectionY}`}>
            <div className={cx.outer}>
              <h2 className="mb-[5px] text-[1.625rem] font-bold text-gray-900 dark:text-gray-100">
                Динамика показателей
              </h2>
              {caseStudy.organicComparison && (
                <p className="mb-7 text-sm text-gray-400">{caseStudy.organicComparison.period}</p>
              )}

              {/* Compact comparison table */}
              {caseStudy.organicComparison && (
                <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900">
                  <div className="grid grid-cols-[1fr_80px_80px_64px] border-b border-gray-100 bg-gray-50/70 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:border-white/8 dark:bg-gray-800/50 dark:text-gray-500">
                    <span>Показатель</span>
                    <span className="text-right">До</span>
                    <span className="text-right">После</span>
                    <span className="text-right">Рост</span>
                  </div>
                  {caseStudy.organicComparison.items.map((item, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-[1fr_80px_80px_64px] items-center px-5 py-3.5 ${
                        i < caseStudy.organicComparison!.items.length - 1 ? "border-b border-gray-100 dark:border-white/8" : ""
                      }`}
                    >
                      <span className="text-[14px] font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                      <span className="text-right text-[14px] text-gray-400 dark:text-gray-500">{item.before}</span>
                      <span className="text-right text-[14px] font-semibold text-gray-900 dark:text-gray-100">{item.after}</span>
                      <span className="text-right text-[13px] font-bold text-emerald-600">{item.multiplier}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Analytics screenshots — grid, no scroll */}
              {caseStudy.analyticsScreenshots && caseStudy.analyticsScreenshots.items.length > 0 && (
                <>
                  <p className="mb-4 text-[13px] leading-relaxed text-gray-400 dark:text-gray-500">
                    {caseStudy.analyticsScreenshots.subtitle}
                  </p>
                  <div
                    className={`grid gap-4 ${
                      caseStudy.analyticsScreenshots.items.length === 2
                        ? "grid-cols-1 sm:grid-cols-2"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    }`}
                  >
                    {caseStudy.analyticsScreenshots.items.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAnalyticsLightbox({ index: i })}
                        className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 text-left dark:border-white/10 dark:bg-gray-800"
                      >
                        <img
                          src={item.src}
                          alt={item.caption ?? ""}
                          className="w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25">
                          <ZoomIn className="h-7 w-7 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100" />
                        </div>
                        {item.caption && (
                          <p className="border-t border-gray-100 bg-white px-3 py-2 text-[12px] text-gray-500 dark:border-white/8 dark:bg-gray-900 dark:text-gray-400">
                            {item.caption}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </FadeIn>
        )}

        {/* ─── Results ─── */}
        {caseStudy.showResults !== false && <FadeIn as="section" className={`${cx.sectionY} ${cx.outer}`}>
          <h2 className="mb-[8px] text-[1.625rem] font-bold text-gray-900 dark:text-gray-100">
            Результат
          </h2>
          {caseStudy.resultsIntro && (
            <p className="mb-[21px] text-[15px] text-gray-500 dark:text-gray-400">{caseStudy.resultsIntro}</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
            {caseStudy.results.map((result, index) => (
              <div key={index} className="flex gap-3 rounded-xl border border-gray-200 bg-white px-5 py-5 dark:border-white/10 dark:bg-gray-900">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                <p className="text-[15px] leading-[1.618] text-gray-700 dark:text-gray-300">
                  {result}
                </p>
              </div>
            ))}
          </div>
          {caseStudy.resultsNote && (
            <p className="mt-4 text-[14px] font-medium text-gray-500 dark:text-gray-400">{caseStudy.resultsNote}</p>
          )}
          {caseStudy.resultsAdditional && (
            <div className="mt-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                {caseStudy.resultsAdditional.heading}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {caseStudy.resultsAdditional.items.map((item, i) => (
                  <div key={i} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 dark:border-white/8 dark:bg-gray-900">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                    <p className="text-[14px] leading-[1.6] text-gray-600 dark:text-gray-400">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </FadeIn>}

        {/* ─── Anti-case ─── */}
        {caseStudy.antiCase && (
          <FadeIn as="section" className={`${cx.sectionY} ${cx.outer}`}>
            <div className="rounded-2xl border border-red-100 bg-red-50/60 px-6 py-8 md:px-8 md:py-10 dark:border-red-900/30 dark:bg-red-900/10">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  Антикейс
                </span>
                <h2 className="text-[1.25rem] font-bold text-gray-900 dark:text-gray-100">
                  {caseStudy.antiCase.title}
                </h2>
              </div>
              <p className="mb-[21px] max-w-[700px] text-[15px] leading-[1.618] text-gray-600 dark:text-gray-400">
                {caseStudy.antiCase.description}
              </p>
              {caseStudy.antiCase.stats && caseStudy.antiCase.stats.length > 0 && (
                <ul className="mb-6 space-y-2">
                  {caseStudy.antiCase.stats.map((stat, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-[14px] text-gray-500 dark:text-gray-400">
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-300 dark:bg-red-500/50" />
                      {stat}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-baseline gap-3">
                <span className="text-[1.75rem] font-bold leading-tight text-red-600 md:text-[2rem] dark:text-red-400">
                  {caseStudy.antiCase.result}
                </span>
                <span className="text-[13px] font-medium text-red-400 dark:text-red-500">итоговый результат</span>
              </div>
              {caseStudy.antiCase.decision && (
                <p className="mt-[13px] text-[14px] italic leading-[1.618] text-gray-500 dark:text-gray-400">
                  {caseStudy.antiCase.decision}
                </p>
              )}
            </div>
          </FadeIn>
        )}

        {/* ─── Business Effect — dark accent ─── */}
        {caseStudy.businessEffect && caseStudy.businessEffect.length > 0 && (
          <FadeIn as="section" className={`bg-gray-900 dark:bg-gray-800 ${cx.sectionY}`}>
            <div className={cx.outer}>
              <h2 className="mb-[34px] text-[1.625rem] font-bold text-white">
                Бизнес-эффект
              </h2>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:gap-3.5">
                {caseStudy.businessEffect.map((kpi, i) => (
                  <div key={i} className="rounded-xl bg-white/[0.07] px-5 py-5">
                    <p className="text-[1.0625rem] font-bold leading-snug text-white md:text-[1.125rem]">
                      {kpi.value}
                    </p>
                    <p className="mt-2 text-[13px] font-medium leading-snug text-gray-400">
                      {kpi.label}
                    </p>
                    {kpi.note && (
                      <p className="mt-2 text-[13px] font-semibold text-emerald-400">
                        {kpi.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* ─── Growth Ideas ─── */}
        {caseStudy.showGrowthIdeas !== false && caseStudy.growthIdeas && caseStudy.growthIdeas.items.length > 0 && (
          <FadeIn as="section" className={`${cx.sectionY} ${cx.outer}`}>
            <h2 className="mb-[8px] flex items-center gap-2 text-[1.625rem] font-bold text-gray-900 dark:text-gray-100">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Что можно было протестировать дальше
            </h2>
            <p className="mb-[34px] max-w-[700px] text-sm leading-[1.618] text-gray-400 dark:text-gray-500">
              {caseStudy.growthIdeas.intro}
            </p>
            <div className="grid gap-[13px] md:grid-cols-2">
              {caseStudy.growthIdeas.items.map((idea, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-100 bg-gray-50/50 px-6 py-5 dark:border-white/8 dark:bg-gray-900"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                      Идея
                    </span>
                  </div>
                  <p className="mb-2 text-[15px] font-medium leading-snug text-gray-900 dark:text-gray-100">
                    {idea.title}
                  </p>
                  <p className="text-sm leading-[1.618] text-gray-500 dark:text-gray-400">
                    {idea.paragraphs[0]}
                  </p>
                  {idea.paragraphs[1] && (
                    <p className="mt-1.5 text-sm italic text-gray-400 dark:text-gray-500">
                      {idea.paragraphs[1]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* ─── Closure reason ─── */}
        {caseStudy.closureReason && caseStudy.closureReason.length > 0 && (
          <FadeIn as="section" className={`${cx.sectionY} ${cx.outer}`}>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-7 md:px-8 md:py-8 dark:border-white/10 dark:bg-gray-900">
              <h2 className="mb-[13px] text-[1.25rem] font-bold text-gray-900 dark:text-gray-100">
                Почему проект закрылся
              </h2>
              <div className={`space-y-3 ${cx.text}`}>
                {caseStudy.closureReason.map((item, i) => (
                  <p key={i} className="text-[15px] leading-[1.618] text-gray-600 dark:text-gray-400">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* ─── Learned ─── */}
        {caseStudy.learned.length > 0 && (
          <FadeIn as="section" className={`${cx.sectionY} ${cx.outer}`}>
            <div className="rounded-lg bg-amber-50/60 px-6 py-6 md:px-8 md:py-7 dark:bg-amber-900/10">
              <h2 className="mb-[13px] flex items-center gap-2 text-[1.625rem] font-bold text-gray-900 dark:text-gray-100">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Выводы
              </h2>
              <div className={`space-y-[13px] ${cx.text}`}>
                {caseStudy.learned.map((item, index) => (
                  <p
                    key={index}
                    className="text-base leading-[1.618] text-gray-600 dark:text-gray-400"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* ─── Legal note ─── */}
        {caseStudy.legalNote && (
          <div className={`${cx.outer} pb-[21px]`}>
            <p className="text-[11px] leading-[1.618] text-gray-300 dark:text-gray-600">
              {caseStudy.legalNote}
            </p>
          </div>
        )}

        {/* ═══════════  FINAL CTA  ═══════════ */}
        <section className={`bg-gray-50 dark:bg-gray-900/50 ${cx.sectionY}`}>
          <div className={`text-center ${cx.outer}`}>
            <h2 className="mb-[13px] text-[1.625rem] font-bold text-gray-900 dark:text-gray-100">
              Обсудить проект?
            </h2>
            <p className="mx-auto mb-[34px] max-w-md text-base text-gray-500 dark:text-gray-400">
              Открыт к предложениям в digital-маркетинге, performance и growth.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => setContactOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                <Mail className="h-4 w-4" />
                Связаться
              </button>
              {nextCase && nextCase.id !== caseStudy.id && (
                <Link
                  to={`/case/${nextCase.id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900 sm:w-auto dark:border-white/15 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-white/25 dark:hover:text-gray-100"
                >
                  Следующий кейс
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </section>
      </article>

      {/* Analytics lightbox */}
      {analyticsLightbox && caseStudy.analyticsScreenshots && (
        <ImageModal
          images={caseStudy.analyticsScreenshots.items}
          currentIndex={analyticsLightbox.index}
          onClose={() => setAnalyticsLightbox(null)}
          onNavigate={(index) => setAnalyticsLightbox({ index })}
        />
      )}

      {/* ─── Sticky CTA (bottom-right) ─── */}
      <button
        onClick={() => setContactOpen(true)}
        aria-label="Написать письмо"
        className="fixed bottom-6 right-6 z-50 flex h-12 items-center gap-2 rounded-full bg-gray-900 px-5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl md:bottom-8 md:right-8 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
      >
        <Mail className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Связаться</span>
      </button>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
});
