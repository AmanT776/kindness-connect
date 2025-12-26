import api from './api';

import {
    Role,
    RolesResponse,
    CreateRoleData,
    UpdateRoleData,
    RoleResponse
} from '../types/role';

export type {
    Role,
    RolesResponse,
    CreateRoleData,
    UpdateRoleData,
    RoleResponse
};


export const fetchRoles = async (): Promise<RolesResponse> => {
    try {
        const response = await api.get<RolesResponse>('/roles');
        return response.data;
    } catch (error) {
        console.error('Error fetching roles:', error);
        throw error;
    }
};

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

export const createRole = async (roleData: CreateRoleData): Promise<RoleResponse> => {
    try {
        const response = await api.post<RoleResponse>('/roles', roleData);
        return response.data;
    } catch (error) {
        console.error('Error creating role:', error);
        throw error;
    }
};

export const updateRole = async (roleId: number, roleData: UpdateRoleData): Promise<RoleResponse> => {
    try {
        const response = await api.put<RoleResponse>(`/roles/${roleId}`, roleData);
        return response.data;
    } catch (error) {
        console.error('Error updating role:', error);
        throw error;
    }
};

export const deleteRole = async (roleId: number): Promise<boolean> => {
    try {
        const response = await api.delete(`/roles/${roleId}`);
        return response.status === 200 || response.status === 204;
    } catch (error) {
        console.error('Error deleting role:', error);
        throw error;
    }
};

// Helper function to get role by ID
export const getRoleById = async (roleId: number): Promise<Role | null> => {
    try {
        const response = await api.get<RoleResponse>(`/roles/${roleId}`);
        if (response.data.success) {
            return response.data.data;
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