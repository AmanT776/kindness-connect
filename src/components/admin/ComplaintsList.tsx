import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplaintData } from '@/services/compliant';
import { User, UserX, Calendar, Filter, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Category {
    id: number;
    name: string;
}

interface ComplaintsListProps {
    complaints: ComplaintData[];
    isLoading: boolean;
    onComplaintClick: (complaint: ComplaintData) => void;
    getCategoryName: (categoryId: number) => string;
    getStatusDisplay: (status: string) => { label: string; className: string };
}

export function ComplaintsList({
    complaints,
    isLoading,
    onComplaintClick,
    getCategoryName,
    getStatusDisplay
}: ComplaintsListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>All Complaints</CardTitle>
                <CardDescription>
                    {complaints.length} complaint(s) found
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {complaints.map((complaint) => {
                            const statusDisplay = getStatusDisplay(complaint.status);
                            return (
                                <div
                                    key={complaint.id}
                                    className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => onComplaintClick(complaint)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {complaint.referenceNumber}
                                            </span>
                                            {complaint.isAnonymous ? (
                                                <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded">
                                                    <UserX className="h-3 w-3" /> Anonymous
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                    <User className="h-3 w-3" /> Identified
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-medium truncate">{complaint.title}</h3>
                                        <p className="text-sm text-muted-foreground truncate mt-1">
                                            {complaint.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                                            {getCategoryName(complaint.categoryId)}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusDisplay.className}`}>
                                            {statusDisplay.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(complaint.createdAt), 'MMM d')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {complaints.length === 0 && (
                            <div className="text-center py-12">
                                <Filter className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-lg font-medium">No complaints found</h3>
                                <p className="text-muted-foreground mt-1">
                                    Try adjusting your search or filter criteria.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}