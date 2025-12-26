export interface UnitType {
    id: number;
    name: string;
    description: string | null;
    status: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUnitTypeData {
    name: string;
}

export interface UpdateUnitTypeData {
    name: string;
}

// Inner helper types
export interface UnitTypeInnerResponse {
    success: boolean;
    message: string;
    data: UnitType;
}

export interface UnitTypeOuterResponse {
    success: boolean;
    message: string;
    data: UnitTypeInnerResponse;
}
