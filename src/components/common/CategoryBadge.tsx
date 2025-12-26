import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  categoryId: number;
  className?: string;
}

export function CategoryBadge({ categoryId, className }: CategoryBadgeProps) {
  const { categories } = useCategories();
  const category = categories.find(cat => cat.id === categoryId);

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground',
      className
    )}>
      {category?.name || `Category ${categoryId}`}
    </span>
  );
}
