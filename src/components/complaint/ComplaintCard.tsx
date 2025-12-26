import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ComplaintData } from '@/services/compliant';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { Calendar, Paperclip, User, UserX } from 'lucide-react';
import { format } from 'date-fns';

interface ComplaintCardProps {
  complaint: ComplaintData;
  showSubmitter?: boolean;
  linkTo?: string;
}

export function ComplaintCard({ complaint, showSubmitter = false, linkTo }: ComplaintCardProps) {
  const content = (
    <Card className="transition-all hover:shadow-md hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{complaint.referenceNumber}</p>
            <h3 className="font-semibold text-base leading-tight line-clamp-2">{complaint.title}</h3>
          </div>
          <StatusBadge status={complaint.status} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{complaint.description}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <CategoryBadge categoryId={complaint.categoryId} />

          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(complaint.createdAt), 'MMM d, yyyy')}
          </span>

          {complaint.files && complaint.files.length > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5" />
              {complaint.files.length}
            </span>
          )}

          {showSubmitter && (
            <span className="flex items-center gap-1">
              {complaint.isAnonymous ? (
                <>
                  <UserX className="h-3.5 w-3.5" />
                  Anonymous
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5" />
                  User {complaint.userId || 'N/A'}
                </>
              )}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }

  return content;
}
