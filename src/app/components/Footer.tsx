import { memo } from "react";
import { personalInfo } from "@/data/portfolioData";
import { Mail } from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

export const Footer = memo(function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white transition-colors duration-300 dark:border-white/8 dark:bg-gray-950">
      <div className="mx-auto flex max-w-[1140px] flex-col items-center justify-between gap-4 px-5 py-[34px] sm:flex-row sm:px-8">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{personalInfo.name}</p>
          <a
            href={`mailto:${personalInfo.email}`}
            className="inline-flex items-center gap-1.5 text-[13px] text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <Mail className="h-3.5 w-3.5" />
            {personalInfo.email}
          </a>
        </div>

        <nav className="flex items-center gap-5">
          {personalInfo.socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="text-[13px] font-medium text-gray-400 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="text-[12px] text-gray-300 dark:text-gray-600">
          © {CURRENT_YEAR}
        </p>
      </div>
    </footer>
  );
});
