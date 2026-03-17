// Конфигурация данных для портфолио

export interface SkillGroup {
  emoji: string;
  title: string;
  items: string[];
}

export interface GalleryImage {
  src: string;
  caption?: string;
}

export interface GallerySection {
  title: string;
  /** grid — сетка 2-3 колонки, full — во всю ширину, before-after — слайдер сравнения */
  layout: "grid" | "full" | "before-after" | "paired-compare";
  items: GalleryImage[];
  description?: string;
  /** Short checklist shown after images: "Что изменили" */
  changes?: string[];
  /** Compact result card shown after changes */
  result?: { label: string; value: string; note?: string };
  /** Multiple result metrics */
  results?: Array<{ label: string; value: string; note?: string }>;
  /** Labels for paired-compare columns */
  pairLabels?: string[];
}

export interface KPI {
  value: string;
  label: string;
  note?: string;
}

export interface StrategyGroup {
  title: string;
  /** Short uppercase label above card title (e.g. "SEO", "Content", "Growth") */
  label?: string;
  items: string[];
  /** Visually de-emphasize (e.g. experimental track) */
  secondary?: boolean;
}

export interface OrganicComparisonItem {
  label: string;
  before: string;
  after: string;
  multiplier: string;
}

export interface OrganicComparison {
  period: string;
  items: OrganicComparisonItem[];
}

export interface GrowthHypothesis {
  area: string;
  hypothesis: string;
  expectedImpact: string;
  priority: "high" | "medium" | "low";
}

export interface GrowthIdea {
  title: string;
  paragraphs: string[];
}

export interface AntiCase {
  title: string;
  description: string;
  stats?: string[];
  result: string;
  decision?: string;
}

export interface FirstTestBlock {
  title: string;
  paragraphs: string[];
  result: string;
  note?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  subtitle?: string;
  /** Accent line shown above KPI grid in hero (e.g. "+63% рост конверсии органики за 6 месяцев") */
  heroAccent?: string;
  comparisonPeriod?: string;
  niche: string;
  image: string;
  tags: string[];
  tools: string[];
  role: string;
  context: string;
  kpis: KPI[];
  startingPoint?: string[];
  challenge: string[];
  /** Intro line for "Подход" section */
  approach?: string;
  strategyGroups: StrategyGroup[];
  results: string[];
  /** Intro line for results block (e.g. "За период работы с SEO-сайтом (Tilda):") */
  resultsIntro?: string;
  /** Additional results with separate heading */
  resultsAdditional?: { heading: string; items: string[] };
  /** Note between main and additional results */
  resultsNote?: string;
  businessEffect?: KPI[];
  growthPlan?: GrowthHypothesis[];
  growthIdeas?: { intro: string; items: GrowthIdea[] };
  /** Toggle visibility of Results block */
  showResults?: boolean;
  /** Toggle visibility of Growth Ideas block */
  showGrowthIdeas?: boolean;
  learned: string[];
  organicComparison?: OrganicComparison;
  galleries?: GallerySection[];
  analyticsScreenshots?: { title: string; subtitle: string; items: GalleryImage[] };
  heroNote?: string;
  firstTest?: FirstTestBlock;
  galleriesIntro?: string;
  antiCase?: AntiCase;
  closureReason?: string[];
  /** Legal disclaimer shown at the bottom of the case page */
  legalNote?: string;
}

export interface PersonalInfo {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  socialLinks: Array<{
    label: string;
    href: string;
  }>;
  skillGroups: SkillGroup[];
  experience: Array<{
    company: string;
    position: string;
    period: string;
    summary: string;
    bullets: string[];
  }>;
  approach: {
    principles: string[];
    expectations: string[];
    summary?: string;
  };
}

