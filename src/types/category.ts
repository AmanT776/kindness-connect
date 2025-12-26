export interface Category {
    id: number;
    name: string;
    isActive: boolean;
}

export interface CategoriesResponse {
    success: boolean;
    message: string;
    data: Category[];
}

export interface CategoryResponse {
    success: boolean;
    message: string;
    data: Category;
}

export interface CreateCategoryData {
    name: string;
    isActive: boolean;
}

export interface UpdateCategoryData {
    name: string;
    isActive: boolean;
}
