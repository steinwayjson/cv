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
  /** Короткий чеклист, отображаемый после изображений: "Что изменили" */
  changes?: string[];
  /** Скрыть галерею без удаления данных */
  hidden?: boolean;
  /** Компактная карточка результата, отображаемая после изменений */
  result?: { label: string; value: string; note?: string };
  /** Несколько метрик результата */
  results?: Array<{ label: string; value: string; note?: string }>;
  /** Метки для колонки paired-compare */
  pairLabels?: string[];
}

export interface KPI {
  value: string;
  label: string;
  note?: string;
}

export interface StrategyGroup {
  title: string;
  /** Короткая заглавная метка над заголовком карточки (например, "SEO", "Content", "Growth") */
  label?: string;
  items: string[];
  /** Визуально деэмфазировать (например, экспериментальная ветка) */
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
  /** Сноска под таблицей */
  note?: string;
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

export interface ClosureStep {
  icon: "ban" | "funnel" | "stop";
  text: string;
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
  /** Акцентная строка, отображаемая над сеткой KPI в блоке hero */
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
  /** Вступительная строка для блока "Подход" */
  approach?: string;
  strategyGroups: StrategyGroup[];
  results: string[];
  /** Вступительная строка для блока результатов ("За период работы с SEO-сайтом (Tilda):") */
  resultsIntro?: string;
  /** Дополнительные результаты с отдельным заголовком */
  resultsAdditional?: { heading: string; items: string[] };
  /** Примечание между основными и дополнительными результатами */
  resultsNote?: string;
  businessEffect?: KPI[];
  growthPlan?: GrowthHypothesis[];
  growthIdeas?: { intro: string; items: GrowthIdea[] };
  /** Блок результатов */
  showResults?: boolean;
  /** Блок идей для роста */
  showGrowthIdeas?: boolean;
  learned: string[];
  organicComparison?: OrganicComparison;
  galleries?: GallerySection[];
  analyticsScreenshots?: { title: string; subtitle: string; items: GalleryImage[] };
  heroNote?: string;
  firstTest?: FirstTestBlock;
  galleriesIntro?: string;
  antiCase?: AntiCase;
  /** Показывать блок антикейса (по умолчанию true) */
  showAntiCase?: boolean;
  closureReason?: string[];
  closureChain?: ClosureStep[];
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
  title: "Digital-маркетолог с техническим уклоном",
  bio: "\nПомогаю улучшать конверсию и эффективность digital-каналов: от трафика до сайта и воронки. Работаю на стыке маркетинга, аналитики и технической реализации: привлекаю трафик и улучшаю продуктовую часть — сайт, структуру, точки конверсии.",
  email: "hello.mikhaylichenko@gmail.com",
  phone: "+7 (918) 597-57-14",
  location: "Ростов-на-Дону, Россия",
  avatar: "/images/avatar.jpg",
  socialLinks: [
    { label: "Telegram", href: "https://t.me/steinwayjson" },
    { label: "MAX", href: "https://max.ru/u/f9LHodD0cOJaOrKfEt-E8DUm40SdAIJxULy6xP8Jp_IC5EW6YXcJWbPIazc" },
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
      "Проекты, где маркетинг влияет на экономику бизнеса",
      "Работа на стыке маркетинга, аналитики и технической реализации",
      "Влияние на воронку и пользовательский путь",
      "Возможность влиять на рост и инфраструктуру продукта",
    ],
    summary: "Интересно строить системы, которые генерируют выручку.",
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
      company: "Фриланс",
      position: "Digital-маркетолог",
      period: "2022 — 2024",
      summary: "Проектная работа, самообучение и развитие технического стека.",
      bullets: [
        "Ведение клиентских проектов по привлечению и работе с сайтами",
        "Разработка и запуск воронок для инфопродуктов",
        "Изучал фронтенд и расширял технический стек: вёрстка, JavaScript, WordPress, Telegram-боты",
      ],
    },
    {
      company: "KleverLab",
      position: "Digital-маркетолог (Performance)",
      period: "2019 — 2022",
      summary: "B2C-проекты: недвижимость, медицина, e-commerce, сервисные компании.",
      bullets: [
        "Самостоятельное ведение performance-направления по ~18 клиентским проектам (VK, myTarget, FB Ads, Я.Директ), бюджеты до 300 000 ₽/мес",
        "A/B-тестирование креативов и офферов; разбор посадочных, корректировки для клиентов, разработка квизов",
        "Работа над улучшением конверсии посадочных страниц и логики воронки",
        "Интеграция рекламных кабинетов с CRM и аналитикой (Яндекс.Метрика, Google Analytics, GTM), подготовка отчётов для клиентов",
        "Участие в проектах по продвижению на Wildberries",
      ],
    },
  ],
};

// =====================================
// Кейсы
// =====================================
import { mskDeveloperCase } from "@/data/cases/msk-developer";
import { revitaleClinicCase } from "@/data/cases/revitale-clinic";
import { meEsotericsCase } from "@/data/cases/me-esoterics";

export const caseStudies: CaseStudy[] = [
  mskDeveloperCase,
  revitaleClinicCase,
  meEsotericsCase,
];
