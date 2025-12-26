import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'RECEIVED': 'bg-blue-100 text-blue-800 border-blue-300',
    'UNDER_REVIEW': 'bg-purple-100 text-purple-800 border-purple-300',
    'RESOLVED': 'bg-green-100 text-green-800 border-green-300',
    'CLOSED': 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const statusLabels: Record<string, string> = {
    'PENDING': 'Pending',
    'RECEIVED': 'Received',
    'UNDER_REVIEW': 'Under Review',
    'RESOLVED': 'Resolved',
    'CLOSED': 'Closed',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-300',
      className
    )}>
      {statusLabels[status] || status}
    </span>
  );
}
