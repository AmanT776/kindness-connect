import { useQuery } from "@tanstack/react-query";
import { getAllComplaints, getComplaintsByUserId, getComplaintsByOrgId, ComplaintData } from "@/services/compliant";

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

export const useUserComplaints = (userId: number | undefined) => {
    const { data, isLoading, error, refetch } = useQuery<ComplaintData[]>({
        queryKey: ["userComplaints", userId],
        queryFn: async () => {
            if (!userId) {
                return [];
            }
            const response = await getComplaintsByUserId(userId);
            return response.data;
        },
        enabled: !!userId, // Only run query if userId is provided
    });

    const complaints = Array.isArray(data) ? data : [];

    return {
        complaints,
        isLoading,
        error,
        refetch,
    };
};

export const useOrgComplaints = (orgId: number | undefined) => {
    const { data, isLoading, error, refetch } = useQuery<ComplaintData[]>({
        queryKey: ["orgComplaints", orgId],
        queryFn: async () => {
            console.log("Fetching complaints for orgId:", orgId);
            if (!orgId) {
                return [];
            }
            const response = await getComplaintsByOrgId(orgId);
            console.log("Org complaints response:", response);
            return response.data;
        },
        enabled: !!orgId, // Only run query if orgId is provided
    });

    const complaints = Array.isArray(data) ? data : [];

    return {
        complaints,
        isLoading,
        error,
        refetch,
    };
};
