import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useState } from 'react';
import { MobileMenu } from './MobileMenu';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="text-xl font-bold">
            WWWWORK
          </Link>

          <div className="hidden md:flex gap-6">
            <Link
              to="/dashboard"
              className={`pb-1 ${
                isActive('/dashboard')
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Вакансии
            </Link>
            <Link
              to="/analytics"
              className={`pb-1 ${
                isActive('/analytics')
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Аналитика
            </Link>
            <Link
              to="/settings"
              className={`pb-1 ${
                isActive('/settings')
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Настройки
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <a
            href="https://hh.ru"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            hh↗
          </a>
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            tg↗
          </a>
          <a
            href="https://andrey-mikhaylichenko.ru"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            сайт↗
          </a>

          <button
            onClick={toggleTheme}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </nav>
  );
}
