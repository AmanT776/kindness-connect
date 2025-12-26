import api from "./api";

import { PublicOrganizationalUnit as OrganizationalUnit } from '../types/organizational-unit';

export type { OrganizationalUnit };

export const getOrganizationalUnitsByParentId = async (parentId: number): Promise<OrganizationalUnit[]> => {
    try {
        const response = await api.get(`/units/parent/${parentId}`);
        console.log("Organizational units API response:", response.data);

        // Handle API response format: { success: true, message: "...", data: [...] }
        if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
            // Check if response has a data property with an array
            if (Array.isArray(response.data.data)) {
                return response.data.data;
            }
            // Check if response has a units property with an array
            if (Array.isArray(response.data.units)) {
                return response.data.units;
            }
        }

        // If it's already an array, return it directly
        if (Array.isArray(response.data)) {
            return response.data;
        }

        // Fallback to empty array if structure is unexpected
        console.error("Unexpected organizational units response structure:", response.data);
        return [];
    } catch (error) {
        console.error("Error fetching organizational units:", error);
        throw error;
    }
};

