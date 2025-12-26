export interface OrganizationalUnit {
    id: number;
    name: string;
    abbreviation?: string;
    parentId: number;
    unitTypeId: number;
    unitEmail: string;
    phoneNumber: string;
    remark: string;
    status: number;
    currentUserId: number;
}

export interface OrganizationalUnitsResponse {
    success: boolean;
    message: string;
    data: OrganizationalUnit[];
}

export interface OrganizationalUnitResponse {
    success: boolean;
    message: string;
    data: OrganizationalUnit;
}

export interface CreateOrganizationalUnitData {
    name: string;
    abbreviation?: string;
    parentId?: number;
    unitTypeId: number;
    unitEmail: string;
    phoneNumber: string;
    remark: string;
    status: number;
    currentUserId: number;
}

export interface UpdateOrganizationalUnitData {
    name: string;
    abbreviation?: string;
    parentId?: number;
    unitTypeId: number;
    unitEmail: string;
    phoneNumber: string;
    remark: string;
    status: number;
    currentUserId: number;
}

export interface PublicOrganizationalUnit {
    id: number;
    name: string;
    abbreviation: string | null;
    unitTypeId: number;
    unitTypeName: string;
    parentId: number;
    parentName: string;
    unitEmail: string;
    phoneNumber: string;
    status: string | null;
    createTime: string | null;
}
