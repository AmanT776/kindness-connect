import { ComplaintStatus, statusLabels } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles: Record<ComplaintStatus, string> = {
    received: 'bg-warning/15 text-warning-foreground border-warning/30',
    under_review: 'bg-info/15 text-info border-info/30',
    resolved: 'bg-success/15 text-success border-success/30',
    closed: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      statusStyles[status],
      className
    )}>
      {statusLabels[status]}
    </span>
  );
}
