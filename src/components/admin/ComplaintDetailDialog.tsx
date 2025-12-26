import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserData, getStaffUserById } from '@/services/users';
import { ComplaintData } from '@/services/compliant';
import { UserX, Loader2, Trash2, Paperclip, File, ExternalLink, User, Mail, Phone, BadgeCheck } from 'lucide-react';
import { format } from 'date-fns';

import { FilePreview } from './FilePreview';

interface ComplaintDetailDialogProps {
    complaint: ComplaintData | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateStatus?: (status: string) => Promise<void>;
    onDeleteClick?: (complaint: ComplaintData) => void;
    getCategoryName: (categoryId: number) => string;
    getUnitName: (unitId: number) => string;
    getStatusDisplay: (status: string) => { label: string; className: string };
    isUpdating?: boolean;
    readOnly?: boolean;
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
    isUpdating,
    readOnly = false
}: ComplaintDetailDialogProps) {
    const [newStatus, setNewStatus] = useState<string>('');
    const [userDetails, setUserDetails] = useState<UserData | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (complaint && !complaint.isAnonymous && complaint.userId) {
                setIsLoadingUser(true);
                try {
                    const data = await getStaffUserById(complaint.userId);
                    setUserDetails(data);
                } catch (error) {
                    console.error("Failed to fetch user details", error);
                } finally {
                    setIsLoadingUser(false);
                }
            } else {
                setUserDetails(null);
            }
        };

        if (isOpen) {
            fetchUserDetails();
        } else {
            // Reset when closed
            setUserDetails(null);
        }
    }, [complaint, isOpen]);

    const handleUpdateStatus = async () => {
        if (!newStatus || !onUpdateStatus) return;
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
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-primary font-medium border-b border-primary/10 pb-2">
                                    <BadgeCheck className="h-4 w-4" />
                                    <span>Identified User Details</span>
                                </div>

                                {isLoadingUser ? (
                                    <div className="flex items-center gap-2 text-muted-foreground py-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Loading user info...</span>
                                    </div>
                                ) : userDetails ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-start gap-2">
                                            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="font-medium">{userDetails.fullName}</p>
                                                <p className="text-xs text-muted-foreground">{userDetails.roleName}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div className="break-all">
                                                <p>{userDetails.email}</p>
                                            </div>
                                        </div>

                                        {userDetails.phoneNumber && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span>{userDetails.phoneNumber}</span>
                                            </div>
                                        )}

                                        {userDetails.organizationalUnitName && (
                                            <div className="col-span-1 sm:col-span-2 text-xs bg-background/50 p-2 rounded border">
                                                <span className="text-muted-foreground">Unit: </span>
                                                <span className="font-medium">{userDetails.organizationalUnitName}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-sm text-yellow-600">
                                        User ID: {complaint.userId} (Details unavailable)
                                    </div>
                                )}
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

                    {/* File Attachments */}
                    {complaint.files && complaint.files.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                                <h4 className="font-medium">Attachments ({complaint.files.length})</h4>
                            </div>
                            <div className="space-y-3">
                                {complaint.files.map((file) => {
                                    // Extract just the filename from the full path
                                    // Handles both forward and backward slashes
                                    const fileName = file.file_path.split(/[/\\]/).pop() || 'Unknown file';

                                    // Construct backend URL - assuming backend serves /uploads/ statically
                                    const fileUrl = `http://localhost:8080/uploads/${fileName}`;

                                    // Check if it's an image based on file extension
                                    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(fileName);

                                    return (
                                        <div key={file.id} className="rounded-lg border p-3 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{fileName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Uploaded {format(new Date(file.createdAt), 'MMM d, yyyy')}
                                                    </p>
                                                </div>
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:text-primary/80 transition-colors"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </div>
                                            {isImage && (
                                                <div className="mt-2">
                                                    <img
                                                        src={fileUrl}
                                                        alt={fileName}
                                                        className="max-w-full h-auto rounded border"
                                                        style={{ maxHeight: '400px' }}
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Status Update */}
                    {!readOnly && (
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
                                <Button onClick={handleUpdateStatus} disabled={!newStatus || isUpdating}>
                                    {isUpdating ? (
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
                    )}
                </div>

                <DialogFooter className="flex justify-between">
                    {!readOnly && onDeleteClick && (
                        <Button
                            variant="destructive"
                            onClick={() => onDeleteClick(complaint)}
                            className="mr-auto"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose} className={readOnly ? "w-full sm:w-auto ml-auto" : ""}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}