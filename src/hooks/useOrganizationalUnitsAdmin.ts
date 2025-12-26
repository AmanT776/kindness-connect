import { useState, useEffect } from 'react';
import {
    fetchOrganizationalUnits,
    createOrganizationalUnit,
    updateOrganizationalUnit,
    deleteOrganizationalUnit as deleteOrganizationalUnitAPI,
    OrganizationalUnit,
    CreateOrganizationalUnitData,
    UpdateOrganizationalUnitData
} from '@/services/organizationalUnits';

export function useOrganizationalUnitsAdmin() {
    const [units, setUnits] = useState<OrganizationalUnit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadUnits = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetchOrganizationalUnits();

            if (response.success) {
                setUnits(response.data);
            } else {
                setError(response.message || 'Failed to fetch organizational units');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch organizational units');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUnits();
    }, []);

    const refetch = () => {
        loadUnits();
    };

    return {
        units,
        isLoading,
        error,
        refetch,
    };
}

export function useCreateOrganizationalUnit() {
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createUnit = async (unitData: CreateOrganizationalUnitData): Promise<OrganizationalUnit | null> => {
        try {
            setIsCreating(true);
            setError(null);
            const response = await createOrganizationalUnit(unitData);

            if (response.success) {
                return response.data;
            } else {
                setError(response.message || 'Failed to create organizational unit');
                return null;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create organizational unit';
            setError(errorMessage);
            return null;
        } finally {
            setIsCreating(false);
        }
    };

    return {
        createUnit,
        isCreating,
        error,
    };
}

export function useUpdateOrganizationalUnit() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateUnit = async (unitId: number, unitData: UpdateOrganizationalUnitData): Promise<OrganizationalUnit | null> => {
        try {
            setIsUpdating(true);
            setError(null);
            const response = await updateOrganizationalUnit(unitId, unitData);

            if (response.success) {
                return response.data;
            } else {
                setError(response.message || 'Failed to update organizational unit');
                return null;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update organizational unit';
            setError(errorMessage);
            return null;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        updateUnit,
        isUpdating,
        error,
    };
}

export function useDeleteOrganizationalUnit() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteUnit = async (unitId: number): Promise<boolean> => {
        try {
            setIsDeleting(true);
            setError(null);
            await deleteOrganizationalUnitAPI(unitId);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete organizational unit';
            setError(errorMessage);
            return false;
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        deleteUnit,
        isDeleting,
        error,
    };
}
