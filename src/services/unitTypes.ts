import api from './api';

import {
    UnitType,
    CreateUnitTypeData,
    UpdateUnitTypeData,
    UnitTypeInnerResponse,
    UnitTypeOuterResponse
} from '../types/unit-type';

export type {
    UnitType,
    CreateUnitTypeData,
    UpdateUnitTypeData
};

export const fetchUnitTypes = async (): Promise<UnitType[]> => {
    try {
        const response = await api.get<UnitType[]>('/unit-types');
        return response.data;
    } catch (error) {
        console.error('Error fetching unit types:', error);
        throw error;
    }
};

export const createUnitType = async (unitTypeData: CreateUnitTypeData): Promise<UnitType> => {
    try {
        const response = await api.post<UnitType>('/unit-types', unitTypeData);
        return response.data;
    } catch (error) {
        console.error('Error creating unit type:', error);
        throw error;
    }
};

export const updateUnitType = async (unitTypeId: number, unitTypeData: UpdateUnitTypeData): Promise<UnitType> => {
    try {
        const response = await api.put<UnitType>(`/unit-types/${unitTypeId}`, unitTypeData);
        return response.data;
    } catch (error) {
        console.error('Error updating unit type:', error);
        throw error;
    }
};

export const deleteUnitType = async (unitTypeId: number): Promise<boolean> => {
    try {
        await api.delete(`/unit-types/${unitTypeId}`);
        return true;
    } catch (error) {
        console.error('Error deleting unit type:', error);
        return false;
    }
};

export const getUnitTypeById = async (unitTypeId: number): Promise<UnitType | null> => {
    try {
        const response = await api.get<UnitTypeOuterResponse>(`/unit-types/${unitTypeId}`);
        // Check if we have the double nested structure
        if (response.data?.success && response.data?.data?.success && response.data?.data?.data) {
            return response.data.data.data;
        }
        // Fallback for standard structure if api changes back
        if (response.data?.success && (response.data as any).data && !(response.data as any).data.success) {
            return (response.data as any).data;
        }

        return null;
    } catch (error) {
        console.error('Error getting unit type by ID:', error);
        return null;
    }
};
