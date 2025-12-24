import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ComplaintData } from '@/services/compliant';
import { UserX, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface ComplaintDetailDialogProps {
    complaint: ComplaintData | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateStatus: (status: string) => Promise<void>;
    onDeleteClick: (complaint: ComplaintData) => void;
    getCategoryName: (categoryId: number) => string;
    getUnitName: (unitId: number) => string;
    getStatusDisplay: (status: string) => { label: string; className: string };
    isUpdatingStatus: boolean;
}

export function ComplaintDetailDialog({
    complaint,
    isOpen,
    onClose,
    onUpdateStatus,
    onDeleteClick,
    getCategoryName,
    getUnitName,
    getStatusDisplay,
    isUpdatingStatus
}: ComplaintDetailDialogProps) {
    const [newStatus, setNewStatus] = useState<string>('');

    const handleUpdateStatus = async () => {
        if (!newStatus) return;
        await onUpdateStatus(newStatus);
        setNewStatus('');
    };

    if (!complaint) return null;

    const statusDisplay = getStatusDisplay(complaint.status);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">{complaint.referenceNumber}</p>
                            <DialogTitle className="mt-1">{complaint.title}</DialogTitle>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusDisplay.className}`}>
                            {statusDisplay.label}
                        </span>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Submitter Info */}
                    <div className="rounded-lg bg-muted/50 p-4">
                        {complaint.isAnonymous ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <UserX className="h-4 w-4" />
                                <span>Submitted anonymously</span>
                            </div>
                        ) : (
                            <div>
                                <p className="font-medium">Identified User</p>
                                <p className="text-sm text-muted-foreground">User ID: {complaint.userId || 'N/A'}</p>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">{complaint.description}</p>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Category</p>
                            <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium mt-1 inline-block">
                                {getCategoryName(complaint.categoryId)}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Organizational Unit</p>
                            <p className="text-sm font-medium mt-1">{getUnitName(complaint.organizationalUnitId)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Submitted</p>
                            <p className="text-sm font-medium mt-1">
                                {format(new Date(complaint.createdAt), 'MMM d, yyyy h:mm a')}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Last Updated</p>
                            <p className="text-sm font-medium mt-1">
                                {format(new Date(complaint.updatedAt), 'MMM d, yyyy h:mm a')}
                            </p>
                        </div>
                    </div>

                    {/* Status Update */}
                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Update Status</h4>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select new status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="RECEIVED">Received</SelectItem>
                                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleUpdateStatus} disabled={!newStatus || isUpdatingStatus}>
                                {isUpdatingStatus ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-between">
                    <Button
                        variant="destructive"
                        onClick={() => onDeleteClick(complaint)}
                        className="mr-auto"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}