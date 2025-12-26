import api from "./api";

import {
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    UpdateProfileRequest,
    ChangePasswordRequest
} from '../types/auth';

export type {
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    UpdateProfileRequest,
    ChangePasswordRequest
};

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

export const getCurrentUser = async (): Promise<LoginResponse> => {
    try {
        const res = await api.get("/auth/me");
        console.log(res.data)
        return res.data;
    } catch (error: any) {
        console.error("Error fetching current user:", error);
        throw error;
    }
};



export const updateProfile = async (data: UpdateProfileRequest): Promise<LoginResponse> => {
    try {
        const res = await api.put("/profile", data);
        return res.data;
    } catch (error: any) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

export const changePassword = async (data: ChangePasswordRequest): Promise<any> => {
    try {
        const res = await api.put("/profile/change-password", data);
        return res.data;
    } catch (error: any) {
        console.error("Error changing password:", error);
        throw error;
    }
};

