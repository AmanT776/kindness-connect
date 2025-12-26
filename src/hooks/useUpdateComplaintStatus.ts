import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateComplaintStatus as updateComplaintStatusAPI } from '@/services/compliant';

interface UseUpdateComplaintStatusOptions {
    onSuccess?: () => void;
}

export function useUpdateComplaintStatus(options?: UseUpdateComplaintStatusOptions) {
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);

    const updateStatus = async (complaintId: number, status: string, referenceNumber?: string) => {
        setIsUpdating(true);
        try {
            const validStatuses = ['PENDING', 'RECEIVED', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'];
            const statusToSend = validStatuses.includes(status) ? status : status.toUpperCase();

            const response = await updateComplaintStatusAPI(complaintId, {
                status: statusToSend,
            });

            if (response && response.success) {
                toast({
                    title: 'Status updated',
                    description: response.message || `Complaint ${referenceNumber || complaintId} status changed.`,
                });

                options?.onSuccess?.();
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
            setIsUpdating(false);
        }
    };

    return {
        updateStatus,
        isUpdating,
    };
}
