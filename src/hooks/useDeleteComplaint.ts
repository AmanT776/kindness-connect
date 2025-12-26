import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteComplaint as deleteComplaintAPI } from '@/services/compliant';

export function useDeleteComplaint() {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteComplaint = async (complaintId: number, onSuccess?: () => void) => {
        setIsDeleting(true);
        try {
            const response = await deleteComplaintAPI(complaintId);

            if (response.success) {
                toast({
                    title: 'Complaint deleted',
                    description: response.message || `Complaint has been deleted.`,
                });

                if (onSuccess) {
                    onSuccess();
                }
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

    return {
        deleteComplaint,
        isDeleting,
    };
}
