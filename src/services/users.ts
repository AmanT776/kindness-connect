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

// API Functions
export const fetchUsers = async (page: number = 0, size: number = 10): Promise<UsersResponse> => {
    try {
        const response = await api.get<UsersResponse>('/admin/users', {
            params: {
                page,
                size
            }
        });

        // The axios response.data IS the UsersResponse object based on the API contract
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

// Helper function to get all users (flattened from paginated response)
export const fetchAllUsers = async (): Promise<UserData[]> => {
    try {
        // Get a large page to get all users
        // Note: Ideally backend should support unpaged fetch or we should loop. 
        // For now adhering to existing logic but using new fetchUsers
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

// Helper function to get user by ID
export const getUserById = async (userId: number): Promise<UserData | null> => {
    try {
        const users = await fetchAllUsers();
        return users.find(user => user.id === userId) || null;
    } catch (error) {
        console.error('Error getting user by ID:', error);
        return null;
    }
};

// Helper function to get users by role
export const getUsersByRole = async (roleName: string): Promise<UserData[]> => {
    try {
        const users = await fetchAllUsers();
        return users.filter(user => user.roleName.toLowerCase() === roleName.toLowerCase());
    } catch (error) {
        console.error('Error getting users by role:', error);
        return [];
    }
};
