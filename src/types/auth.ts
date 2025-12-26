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

export interface UpdateProfileRequest {
    firstName: string;
    lastName: string;
    email: string;
}

export interface ChangePasswordRequest {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}
