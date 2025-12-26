import api from './api';

// Types
export interface OrganizationalUnit {
    id: number;
    name: string;
    parentId: number;
    unitTypeId: number;
    unitEmail: string;
    phoneNumber: string;
    remark: string;
    status: number;
    currentUserId: number;
}

export interface OrganizationalUnitsResponse {
    success: boolean;
    message: string;
    data: OrganizationalUnit[];
}

export interface OrganizationalUnitResponse {
    success: boolean;
    message: string;
    data: OrganizationalUnit;
}

export interface CreateOrganizationalUnitData {
    name: string;
    unitTypeId: number;
    unitEmail: string;
    phoneNumber: string;
    remark: string;
    status: number;
    currentUserId: number;
}

export interface UpdateOrganizationalUnitData {
    name: string;
    unitTypeId: number;
    unitEmail: string;
    phoneNumber: string;
    remark: string;
    status: number;
    currentUserId: number;
}

export const fetchOrganizationalUnits = async (): Promise<OrganizationalUnitsResponse> => {
    try {
        const response = await api.get<OrganizationalUnitsResponse>('/units');
        return response.data;
    } catch (error) {
        console.error('Error fetching organizational units:', error);
        throw error;
    }
};

export const createOrganizationalUnit = async (unitData: CreateOrganizationalUnitData): Promise<OrganizationalUnitResponse> => {
    try {
        // Automatically set parentId to 1
        const dataWithParent = {
            ...unitData,
            parentId: 1
        };
        const response = await api.post<OrganizationalUnitResponse>('/units', dataWithParent);
        return response.data;
    } catch (error) {
        console.error('Error creating organizational unit:', error);
        throw error;
    }
};

export const updateOrganizationalUnit = async (unitId: number, unitData: UpdateOrganizationalUnitData): Promise<OrganizationalUnitResponse> => {
    try {
        // Automatically set parentId to 1
        const dataWithParent = {
            ...unitData,
            parentId: 1
        };
        const response = await api.put<OrganizationalUnitResponse>(`/units/${unitId}`, dataWithParent);
        return response.data;
    } catch (error) {
        console.error('Error updating organizational unit:', error);
        throw error;
    }
};

export const deleteOrganizationalUnit = async (unitId: number): Promise<boolean> => {
    try {
        const response = await api.delete(`/units/${unitId}`);
        return response.status === 200 || response.status === 204;
    } catch (error) {
        console.error('Error deleting organizational unit:', error);
        throw error;
    }
};

export const getOrganizationalUnitById = async (unitId: number): Promise<OrganizationalUnit | null> => {
    try {
        const response = await api.get<OrganizationalUnitResponse>(`/units/${unitId}`);
        if (response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error('Error getting organizational unit by ID:', error);
        return null;
    }
};
