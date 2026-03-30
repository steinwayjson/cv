import { personalInfo, caseStudies } from "@/data/portfolioData";
import { FadeIn } from "@/app/components/FadeIn";
import { Mail, MapPin, Phone, FileText, ArrowUpRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="overflow-hidden">

      {/* ═══════  Шапка (Hero)  ═══════ */}
      <section className="relative min-h-[85vh] flex items-center">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 pt-32 pb-20 md:pt-40 md:pb-28 w-full">
          <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-start">
            {/* Левая колонка */}
            <div className="md:col-span-7">
              <div className="mb-8">
                <span className="text-xs md:text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4 block">
                  Digital Marketing • Development
                </span>
                <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-medium leading-[0.95] tracking-tight mb-6">
                  {personalInfo.name.split(" ").reverse().join("\n").split("\n").map((part, i) => (
                    <span key={i}>
                      {i > 0 && <br />}
                      {part}
                    </span>
                  ))}
                </h1>
              </div>

              <div className="max-w-xl space-y-5">
                <p className="text-sm font-medium text-foreground/80">
                  {personalInfo.title}
                </p>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  {personalInfo.bio.trim()}
                </p>

                {/* Контакты */}
                <div className="flex flex-col gap-2 text-sm text-muted-foreground pt-2">
                  <a href={`mailto:${personalInfo.email}`} className="inline-flex items-center gap-2 hover:text-foreground transition-colors">
                    <Mail className="h-3.5 w-3.5" />
                    {personalInfo.email}
                  </a>
                  <a href={`tel:${personalInfo.phone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-2 hover:text-foreground transition-colors">
                    <Phone className="h-3.5 w-3.5" />
                    {personalInfo.phone}
                  </a>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    {personalInfo.location}
                  </span>
                </div>

                {/* Кнопки */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <a
                    href="#cases"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    Смотреть кейсы
                  </a>
                  <a
                    href="/Mikhaylichenko_Andrey_CV.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full hover:bg-accent transition-colors text-sm font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    Скачать резюме
                  </a>
                </div>
              </div>

              {/* Аватар на мобилке */}
              <div className="mt-10 flex justify-center md:hidden">
                <div className="relative w-[260px]">
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-stone-100/60 to-neutral-200/40 dark:from-zinc-800/40 dark:to-zinc-900/30 blur-xl" />
                  <div className="relative rounded-3xl overflow-hidden
                    bg-gradient-to-b from-stone-50 via-neutral-100 to-stone-200
                    dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900
                    shadow-[inset_0_0_40px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_0_40px_rgba(0,0,0,0.3)]">
                  <img
                    src="/images/home-hero-white.webp"
                    alt={personalInfo.name}
                    width={260}
                    height={347}
                    loading="eager"
                    {...{fetchpriority: "high"}}
                    decoding="async"
                    className="relative w-full aspect-[3/4] object-cover dark:hidden"
                  />
                  <img
                    src="/images/home-hero-black.webp"
                    alt={personalInfo.name}
                    width={260}
                    height={347}
                    loading="eager"
                    {...{fetchpriority: "high"}}
                    decoding="async"
                    className="relative w-full aspect-[3/4] object-cover hidden dark:block"
                  />
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка — аватар (десктоп) */}
            <div className="hidden md:block md:col-span-5">
              <div className="relative">
                <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-b from-stone-100/60 to-neutral-200/40 dark:from-zinc-800/40 dark:to-zinc-900/30 blur-xl" />
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden
                  bg-gradient-to-b from-stone-50 via-neutral-100 to-stone-200
                  dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900
                  shadow-[inset_0_0_60px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_0_60px_rgba(0,0,0,0.3)]">
                  <img
                    src="/images/home-hero-white.webp"
                    alt={personalInfo.name}
                    width={400}
                    height={533}
                    loading="eager"
                    {...{fetchpriority: "high"}}
                    decoding="async"
                    className="h-full w-full object-cover dark:hidden"
                  />
                  <img
                    src="/images/home-hero-black.webp"
                    alt={personalInfo.name}
                    width={400}
                    height={533}
                    loading="eager"
                    {...{fetchpriority: "high"}}
                    decoding="async"
                    className="h-full w-full object-cover hidden dark:block"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Декоративная линия */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* ═══════  Навыки (01)  ═══════ */}
      <FadeIn as="section" className="py-16 md:py-32">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <div className="flex items-baseline gap-6 md:gap-8 mb-12 md:mb-16">
            <span className="text-6xl md:text-8xl font-light text-muted-foreground/20 select-none">
              01
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight">
              Ключевая экспертиза
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {personalInfo.skillGroups.map((group, index) => (
              <FadeIn key={group.title} delay={index * 100}>
                <div className="border-l-2 border-primary/20 pl-6">
                  <h3 className="text-xl md:text-2xl font-medium mb-6">
                    {group.title}
                  </h3>
                  <ul className="space-y-3">
                    {group.items.map((item) => (
                      <li key={item} className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* ═══════  Опыт (02)  ═══════ */}
      <FadeIn as="section" className="py-16 md:py-32 bg-accent/30" id="experience">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <div className="flex items-baseline gap-6 md:gap-8 mb-12 md:mb-16">
            <span className="text-6xl md:text-8xl font-light text-muted-foreground/20 select-none">
              02
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight">
              Опыт работы
            </h2>
          </div>

          <div className="space-y-10 md:space-y-14">
            {personalInfo.experience.map((exp, index) => (
              <FadeIn key={index} delay={index * 100}>
                <div className="grid md:grid-cols-12 gap-6 md:gap-12">
                  {/* Период */}
                  <div className="md:col-span-3">
                    <p className="text-sm tracking-[0.15em] uppercase text-muted-foreground mb-1">
                      {exp.period}
                    </p>
                    <p className="text-sm text-muted-foreground/60">
                      {exp.company}
                    </p>
                  </div>
                  {/* Содержимое */}
                  <div className="md:col-span-9">
                    <h3 className="text-xl md:text-2xl font-medium mb-3">
                      {exp.position}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {exp.summary}
                    </p>
                    <ul className="space-y-2">
                      {exp.bullets.map((bullet, i) => (
                        <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                          <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-primary/30" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {index < personalInfo.experience.length - 1 && (
                  <div className="mt-10 md:mt-14 h-px bg-border" />
                )}
              </FadeIn>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* ═══════  Кейсы (03)  ═══════ */}
      <FadeIn as="section" className="py-16 md:py-32" id="cases">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <div className="flex items-baseline gap-6 md:gap-8 mb-12 md:mb-16">
            <span className="text-6xl md:text-8xl font-light text-muted-foreground/20 select-none">
              03
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight">
              Кейсы
            </h2>
          </div>

          <div className="space-y-8 md:space-y-12">
            {caseStudies.map((cs, index) => (
              <FadeIn key={cs.id} delay={index * 100}>
                <Link
                  to={`/case/${cs.id}`}
                  className="group grid md:grid-cols-12 gap-6 md:gap-12 p-6 md:p-10 bg-card rounded-3xl border border-border hover:border-primary/30 transition-[border-color] duration-300"
                >
                  {/* Изображение */}
                  <div className="md:col-span-5 relative overflow-hidden rounded-2xl bg-accent aspect-video">
                    <img
                      src={cs.image}
                      alt={cs.title}
                      width={1920}
                      height={1080}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 px-4 py-2 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>

                  {/* Содержимое */}
                  <div className="md:col-span-7 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
                          {cs.niche}
                        </span>
                      </div>

                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium mb-4 group-hover:text-primary/80 transition-colors">
                        {cs.title}
                      </h3>

                      <p className="text-muted-foreground mb-6 leading-relaxed text-sm md:text-base">
                        {cs.context.length > 180 ? cs.context.slice(0, 180) + "\u2026" : cs.context}
                      </p>

                      {/* Метрики */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                        {cs.kpis.slice(0, 3).map((kpi) => (
                          <div key={kpi.label} className="p-3 md:p-4 bg-accent/50 rounded-xl">
                            <TrendingUp className="w-4 h-4 mb-1.5 text-emerald-500" />
                            <div className="text-xl md:text-2xl font-medium mb-1">{kpi.value}</div>
                            <div className="text-[11px] md:text-xs text-muted-foreground">{kpi.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Теги */}
                      <div className="flex flex-wrap gap-2">
                        {cs.tags.map((tag) => (
                          <span key={tag} className="px-3 py-1 text-xs rounded-full bg-primary/10 text-foreground/70">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium mt-6 group-hover:gap-4 transition-[gap] duration-300">
                      Читать кейс
                      <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* ═══════  Подход (04)  ═══════ */}
      <FadeIn as="section" className="py-16 md:py-32 bg-accent/30">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <div className="flex items-baseline gap-6 md:gap-8 mb-12 md:mb-16">
            <span className="text-6xl md:text-8xl font-light text-muted-foreground/20 select-none">
              04
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight">
              Подход к работе
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-16">
            {/* Принципы */}
            <div className="border-l-2 border-primary/20 pl-6">
              <h3 className="text-xl md:text-2xl font-medium mb-6">
                Принципы
              </h3>
              <ul className="space-y-4">
                {personalInfo.approach.principles.map((p, i) => (
                  <li key={i} className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Ожидания */}
            <div className="border-l-2 border-primary/20 pl-6">
              <h3 className="text-xl md:text-2xl font-medium mb-6">
                Формат и ожидания
              </h3>
              <ul className="space-y-4">
                {personalInfo.approach.expectations.map((e, i) => (
                  <li key={i} className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {personalInfo.approach.summary && (
            <p className="mt-12 max-w-2xl text-base italic text-muted-foreground">
              {personalInfo.approach.summary}
            </p>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
