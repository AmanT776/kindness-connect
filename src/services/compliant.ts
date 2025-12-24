import api from "./api";

export interface ComplaintData {
    id: number;
    referenceNumber: string;
    title: string;
    description: string;
    isAnonymous: boolean;
    status: string;
    organizationalUnitId: number;
    categoryId: number;
    userId: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface ComplaintResponse {
    success: boolean;
    message: string;
    data: ComplaintData;
}

export interface ComplaintsListResponse {
    success: boolean;
    message: string;
    data: ComplaintData[];
}

export const createComplaint = async (data: FormData): Promise<ComplaintResponse> => {
    // Log FormData contents for debugging
    console.log("FormData contents:");
    for (const [key, value] of data.entries()) {
        console.log(`${key}:`, value);
    }
    
    try {
        const res = await api.post("/compliant/", data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    } catch (error: any) {
        console.error("Error creating complaint:", error);
        console.error("Error response:", error?.response?.data);
        console.error("Error status:", error?.response?.status);
        console.error("Error message:", error?.message);
        throw error;
    }
};

export const getComplaintByReference = async (referenceNumber: string): Promise<ComplaintResponse> => {
    try {
        const res = await api.get(`/compliant/reference/${referenceNumber}`);
        return res.data;
    } catch (error: any) {
        console.error("Error fetching complaint:", error);
        console.error("Error response:", error?.response?.data);
        console.error("Error status:", error?.response?.status);
        throw error;
    }
};

export const getAllComplaints = async (): Promise<ComplaintsListResponse> => {
    try {
        const res = await api.get("/compliant/");
        return res.data;
    } catch (error: any) {
        console.error("Error fetching complaints:", error);
        console.error("Error response:", error?.response?.data);
        console.error("Error status:", error?.response?.status);
        throw error;
    }
};

export interface UpdateStatusRequest {
    status: string;
}

export interface UpdateStatusResponse {
    success: boolean;
    message: string;
    data?: ComplaintData;
}

export const updateComplaintStatus = async (id: number, data: UpdateStatusRequest): Promise<UpdateStatusResponse> => {
    try {
        // Ensure the data format is correct: { "status": "UNDER_REVIEW" }
        const requestData = {
            status: data.status
        };
        
        console.log("Updating complaint status - Request payload:", JSON.stringify(requestData));
        console.log("Request URL:", `/compliant/${id}/status`);
        
        const res = await api.patch(`/compliant/${id}/status`, requestData);
        console.log("Update status response:", res.data);
        return res.data;
    } catch (error: any) {
        console.error("Error updating complaint status:", error);
        console.error("Error response:", error?.response?.data);
        console.error("Error status:", error?.response?.status);
        throw error;
    }
};

export interface DeleteComplaintResponse {
    success: boolean;
    message: string;
}

export const deleteComplaint = async (id: number): Promise<DeleteComplaintResponse> => {
    try {
        console.log("Deleting complaint - Request URL:", `/compliant/${id}`);
        
        const res = await api.delete(`/compliant/${id}`);
        console.log("Delete complaint response:", res.data);
        return res.data;
    } catch (error: any) {
        console.error("Error deleting complaint:", error);
        console.error("Error response:", error?.response?.data);
        console.error("Error status:", error?.response?.status);
        throw error;
    }
};
