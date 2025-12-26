import { useState, useEffect } from 'react';
import { fetchRoles, fetchActiveRoles, createRole, updateRole, deleteRole as deleteRoleAPI, Role, CreateRoleData, UpdateRoleData } from '@/services/roles';

export function useRoles() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadRoles = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetchRoles();

            if (response.success) {
                setRoles(response.data);
            } else {
                setError(response.message || 'Failed to fetch roles');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch roles');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
    }, []);

    const refetch = () => {
        loadRoles();
    };

    return {
        roles,
        isLoading,
        error,
        refetch,
    };
}

export function useActiveRoles() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadActiveRoles = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const activeRoles = await fetchActiveRoles();
            setRoles(activeRoles);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch active roles');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadActiveRoles();
    }, []);

    const refetch = () => {
        loadActiveRoles();
    };

    return {
        roles,
        isLoading,
        error,
        refetch,
    };
}

export function useCreateRole() {
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createRoleMutation = async (roleData: CreateRoleData): Promise<Role | null> => {
        try {
            setIsCreating(true);
            setError(null);
            const response = await createRole(roleData);

            if (response.success) {
                return response.data;
            } else {
                setError(response.message || 'Failed to create role');
                return null;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create role';
            setError(errorMessage);
            return null;
        } finally {
            setIsCreating(false);
        }
    };

    return {
        createRole: createRoleMutation,
        isCreating,
        error,
    };
}

export function useUpdateRole() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateRoleMutation = async (roleId: number, roleData: UpdateRoleData): Promise<Role | null> => {
        try {
            setIsUpdating(true);
            setError(null);
            const response = await updateRole(roleId, roleData);

            if (response.success) {
                return response.data;
            } else {
                setError(response.message || 'Failed to update role');
                return null;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update role';
            setError(errorMessage);
            return null;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        updateRole: updateRoleMutation,
        isUpdating,
        error,
    };
}

export function useDeleteRole() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteRoleMutation = async (roleId: number): Promise<boolean> => {
        try {
            setIsDeleting(true);
            setError(null);
            await deleteRoleAPI(roleId);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete role';
            setError(errorMessage);
            return false;
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        deleteRole: deleteRoleMutation,
        isDeleting,
        error,
    };
}