export interface Role {
    id: number;
    name: string;
    isActive: boolean;
    description: string;
}

export interface RolesResponse {
    success: boolean;
    message: string;
    data: Role[];
}

export interface CreateRoleData {
    name: string;
    description: string;
}

export interface UpdateRoleData {
    name: string;
    description: string;
    isActive?: boolean;
}

export interface RoleResponse {
    success: boolean;
    message: string;
    data: Role;
}
