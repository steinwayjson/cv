import { memo, useEffect, useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, CheckCircle2, Lightbulb, ChevronDown, ZoomIn, ShieldBan, Filter, CircleStop } from "lucide-react";
import { HeroCase } from "./HeroCase";
import { ImageGallery } from "./ImageGallery";
import { ImageModal } from "./ImageModal";
import { ContactModal } from "./ContactModal";
import { FadeIn } from "./FadeIn";
import type { CaseStudy, FirstTestBlock } from "@/data/portfolioData";

interface CaseLayoutProps {
  caseStudy: CaseStudy;
  nextCase?: CaseStudy;
}

/* ─── Токены разметки ─── */
const cx = {
  outer: "mx-auto max-w-[1800px] px-6 md:px-12",
  text: "max-w-[700px]",
  sectionY: "py-16 md:py-32",
};

/* ─── Карточка подхода (аккордеон на мобилке) ─── */
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
        ? "border-border/50 bg-accent/40 opacity-85"
        : "border-border bg-card md:hover:-translate-y-1 md:hover:shadow-md"
    }`}>
      {/* Метка */}
      {group.label && (
        <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {group.label}
        </span>
      )}
      {/* Заголовок */}
      <h3 className="mb-[13px] text-[1.25rem] font-semibold leading-snug">
        {group.title}
      </h3>
      {/* Пункты */}
      <ul className="flex-1 space-y-2.5">
        {group.items.map((item, ii) => {
          const isLast = ii >= group.items.length - 2;
          const isHiddenMobile = !expanded && ii >= MOBILE_VISIBLE_ITEMS;
          return (
            <li
              key={ii}
              className={`flex gap-2.5 text-[14px] leading-[1.618] md:text-[15px] ${
                isLast
                  ? "font-medium text-foreground/80"
                  : "text-muted-foreground"
              } ${isHiddenMobile ? "hidden md:flex" : "flex"}`}
            >
              <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/30" />
              <span className="max-w-[420px]">{item}</span>
            </li>
          );
        })}
      </ul>
      {/* Раскрыть на мобилке */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground md:hidden"
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
      {/* ── Контекст ── */}
      {context && (
        <FadeIn className={`py-12 md:py-20 ${cx.outer}`}>
          <div className="grid md:grid-cols-12 gap-8 md:gap-12">
            <div className="md:col-span-3">
              <div className="sticky top-32">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-1 h-16 bg-primary/50" />
                  <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
                    Контекст
                  </h3>
                </div>
              </div>
            </div>
            <div className="md:col-span-9">
              <div className="p-8 md:p-10 rounded-3xl bg-accent/30 border border-border">
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  {context}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {/* ── Исходные данные ── */}
      {hasMetrics && (
        <FadeIn className={`py-12 md:py-20 ${cx.outer}`}>
          <div className="mb-12">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-1 h-12 bg-primary" />
              <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
                Исходные данные
              </h3>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
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
                    className="p-8 rounded-3xl bg-background border-l-4 border-t border-r border-b border-orange-500 hover:shadow-lg transition-shadow duration-500"
                  >
                    <div className="text-4xl md:text-5xl font-medium text-orange-500 mb-4">
                      {value}
                    </div>
                    <h4 className="text-base md:text-lg font-medium mb-2">{label}</h4>
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  className="p-8 rounded-3xl bg-background border-l-4 border-t border-r border-b border-orange-500 hover:shadow-lg transition-shadow duration-500"
                >
                  <p className="text-base font-medium text-foreground/80">{item}</p>
                </div>
              );
            })}
          </div>
        </FadeIn>
      )}

      {/* ── Подход + карточки стратегий ── */}
      {(approach || activeGroups.length > 0) && (
        <FadeIn as="section" className={`py-16 md:py-24 ${cx.outer}`}>
          {/* Заголовок */}
          <div className="mb-12">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-1 h-12 bg-primary" />
              <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
                Подход
              </h3>
            </div>
            {approach && (
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
                {approach}
              </p>
            )}
          </div>

          {/* Первый тест */}
          {firstTest && (
            <div className="mb-8 p-8 md:p-10 rounded-3xl bg-accent/30 border border-border">
              <h3 className="text-xl md:text-2xl font-medium mb-4">
                {firstTest.title}
              </h3>
              <div className={`space-y-3 ${cx.text}`}>
                {firstTest.paragraphs.map((p, i) => (
                  <p key={i} className="text-base leading-relaxed text-muted-foreground">{p}</p>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Результат</span>
                <span className="text-base font-medium">{firstTest.result}</span>
              </div>
              {firstTest.note && (
                <p className="mt-2 text-sm italic text-muted-foreground">{firstTest.note}</p>
              )}
            </div>
          )}

          {/* Колонки стратегий */}
          <div className={`grid gap-6 md:gap-8 ${cols}`}>
            {activeGroups.map((group, gi) => (
              <FadeIn key={gi} delay={gi * 100}>
                <div className="p-8 rounded-3xl bg-background border border-border hover:border-primary/30 transition-[border-color] duration-300 h-full">
                  {group.label && (
                    <div className="mb-6 pb-4 border-b border-border">
                      <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium">
                        {group.label}
                      </span>
                    </div>
                  )}
                  <h4 className="text-xl md:text-2xl font-medium mb-6 leading-tight">
                    {group.title}
                  </h4>
                  <ul className="space-y-3">
                    {group.items.map((item, ii) => (
                      <li key={ii} className="flex items-start gap-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                        <span className="w-1 h-1 rounded-full bg-primary shrink-0 mt-2" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      )}
    </>
  );
}

/**
 * Общий шаблон страницы кейса.
 * Все кейсы рендерятся через этот компонент — никакой кастомной разметки.
 */
export const CaseLayout = memo(function CaseLayout({
  caseStudy,
  nextCase,
}: CaseLayoutProps) {
  /* Полоса прогресса скролла — обновляется через DOM напрямую */
  const progressRef = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);
  const [analyticsLightbox, setAnalyticsLightbox] = useState<{ index: number } | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  const visibleGalleries = caseStudy.galleries?.filter((g) => !g.hidden);

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
    <div className="overflow-hidden">
      {/* Полоса прогресса */}
      <div ref={progressRef} className="scroll-progress" />

      {/* ═══════════  Шапка кейса  ═══════════ */}
      <HeroCase caseStudy={caseStudy} />

      {/* ═══════════  Содержимое  ═══════════ */}
      <article>
        {/* ─── Роль ─── */}
        <FadeIn className={`py-16 md:py-24 ${cx.outer}`} as="section">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12">
            <div className="md:col-span-3">
              <div className="sticky top-32">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-1 h-16 bg-primary" />
                  <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
                    Роль
                  </h3>
                </div>
              </div>
            </div>
            <div className="md:col-span-9">
              <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
                {caseStudy.role}
              </p>
            </div>
          </div>
        </FadeIn>


        {/* ─── Контекст и подход ─── */}
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

        {/* ─── Галереи / до-после ─── */}
        {visibleGalleries && visibleGalleries.length > 0 && (
            <FadeIn as="section" className={`${cx.sectionY} ${cx.outer}`}>
              <div className="flex items-baseline gap-6 md:gap-8 mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
                  Реализация
                </h2>
              </div>
              <ImageGallery galleries={visibleGalleries} />
            </FadeIn>
        )}

        {/* ─── Метрики и аналитика ─── */}
        {(caseStudy.organicComparison || (caseStudy.analyticsScreenshots && caseStudy.analyticsScreenshots.items.length > 0)) && (
          <FadeIn as="section" className={`${cx.sectionY}`}>
            <div className={cx.outer}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-3 tracking-tight">
                Динамика показателей
              </h2>
              {caseStudy.organicComparison && (
                <p className="mb-10 text-base text-muted-foreground">{caseStudy.organicComparison.period}</p>
              )}

              {/* Таблица сравнения */}
              {caseStudy.organicComparison && (
                <div className="mb-8 overflow-x-auto overflow-hidden rounded-3xl border border-border bg-background">
                  <div className="grid min-w-[400px] grid-cols-4 gap-4 p-6 bg-accent/30 border-b border-border">
                    <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium">Показатель</span>
                    <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium text-right">До</span>
                    <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium text-right">После</span>
                    <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium text-right">Рост</span>
                  </div>
                  {caseStudy.organicComparison.items.map((item, i) => (
                    <div
                      key={i}
                      className={`grid min-w-[400px] grid-cols-4 gap-4 p-6 hover:bg-accent/20 transition-colors ${
                        i < caseStudy.organicComparison!.items.length - 1 ? "border-b border-border/50" : ""
                      }`}
                    >
                      <span className="font-medium">{item.label}</span>
                      <span className="text-right text-muted-foreground">{item.before}</span>
                      <span className="text-right font-medium">{item.after}</span>
                      <span className="text-right font-medium text-primary flex items-center justify-end gap-1">{item.multiplier}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Сноска к таблице */}
              {caseStudy.organicComparison?.note && (
                <p className="mb-8 -mt-5 text-[12px] leading-[1.618] text-muted-foreground">
                  {caseStudy.organicComparison.note}
                </p>
              )}

              {/* Скриншоты аналитики */}
              {caseStudy.analyticsScreenshots && caseStudy.analyticsScreenshots.items.length > 0 && (
                <>
                  <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">
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
                        className="group relative overflow-hidden rounded-xl border border-border bg-accent text-left"
                      >
                        <img
                          src={item.src}
                          alt={item.caption || "Скриншот аналитики"}
                          width={640}
                          height={400}
                          className="w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25">
                          <ZoomIn className="h-7 w-7 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100" />
                        </div>
                        {item.caption && (
                          <p className="border-t border-border bg-card px-3 py-2 text-[12px] text-muted-foreground">
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

        {/* ─── Результаты ─── */}
        {caseStudy.showResults !== false && <FadeIn as="section" className={`${cx.sectionY} ${cx.outer}`}>
          <div className="mb-8 flex items-center gap-6">
            <div className="w-1 h-12 bg-primary" />
            <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
              Что изменили
            </h3>
          </div>
          {caseStudy.resultsIntro && (
            <p className="mb-6 text-base text-muted-foreground">{caseStudy.resultsIntro}</p>
          )}
          <div className="space-y-4">
            {caseStudy.results.map((result, index) => (
              <div key={index} className="flex items-start gap-4 p-5 bg-accent/30 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm md:text-base leading-relaxed">{result}</p>
              </div>
            ))}
          </div>
          {caseStudy.resultsNote && (
            <p className="mt-6 text-sm text-muted-foreground">{caseStudy.resultsNote}</p>
          )}
          {caseStudy.resultsAdditional && (
            <div className="mt-8">
              <div className="mb-6 flex items-center gap-6">
                <div className="w-1 h-8 bg-primary/50" />
                <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
                  {caseStudy.resultsAdditional.heading}
                </h3>
              </div>
              <div className="space-y-3">
                {caseStudy.resultsAdditional.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 bg-accent/20 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm md:text-base leading-relaxed text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </FadeIn>}

        {/* ─── Антикейс ─── */}
        {caseStudy.antiCase && caseStudy.showAntiCase !== false && (
          <FadeIn as="section" className={`${cx.sectionY} ${cx.outer}`}>
            <div className="rounded-2xl border border-red-100 bg-red-50/60 px-6 py-8 md:px-8 md:py-10 dark:border-red-900/30 dark:bg-red-900/10">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  Антикейс
                </span>
                <h2 className="text-[1.25rem] font-bold text-foreground">
                  {caseStudy.antiCase.title}
                </h2>
              </div>
              <p className="mb-[21px] max-w-[700px] text-[15px] leading-[1.618] text-muted-foreground">
                {caseStudy.antiCase.description}
              </p>
              {caseStudy.antiCase.stats && caseStudy.antiCase.stats.length > 0 && (
                <ul className="mb-6 space-y-2">
                  {caseStudy.antiCase.stats.map((stat, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-[14px] text-muted-foreground">
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
                <p className="mt-[13px] text-[14px] italic leading-[1.618] text-muted-foreground">
                  {caseStudy.antiCase.decision}
                </p>
              )}
            </div>
          </FadeIn>
        )}

        {/* ─── Бизнес-эффект ─── */}
        {caseStudy.businessEffect && caseStudy.businessEffect.length > 0 && (
          <FadeIn as="section" className={`bg-accent/30 ${cx.sectionY}`}>
            <div className={cx.outer}>
              <div className="flex items-baseline gap-6 md:gap-8 mb-10 md:mb-14">
                <span className="text-5xl font-light text-muted-foreground/20 select-none">
                  ★
                </span>
                <h2 className="text-2xl md:text-4xl font-medium tracking-tight">
                  Бизнес-эффект
                </h2>
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 md:gap-6">
                {caseStudy.businessEffect.map((kpi, i) => (
                  <div key={i} className="p-6 md:p-8 bg-card border border-border rounded-2xl">
                    <p className="text-2xl md:text-3xl font-medium mb-2">
                      {kpi.value}
                    </p>
                    <p className="text-sm text-muted-foreground leading-snug">
                      {kpi.label}
                    </p>
                    {kpi.note && (
                      <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {kpi.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* ─── Идеи для роста ─── */}
        {caseStudy.showGrowthIdeas !== false && caseStudy.growthIdeas && caseStudy.growthIdeas.items.length > 0 && (
          <FadeIn as="section" className={`${cx.sectionY} ${cx.outer}`}>
            <div className="flex items-center gap-4 mb-4">
              <Lightbulb className="w-6 h-6 text-primary" />
              <h3 className="text-2xl md:text-3xl font-medium">
                Что можно было протестировать дальше
              </h3>
            </div>
            <p className="mb-10 max-w-3xl text-base leading-relaxed text-muted-foreground">
              {caseStudy.growthIdeas.intro}
            </p>
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              {caseStudy.growthIdeas.items.map((idea, i) => (
                <div
                  key={i}
                  className="p-6 md:p-8 rounded-3xl border border-border bg-background hover:border-primary/30 transition-[border-color] duration-300"
                >
                  <div className="mb-4 pb-3 border-b border-border">
                    <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium">
                      Идея
                    </span>
                  </div>
                  <p className="mb-3 text-base md:text-lg font-medium leading-snug">
                    {idea.title}
                  </p>
                  <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
                    {idea.paragraphs[0]}
                  </p>
                  {idea.paragraphs[1] && (
                    <p className="mt-2 text-sm italic text-muted-foreground">
                      {idea.paragraphs[1]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* ─── Причина закрытия ─── */}
        {caseStudy.closureChain && caseStudy.closureChain.length > 0 ? (
          <FadeIn as="section" className="border-t border-border pt-[55px] pb-[34px] md:pt-[89px] md:pb-[55px]">
            <div className={cx.outer}>
              <h2 className="mb-[34px] text-[1.625rem] font-bold text-foreground">
                Почему проект закрылся
              </h2>
              <div className="flex flex-col items-center gap-3 md:flex-row md:items-start md:gap-0">
                {caseStudy.closureChain.map((step, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center md:flex-row md:items-start">
                    {/* Карточка шага */}
                    <div className="flex flex-1 flex-col items-center text-center px-3 md:px-4">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                        {step.icon === "ban" && <ShieldBan className="h-6 w-6 text-red-500 dark:text-red-400" />}
                        {step.icon === "funnel" && <Filter className="h-6 w-6 text-amber-500 dark:text-amber-400" />}
                        {step.icon === "stop" && <CircleStop className="h-6 w-6 text-muted-foreground" />}
                      </div>
                      <p className="max-w-[220px] text-[14px] leading-[1.5] text-muted-foreground">
                        {step.text}
                      </p>
                    </div>
                    {/* Стрелка между шагами */}
                    {i < caseStudy.closureChain!.length - 1 && (
                      <>
                        <ArrowRight className="my-1 hidden h-5 w-5 flex-shrink-0 text-muted-foreground/50 md:mt-4 md:block" />
                        <ChevronDown className="my-1 h-5 w-5 flex-shrink-0 rotate-0 text-muted-foreground/50 md:hidden" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        ) : caseStudy.closureReason && caseStudy.closureReason.length > 0 ? (
          <FadeIn as="section" className={`${cx.sectionY} ${cx.outer}`}>
            <div className="rounded-2xl border border-border bg-accent px-6 py-7 md:px-8 md:py-8">
              <h2 className="mb-[13px] text-[1.25rem] font-bold text-foreground">
                Почему проект закрылся
              </h2>
              <div className={`space-y-3 ${cx.text}`}>
                {caseStudy.closureReason.map((item, i) => (
                  <p key={i} className="text-[15px] leading-[1.618] text-muted-foreground">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </FadeIn>
        ) : null}

        {/* ─── Выводы ─── */}
        {caseStudy.learned.length > 0 && (
          <FadeIn as="section" className={`${cx.sectionY} ${cx.outer}`}>
            <div className="flex items-center gap-4 mb-12">
              <Lightbulb className="w-8 h-8 text-primary" />
              <h3 className="text-2xl md:text-3xl font-medium">Выводы</h3>
            </div>
            <div className="space-y-8">
              {caseStudy.learned.map((item, index) => (
                <div key={index} className="grid md:grid-cols-12 gap-6 md:gap-8 group">
                  <div className="md:col-span-2">
                    <div className="text-5xl md:text-6xl font-light text-primary/30 group-hover:text-primary/50 transition-colors">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="md:col-span-10">
                    <div className="p-6 md:p-8 rounded-2xl bg-accent/20 border border-border/50 hover:border-primary/30 hover:bg-accent/40 transition-[border-color,background-color] duration-300">
                      <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                        {item}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* ─── Юридическая сноска ─── */}
        {caseStudy.legalNote && (
          <div className={`${cx.outer} pb-[21px]`}>
            <p className="text-[11px] leading-[1.618] text-muted-foreground/50">
              {caseStudy.legalNote}
            </p>
          </div>
        )}

        {/* ═══════════  Блок «Связаться»  ═══════════ */}
        <section className="py-16 md:py-24 border-t border-border">
          <div className={`text-center ${cx.outer}`}>
            <h2 className="text-2xl md:text-3xl font-medium mb-4">
              Есть вопросы?
            </h2>
            <p className="mx-auto mb-8 max-w-md text-base text-muted-foreground">
              Свяжитесь или посмотрите следующий кейс.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
              >
                <Mail className="h-5 w-5" />
                Связаться
              </button>
              {nextCase && nextCase.id !== caseStudy.id && (
                <Link
                  to={`/case/${nextCase.id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-8 py-4 text-sm font-medium transition-colors hover:bg-accent sm:w-auto"
                >
                  Следующий кейс
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </section>
      </article>

      {/* Просмотр скриншотов аналитики */}
      {analyticsLightbox && caseStudy.analyticsScreenshots && (
        <ImageModal
          images={caseStudy.analyticsScreenshots.items}
          currentIndex={analyticsLightbox.index}
          onClose={() => setAnalyticsLightbox(null)}
          onNavigate={(index) => setAnalyticsLightbox({ index })}
        />
      )}

      {/* ─── Плавающая кнопка «Связаться» ─── */}
      <button
        type="button"
        onClick={() => setContactOpen(true)}
        aria-label="Связаться"
        className="fixed bottom-6 right-6 z-[60] flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg transition-opacity hover:opacity-90 md:bottom-8 md:right-8"
      >
        <Mail className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Связаться</span>
      </button>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
});
