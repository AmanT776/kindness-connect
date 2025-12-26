import api from "./api";

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    organizationalUnitId: number;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    data?: any;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    studentId: string | null;
    isActive: boolean;
    roleName: string;
    organizationalUnitId?: number;
    organizationalUnitName: string | null;
    createdAt: string;
    updatedAt: string;
    fullName: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        type: string;
        user: LoginUser;
    };
    timestamp: string;
}

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
        const res = await api.post("/auth/register", data);
        return res.data;
    } catch (error: any) {
        console.error("Error registering user:", error);
        console.error("Error response:", error?.response?.data);
        console.error("Error status:", error?.response?.status);
        throw error;
    }
};

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
    try {
        const res = await api.post("/auth/login", data);
        return res.data;
    } catch (error: any) {
        console.error("Error logging in:", error);
        console.error("Error response:", error?.response?.data);
        console.error("Error status:", error?.response?.status);
        throw error;
    }
};

