import { useQuery } from "@tanstack/react-query";
import { getAllComplaints, ComplaintData } from "@/services/compliant";

export const useComplaintsList = () => {
    const { data, isLoading, error, refetch } = useQuery<ComplaintData[]>({
        queryKey: ["complaints"],
        queryFn: async () => {
            const response = await getAllComplaints();
            return response.data;
        },
    });

    const complaints = Array.isArray(data) ? data : [];

    return {
        complaints,
        isLoading,
        error,
        refetch,
    };
};

