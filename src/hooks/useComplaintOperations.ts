import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateComplaintStatus as updateComplaintStatusAPI, deleteComplaint as deleteComplaintAPI, ComplaintData } from '@/services/compliant';

export function useComplaintOperations(refetch: () => void) {
    const { toast } = useToast();
    const [selectedComplaint, setSelectedComplaint] = useState<ComplaintData | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [complaintToDelete, setComplaintToDelete] = useState<ComplaintData | null>(null);

    const handleUpdateStatus = async (status: string) => {
        if (!selectedComplaint || !status) return;

        setIsUpdatingStatus(true);
        try {
            const validStatuses = ['PENDING', 'RECEIVED', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'];
            const statusToSend = validStatuses.includes(status) ? status : status.toUpperCase();

            const response = await updateComplaintStatusAPI(selectedComplaint.id, {
                status: statusToSend,
            });

            if (response && response.success) {
                toast({
                    title: 'Status updated',
                    description: response.message || `Complaint ${selectedComplaint.referenceNumber} status changed.`,
                });

                setSelectedComplaint(null);
                refetch();
            } else {
                toast({
                    title: 'Update failed',
                    description: response?.message || 'Failed to update complaint status.',
                    variant: 'destructive',
                });
            }
        } catch (error: any) {
            console.error('Error updating status:', error);

            const errorMessage = error?.response?.data?.message
                || error?.response?.data?.error
                || error?.message
                || 'Failed to update complaint status. Please try again.';

            toast({
                title: 'Update failed',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleDeleteClick = (complaint: ComplaintData) => {
        setComplaintToDelete(complaint);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!complaintToDelete) return;

        setIsDeleting(true);
        try {
            const response = await deleteComplaintAPI(complaintToDelete.id);

            if (response.success) {
                toast({
                    title: 'Complaint deleted',
                    description: response.message || `Complaint ${complaintToDelete.referenceNumber} has been deleted.`,
                });

                setShowDeleteDialog(false);
                setComplaintToDelete(null);
                if (selectedComplaint?.id === complaintToDelete.id) {
                    setSelectedComplaint(null);
                }

                refetch();
            } else {
                toast({
                    title: 'Delete failed',
                    description: response.message || 'Failed to delete complaint.',
                    variant: 'destructive',
                });
            }
        } catch (error: any) {
            console.error('Error deleting complaint:', error);
            const errorMessage = error?.response?.data?.message
                || error?.response?.data?.error
                || error?.message
                || 'Failed to delete complaint. Please try again.';

            toast({
                title: 'Delete failed',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const closeDeleteDialog = () => {
        setShowDeleteDialog(false);
        setComplaintToDelete(null);
    };

    return {
        selectedComplaint,
        setSelectedComplaint,
        isUpdatingStatus,
        isDeleting,
        showDeleteDialog,
        complaintToDelete,
        handleUpdateStatus,
        handleDeleteClick,
        handleDeleteConfirm,
        closeDeleteDialog,
    };
}