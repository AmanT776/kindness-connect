import api from './api';

import {
    OrganizationalUnit,
    OrganizationalUnitsResponse,
    OrganizationalUnitResponse,
    CreateOrganizationalUnitData,
    UpdateOrganizationalUnitData
} from '../types/organizational-unit';

export type {
    OrganizationalUnit,
    OrganizationalUnitsResponse,
    OrganizationalUnitResponse,
    CreateOrganizationalUnitData,
    UpdateOrganizationalUnitData
};

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
        const response = await api.post<OrganizationalUnitResponse>('/units', unitData);
        return response.data;
    } catch (error) {
        console.error('Error creating organizational unit:', error);
        throw error;
    }
};

export const updateOrganizationalUnit = async (unitId: number, unitData: UpdateOrganizationalUnitData): Promise<OrganizationalUnitResponse> => {
    try {
        const response = await api.put<OrganizationalUnitResponse>(`/units/${unitId}`, unitData);
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
