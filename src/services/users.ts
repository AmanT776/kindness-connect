import api from './api';

// Types
export interface UserData {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    studentId: string | null;
    isActive: boolean;
    roleName: string;
    organizationalUnitName: string | null;
    createdAt: string;
    updatedAt: string;
    fullName: string;
}

export interface CreateUserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    organizationalUnitId: string;
    roleId: number;
    phoneNumber?: string;
}

export interface UpdateUserData {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phoneNumber?: string;
    roleId: number;
    organizationalUnitId: number;
}

export interface CreateUserResponse {
    success: boolean;
    message: string;
    data: UserData;
    timestamp: string;
}

export interface Pageable {
    pageNumber: number;
    pageSize: number;
    sort: {
        sorted: boolean;
        empty: boolean;
        unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
}

export interface UsersResponse {
    success: boolean;
    message: string;
    data: {
        content: UserData[];
        pageable: Pageable;
        last: boolean;
        totalPages: number;
        totalElements: number;
        first: boolean;
        size: number;
        number: number;
        sort: {
            sorted: boolean;
            empty: boolean;
            unsorted: boolean;
        };
        numberOfElements: number;
        empty: boolean;
    };
    timestamp: string;
}

export const fetchUsers = async (page: number = 0, size: number = 10): Promise<UsersResponse> => {
    try {
        const response = await api.get<UsersResponse>('/admin/users', {
            params: {
                page,
                size
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const createUser = async (userData: CreateUserData): Promise<CreateUserResponse> => {
    try {
        const response = await api.post<CreateUserResponse>('/admin/users', userData);
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const updateUser = async (userId: number, userData: UpdateUserData): Promise<CreateUserResponse> => {
    try {
        const response = await api.put<CreateUserResponse>(`/admin/users/${userId}`, userData);
        console.log(response)
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const deleteUser = async (userId: number): Promise<boolean> => {
    try {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.status === 200 || response.status === 204;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

export const fetchAllUsers = async (): Promise<UserData[]> => {
    try {
        const response = await fetchUsers(0, 1000);
        if (response.success) {
            return response.data.content;
        }
        throw new Error(response.message || 'Failed to fetch users');
    } catch (error) {
        console.error('Error fetching all users:', error);
        throw error;
    }
};

export const getUserById = async (userId: number): Promise<UserData | null> => {
    try {
        const users = await fetchAllUsers();
        return users.find(user => user.id === userId) || null;
    } catch (error) {
        console.error('Error getting user by ID:', error);
        return null;
    }
};

export const getUsersByRole = async (roleName: string): Promise<UserData[]> => {
    try {
        const users = await fetchAllUsers();
        return users.filter(user => user.roleName.toLowerCase() === roleName.toLowerCase());
    } catch (error) {
        console.error('Error getting users by role:', error);
        return [];
    }
};

export const getStaffUserById = async (userId: number): Promise<UserData> => {
    try {
        const response = await api.get<any>(`/admin/staff/users/${userId}`);
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch user details');
    } catch (error) {
        console.error('Error fetching staff user details:', error);
        throw error;
    }
};
