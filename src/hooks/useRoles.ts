import { useState, useEffect } from 'react';
import { fetchRoles, fetchActiveRoles, Role } from '@/services/roles';

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