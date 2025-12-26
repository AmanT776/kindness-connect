export interface FileData {
    id: number;
    file_path: string;
    createdAt: string;
    updatedAt: string;
}

export interface ComplaintData {
    id: number;
    referenceNumber: string;
    title: string;
    description: string;
    isAnonymous: boolean;
    status: string;
    organizationalUnitId: number;
    categoryId: number;
    userId: number | null;
    files: FileData[];
    createdAt: string;
    updatedAt: string;
}

export interface ComplaintResponse {
    success: boolean;
    message: string;
    data: ComplaintData;
}

export interface ComplaintsListResponse {
    success: boolean;
    message: string;
    data: ComplaintData[];
}

export interface UpdateComplaintRequest {
    title?: string;
    description?: string;
    categoryId?: number;
    organizationalUnitId?: number;
}

export interface UpdateStatusRequest {
    status: string;
}

export interface UpdateStatusResponse {
    success: boolean;
    message: string;
    data?: ComplaintData;
}

export interface DeleteComplaintResponse {
    success: boolean;
    message: string;
}
