// Types
export interface Role {
    id: number;
    name: string;
    isActive: boolean;
    description: string;
}

export interface RolesResponse {
    success: boolean;
    message: string;
    data: Role[];
}

// API Functions
export const fetchRoles = async (): Promise<RolesResponse> => {
    try {
        const response = await fetch('/roles');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: RolesResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching roles:', error);
        throw error;
    }
};

// Helper function to get active roles only
export const fetchActiveRoles = async (): Promise<Role[]> => {
    try {
        const response = await fetchRoles();
        if (response.success) {
            return response.data.filter(role => role.isActive);
        }
        throw new Error(response.message || 'Failed to fetch roles');
    } catch (error) {
        console.error('Error fetching active roles:', error);
        throw error;
    }
};

// Helper function to get role by ID
export const getRoleById = async (roleId: number): Promise<Role | null> => {
    try {
        const response = await fetchRoles();
        if (response.success) {
            return response.data.find(role => role.id === roleId) || null;
        }
        return null;
    } catch (error) {
        console.error('Error getting role by ID:', error);
        return null;
    }
};

// Helper function to get role by name
export const getRoleByName = async (roleName: string): Promise<Role | null> => {
    try {
        const response = await fetchRoles();
        if (response.success) {
            return response.data.find(role => role.name.toLowerCase() === roleName.toLowerCase()) || null;
        }
        return null;
    } catch (error) {
        console.error('Error getting role by name:', error);
        return null;
    }
};