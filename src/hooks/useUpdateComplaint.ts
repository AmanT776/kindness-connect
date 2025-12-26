import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateComplaint, UpdateComplaintRequest } from '@/services/compliant';

export const useUpdateComplaint = () => {
    const [isUpdating, setIsUpdating] = useState(false);
    const { toast } = useToast();

    const update = async (id: number, data: UpdateComplaintRequest, onSuccess?: () => void) => {
        setIsUpdating(true);
        try {
            await updateComplaint(id, data);

            toast({
                title: 'Success',
                description: 'Complaint updated successfully',
            });

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message
                || error?.message
                || 'Failed to update complaint';

            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
            throw error;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        update,
        isUpdating,
    };
};
