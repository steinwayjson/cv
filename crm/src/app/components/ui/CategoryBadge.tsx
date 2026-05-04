import type { Category } from '../../lib/types';

interface CategoryBadgeProps {
  category: Category;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const getStyle = () => {
    switch (category) {
      case 'горячая':
        return 'text-[#EF4444] bg-[#FEF2F2] border-[#FECACA]';
      case 'норм':
        return 'text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]';
      case 'мимо':
        return 'text-[#6B7280] bg-[#F9FAFB] border-[#E5E7EB]';
    }
  };

  return (
    <span className={`inline-block px-2 py-1 rounded border text-xs font-medium ${getStyle()}`}>
      {category}
    </span>
  );
}
