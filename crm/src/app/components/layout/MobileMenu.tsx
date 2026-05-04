import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 z-50 rounded-t-lg shadow-xl p-4 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Меню</h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <nav className="space-y-2">
          <Link
            to="/dashboard"
            onClick={onClose}
            className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Вакансии
          </Link>
          <Link
            to="/analytics"
            onClick={onClose}
            className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Аналитика
          </Link>
          <Link
            to="/settings"
            onClick={onClose}
            className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Настройки
          </Link>
        </nav>
      </div>
    </>
  );
}
