import { ComplaintCategory, categoryLabels } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: ComplaintCategory;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground',
      className
    )}>
      {categoryLabels[category]}
    </span>
  );
}
