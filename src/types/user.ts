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
    organizationalUnitId?: number | null;
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
