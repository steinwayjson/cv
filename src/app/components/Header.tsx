import { memo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { personalInfo } from "@/data/portfolioData";
import { ThemeToggle } from "./ThemeToggle";
import { ContactModal } from "./ContactModal";

export const Header = memo(function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
      {/* Пропустить к содержимому (доступность) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[60] focus:rounded focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow"
      >
        Перейти к содержимому
      </a>
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-4 md:py-5 flex items-center justify-between">
        <Link to="/" className="group flex flex-col">
          <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-0.5">
            Portfolio
          </span>
          <span className="font-medium text-lg tracking-tight text-foreground group-hover:opacity-60 transition-opacity">
            {personalInfo.name}
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-5" aria-label="Основная навигация">
          {isHome ? (
            <>
              <a href="#experience" className="hidden sm:block text-sm tracking-wide text-muted-foreground hover:text-foreground transition-colors">
                Опыт
              </a>
              <a href="#cases" className="hidden sm:block text-sm tracking-wide text-muted-foreground hover:text-foreground transition-colors">
                Кейсы
              </a>
            </>
          ) : (
            <Link to="/" className="hidden sm:block text-sm tracking-wide text-muted-foreground hover:text-foreground transition-colors">
              ← Назад
            </Link>
          )}
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="shrink-0 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity sm:px-5"
          >
            Связаться
          </button>
        </nav>
      </div>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </header>
  );
});