// =====================================
// ДАННЫЕ О ПЕРСОНЕ 
// =====================================
export const personalInfo: PersonalInfo = {
  name: "Михайличенко Андрей",
  title: "Системный digital-маркетолог",
  bio: "Больше 5 лет в digital.\nРаботаю с привлечением, аналитикой и воронками.\nСам внедряю изменения на уровне сайта и процессов.\n\nИщу проект, где можно выстраивать систему роста через гипотезы, данные и техническую реализацию.",
  email: "hello.mikhaylichenko@gmail.com",
  phone: "+7 (918) 597-57-14",
  location: "Ростов-на-Дону, Россия",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
  socialLinks: [
    { label: "Telegram", href: "https://t.me/your_username" },
    { label: "MAX", href: "https://vk.com/your_username" },
    { label: "LinkedIn", href: "https://linkedin.com/in/your_username" },
  ],
  skillGroups: [
    {
      emoji: "📊",
      title: "Системный digital-маркетинг и аналитика",
      items: ["Проектирование воронок", "A/B-тестирование", "Сквозная и событийная аналитика", "Анализ unit-экономики (CPL, CAC)", "Постановка и проверка гипотез"],
    },
    {
      emoji: "🚀",
      title: "Привлечение и оптимизация каналов",
      items: ["Таргетированная реклама", "Контекстная реклама", "Оптимизация рекламных кампаний", "Работа с конверсией лид-воронок", "Тестирование сегментов и форматов"],
    },
    {
      emoji: "🛠",
      title: "Digital-системы и реализация",
      items: ["WordPress / Tilda / Telegraf.js (боты) / квизы (разработка и доработка под задачи маркетинга)", "Оптимизация конверсии сайта", "Настройка GTM и событийной аналитики", "Интеграция с CRM", "Реализация маркетинговых задач на сайте", "Работа с макетами (Figma)"],
    },
  ],
  approach: {
    principles: [
      "Рассматриваю маркетинг как систему: трафик → сайт → аналитика → CRM → обработка заявки",
      "Внедряю изменения через гипотезы и итерации",
      "Принимаю решения на основе данных и поведения пользователей",
      "Фокус на росте конверсии и эффективности каналов",
    ],
    expectations: [
      "Продуктовые или системные проекты, где маркетинг интегрирован в экономику бизнеса",
      "Работа на стыке маркетинга, аналитики и технической реализации",
      "Участие в развитии воронки и пользовательского пути",
      "Возможность влиять на рост и инфраструктуру продукта",
    ],
    summary: "Интересны проекты с возможностью работать с гипотезами и влиять на развитие воронки и показателей привлечения.",
  },
  experience: [
    {
      company: "Московская строительная компания",
      position: "Маркетолог с технической экспертизой",
      period: "2024 — 2025",
      summary: "Маркетинговая команда застройщика (12 жилых комплексов).",
      bullets: [
        "Развивал digital-контур проектов: блог (WP), лендинги и сайт (Tilda), квизы",
        "Реализовал редизайн и структурную переработку сайта (~20 страниц) с фокусом на упрощение навигации и улучшение конверсии",
        "Разработал блог на WordPress как гипотезу дополнительного источника заявок",
        "Настраивал и тестировал рекламные кампании (до 250 000 ₽/мес), анализировал эффективность каналов и форматов",
        "Внедрял технические доработки (JS, скрипты, таблицы) для повышения конверсии и удобства работы",
      ],
    },
    {
      company: "KleverLab",
      position: "Digital-маркетолог (Performance)",
      period: "2019 — 2022",
      summary: "B2C-проекты: недвижимость, медицина, e-commerce, сервисные компании.",
      bullets: [
        "Самостоятельное ведение performance-направления по клиентским проектам (VK, myTarget, FB Ads, Я.Директ)",
        "A/B-тестирование креативов и офферов",
        "Работа над улучшением конверсии посадочных страниц и логики воронки",
        "Интеграция рекламных кабинетов с CRM и аналитикой (Яндекс.Метрика, Google Analytics, GTM)",
        "Участие в проектах по продвижению на Wildberries",
        "Разработка и запуск воронок для инфопродуктов", 
      ],
    },
  ],
};

// =====================================
// кейс - МСК
// =====================================
export { mskDeveloperCase } from "@/data/cases/msk-developer";
export { revitaleClinicCase } from "@/data/cases/revitale-clinic";
export { meEsotericsCase } from "@/data/cases/me-esoterics";

import { mskDeveloperCase } from "@/data/cases/msk-developer";
import { revitaleClinicCase } from "@/data/cases/revitale-clinic";
import { meEsotericsCase } from "@/data/cases/me-esoterics";

export const caseStudies: CaseStudy[] = [
  mskDeveloperCase,
  revitaleClinicCase,
  meEsotericsCase,
];
