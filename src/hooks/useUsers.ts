import { useState, useEffect } from 'react';
import { fetchUsers, fetchAllUsers, createUser, updateUser, deleteUser as deleteUserAPI, UserData, CreateUserData, UpdateUserData, UsersResponse } from '@/services/users';

export function useUsers(page: number = 0, size: number = 10) {
    const [users, setUsers] = useState<UserData[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetchUsers(page, size);

            if (response.success) {
                setUsers(response.data.content);
                setTotalElements(response.data.totalElements);
                setTotalPages(response.data.totalPages);
            } else {
                setError(response.message || 'Failed to fetch users');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [page, size]);

    const refetch = () => {
        loadUsers();
    };

    return {
        users,
        totalElements,
        totalPages,
        isLoading,
        error,
        refetch,
    };
}

export function useAllUsers() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadAllUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const allUsers = await fetchAllUsers();
            setUsers(allUsers);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAllUsers();
    }, []);

    const refetch = () => {
        loadAllUsers();
    };

    return {
        users,
        isLoading,
        error,
        refetch,
    };
}

export function useCreateUser() {
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createUserMutation = async (userData: CreateUserData): Promise<UserData | null> => {
        try {
            setIsCreating(true);
            setError(null);
            const response = await createUser(userData);

            if (response.success) {
                return response.data;
            } else {
                setError(response.message || 'Failed to create user');
                return null;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
            setError(errorMessage);
            return null;
        } finally {
            setIsCreating(false);
        }
    };

    return {
        createUser: createUserMutation,
        isCreating,
        error,
    };
}

export function useUpdateUser() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateUserMutation = async (userId: number, userData: UpdateUserData): Promise<UserData | null> => {
        try {
            setIsUpdating(true);
            setError(null);
            const response = await updateUser(userId, userData);

            if (response.success) {
                return response.data;
            } else {
                setError(response.message || 'Failed to update user');
                return null;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
            setError(errorMessage);
            return null;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        updateUser: updateUserMutation,
        isUpdating,
        error,
    };
}

export function useDeleteUser() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteUserMutation = async (userId: number): Promise<boolean> => {
        try {
            setIsDeleting(true);
            setError(null);
            await deleteUserAPI(userId);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
            setError(errorMessage);
            return false;
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        deleteUser: deleteUserMutation,
        isDeleting,
        error,
    };
}