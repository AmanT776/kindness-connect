import api from "./api";

export interface ComplaintResponse {
    success: boolean;
    message: string;
    data: {
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
    };
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
