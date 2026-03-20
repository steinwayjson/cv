import { personalInfo, caseStudies } from "@/data/portfolioData";
import { CaseCard } from "@/app/components/CaseCard";
import { FadeIn } from "@/app/components/FadeIn";
import { Mail, MapPin, Phone, ArrowDown } from "lucide-react";

const cx = {
  outer: "mx-auto max-w-[1140px] px-6 sm:px-8",
};

export function HomePage() {
  return (
    <div className="min-h-screen bg-white transition-colors duration-300 dark:bg-gray-950">

      {/* ═══════  HERO  ═══════ */}
      <section className="flex items-center border-b border-gray-100 bg-white md:min-h-[70vh] dark:border-white/8 dark:bg-gray-950">
        <div className={`w-full py-[34px] md:py-[89px] ${cx.outer}`}>
          <div className="grid items-center gap-[34px] md:grid-cols-[1.618fr_1fr] md:gap-[55px]">
            {/* Left */}
            <div>
              <h1 className="mb-[8px] text-[2.0625rem] font-bold leading-[1.12] text-[#1a1a1a] md:text-[2.625rem] dark:text-gray-100">
                {personalInfo.name}
              </h1>
              <p className="mb-[5px] text-[1.25rem] font-semibold text-[#1a1a1a] md:mb-[8px] dark:text-gray-100">
                {personalInfo.title}
              </p>
              <p className="mb-[5px] max-w-[560px] text-[14px] leading-[1.618] text-gray-500 md:mb-[21px] md:text-[15px] dark:text-gray-400">
                Работаю на стыке маркетинга, продукта и технической реализации
              </p>
              <p className="mb-[21px] max-w-[600px] text-[15px] leading-[1.618] text-[#333] md:mb-[34px] md:text-[17px] dark:text-gray-300">
                {personalInfo.bio}
              </p>

              {/* Contacts */}
              <div className="mb-[21px] flex flex-col gap-[8px] text-[14px] text-gray-400 md:mb-[34px] md:flex-row md:flex-wrap md:items-center md:gap-x-[21px] md:gap-y-[8px] md:text-[13px] dark:text-gray-500">
                <a href={`mailto:${personalInfo.email}`} className="inline-flex items-center gap-1.5 transition-colors hover:text-gray-900 dark:hover:text-gray-200">
                  <Mail className="h-3.5 w-3.5" />
                  {personalInfo.email}
                </a>
                <a href={`tel:${personalInfo.phone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-1.5 transition-colors hover:text-gray-900 dark:hover:text-gray-200">
                  <Phone className="h-3.5 w-3.5" />
                  {personalInfo.phone}
                </a>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {personalInfo.location}
                </span>
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-[13px] md:flex-row md:gap-[13px]">
                <a
                  href="#cases"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 md:w-auto md:justify-start dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  Смотреть кейсы
                  <ArrowDown className="h-3.5 w-3.5" />
                </a>
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900 md:w-auto md:justify-start md:border md:border-gray-200 md:bg-white md:text-gray-700 md:hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:md:border-gray-700 dark:md:bg-gray-900 dark:md:text-gray-300 dark:md:hover:border-gray-600"
                >
                  Скачать резюме PDF
                </a>
              </div>

              {/* Mobile avatar */}
              <div className="mt-8 flex justify-center md:hidden">
                <img
                  src={personalInfo.avatar}
                  alt={personalInfo.name}
                  width={220}
                  height={220}
                  loading="lazy"
                  decoding="async"
                  className="h-[220px] w-[220px] rounded-2xl object-cover"
                />
              </div>
            </div>

            {/* Right — avatar (desktop) */}
            <div className="hidden md:block">
              <img
                src={personalInfo.avatar}
                alt={personalInfo.name}
                width={224}
                height={224}
                decoding="async"
                className="h-48 w-48 rounded-2xl object-cover lg:h-56 lg:w-56"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════  SKILLS  ═══════ */}
      <FadeIn as="section" className="bg-gray-50 py-[55px] md:py-[89px] dark:bg-gray-900/50">
        <div className={cx.outer}>
          <h2 className="mb-[34px] text-[1.625rem] font-bold text-[#1a1a1a] md:text-[2.0625rem] dark:text-gray-100">
            Ключевая экспертиза
          </h2>
          <div className="grid gap-[34px] md:grid-cols-3">
            {personalInfo.skillGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-[13px] text-base font-semibold text-[#1a1a1a] dark:text-gray-200">
                  {group.title}
                </h3>
                <ul className="space-y-[8px]">
                  {group.items.map((skill) => (
                    <li
                      key={skill}
                      className="flex gap-2.5 text-[15px] leading-[1.618] text-[#444] dark:text-gray-400"
                    >
                      <span className="mt-[8px] h-1 w-1 flex-shrink-0 rounded-full bg-gray-400 dark:bg-gray-600" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* ═══════  EXPERIENCE  ═══════ */}
      <FadeIn as="section" className="bg-white py-[55px] md:py-[89px] dark:bg-gray-950" id="experience">
        <div className={cx.outer}>
          <h2 className="mb-[34px] text-[1.625rem] font-bold text-[#1a1a1a] md:text-[2.0625rem] dark:text-gray-100">
            Опыт работы
          </h2>
          <div className="relative space-y-[34px] border-l-2 border-gray-100 pl-[34px] md:space-y-[55px] md:pl-[34px] dark:border-gray-800">
            {personalInfo.experience.map((exp, index) => (
              <div key={index} className="relative">
                {/* Timeline dot */}
                <span className="absolute -left-[calc(34px+5px)] top-1 h-2.5 w-2.5 rounded-full border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-950" />

                <p className="mb-1 text-[13px] font-medium text-gray-400 dark:text-gray-500">
                  {exp.period}
                </p>
                <h3 className="mb-0.5 text-lg font-bold text-[#1a1a1a] dark:text-gray-100">
                  {exp.position}
                </h3>
                <p className="mb-3 text-[15px] font-medium text-gray-500 dark:text-gray-400">
                  {exp.company}
                </p>
                <p className="mb-[13px] max-w-[700px] text-[15px] leading-[1.618] text-[#444] dark:text-gray-400">
                  {exp.summary}
                </p>
                <ul className="max-w-[700px] space-y-1.5">
                  {exp.bullets.map((bullet, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-[14px] leading-[1.618] text-gray-500 dark:text-gray-500"
                    >
                      <span className="mt-[8px] h-1 w-1 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* ═══════  CASES  ═══════ */}
      <FadeIn as="section" className="bg-gray-50 py-[55px] md:py-[89px] dark:bg-gray-900/50" id="cases">
        <div className={cx.outer}>
          <h2 className="mb-[34px] text-[1.625rem] font-bold text-[#1a1a1a] md:text-[2.0625rem] dark:text-gray-100">
            Кейсы
          </h2>
          <div className="grid gap-[21px] md:grid-cols-2">
            {caseStudies.map((cs, i) => (
              <CaseCard key={cs.id} caseStudy={cs} featured={i === 0 && caseStudies.length > 2} />
            ))}
          </div>
        </div>
      </FadeIn>

      {/* ═══════  APPROACH  ═══════ */}
      <FadeIn as="section" className="bg-white py-[55px] md:py-[89px] dark:bg-gray-950">
        <div className={cx.outer}>
          <h2 className="mb-[34px] text-[1.625rem] font-bold text-[#1a1a1a] md:text-[2.0625rem] dark:text-gray-100">
            Подход к работе
          </h2>
          <div className="grid gap-[34px] md:grid-cols-2 md:gap-[55px]">
            {/* Principles */}
            <div>
              <h3 className="mb-[13px] text-[15px] font-semibold text-[#1a1a1a] dark:text-gray-200">
                Принципы
              </h3>
              <ul className="space-y-[13px]">
                {personalInfo.approach.principles.map((p, i) => (
                  <li
                    key={i}
                    className="flex gap-[13px] text-[15px] leading-[1.618] text-[#444] dark:text-gray-400"
                  >
                    <span className="mt-[10px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Expectations */}
            <div>
              <h3 className="mb-[13px] text-[15px] font-semibold text-[#1a1a1a] dark:text-gray-200">
                Формат и ожидания
              </h3>
              <ul className="space-y-[13px]">
                {personalInfo.approach.expectations.map((e, i) => (
                  <li
                    key={i}
                    className="flex gap-[13px] text-[15px] leading-[1.618] text-[#444] dark:text-gray-400"
                  >
                    <span className="mt-[10px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-[34px] max-w-[700px] text-[15px] leading-[1.618] text-gray-500 dark:text-gray-400">
            Интересны проекты, где могу влиять на рост, воронку и цифровую инфраструктуру.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
