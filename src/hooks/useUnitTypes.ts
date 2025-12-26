import { useState, useEffect } from 'react';
import { fetchUnitTypes, createUnitType, updateUnitType, deleteUnitType as deleteUnitTypeAPI, UnitType, CreateUnitTypeData, UpdateUnitTypeData } from '@/services/unitTypes';

export function useUnitTypes() {
    const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadUnitTypes = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await fetchUnitTypes();
            setUnitTypes(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch unit types');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUnitTypes();
    }, []);

    const refetch = () => {
        loadUnitTypes();
    };

    return {
        unitTypes,
        isLoading,
        error,
        refetch,
    };
}

export function useCreateUnitType() {
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createUnitTypeMutation = async (unitTypeData: CreateUnitTypeData): Promise<UnitType | null> => {
        try {
            setIsCreating(true);
            setError(null);
            const data = await createUnitType(unitTypeData);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create unit type';
            setError(errorMessage);
            return null;
        } finally {
            setIsCreating(false);
        }
    };

    return {
        createUnitType: createUnitTypeMutation,
        isCreating,
        error,
    };
}

export function useUpdateUnitType() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateUnitTypeMutation = async (unitTypeId: number, unitTypeData: UpdateUnitTypeData): Promise<UnitType | null> => {
        try {
            setIsUpdating(true);
            setError(null);
            const data = await updateUnitType(unitTypeId, unitTypeData);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update unit type';
            setError(errorMessage);
            return null;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        updateUnitType: updateUnitTypeMutation,
        isUpdating,
        error,
    };
}

export function useDeleteUnitType() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteUnitTypeMutation = async (unitTypeId: number): Promise<boolean> => {
        try {
            setIsDeleting(true);
            setError(null);
            await deleteUnitTypeAPI(unitTypeId);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete unit type';
            setError(errorMessage);
            return false;
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        deleteUnitType: deleteUnitTypeMutation,
        isDeleting,
        error,
    };
}
