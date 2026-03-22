import { memo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { personalInfo } from "@/data/portfolioData";
import { ThemeToggle } from "./ThemeToggle";
import { ContactModal } from "./ContactModal";

const navLink = "text-sm font-medium text-gray-400 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-200";

export const Header = memo(function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur transition-colors duration-300 supports-[backdrop-filter]:bg-white/60 dark:border-white/8 dark:bg-gray-950/90 dark:supports-[backdrop-filter]:bg-gray-950/70">
      {/* Пропустить к содержимому (доступность) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-gray-900 focus:shadow dark:focus:bg-gray-800 dark:focus:text-gray-100"
      >
        Перейти к содержимому
      </a>
      <div className="mx-auto flex h-[55px] max-w-[1140px] items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="На главную" className="flex items-center gap-2.5 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-[13px] font-bold text-white transition-colors group-hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:group-hover:bg-gray-200">
            MA
          </span>
          <span className="hidden text-[15px] font-bold text-gray-900 sm:block dark:text-gray-100">
            {personalInfo.name}
          </span>
        </Link>
        <nav aria-label="Основная навигация" className="flex items-center gap-5">
          {isHome ? (
            <>
              <a href="#experience" className={navLink}>Опыт</a>
              <a href="#cases" className={navLink}>Кейсы</a>
            </>
          ) : (
            <Link to="/" className={navLink}>Главная</Link>
          )}
          <ThemeToggle />
          <button
            onClick={() => setContactOpen(true)}
            className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Связаться
          </button>
        </nav>
      </div>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </header>
  );
});
