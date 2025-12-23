import api from "./api";

export interface Category {
    id: number;
    name: string;
    isActive: boolean;
}

export const getCategories = async (): Promise<Category[]> => {
    try {
        const response = await api.get("/org/categories/active");
        console.log("Categories API response:", response.data);
        console.log("Response data type:", typeof response.data);
        console.log("Is array?", Array.isArray(response.data));

        // Handle API response format: { success: true, message: "...", data: [...] }
        if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
            // Check if response has a data property with an array
            if (Array.isArray(response.data.data)) {
                console.log("Found categories in response.data.data:", response.data.data);
                return response.data.data;
            }
            // Check if response has a categories property with an array
            if (Array.isArray(response.data.categories)) {
                console.log("Found categories in response.data.categories:", response.data.categories);
                return response.data.categories;
            }
        }

        // If it's already an array, return it directly
        if (Array.isArray(response.data)) {
            console.log("Response.data is already an array:", response.data);
            return response.data;
        }

        // Fallback to empty array if structure is unexpected
        console.error("Unexpected categories response structure:", response.data);
        console.error("Response keys:", Object.keys(response.data || {}));
        return [];
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};
