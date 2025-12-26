import api from './api';

// Types
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

export const fetchCategories = async (): Promise<CategoriesResponse> => {
    try {
        const response = await api.get<CategoriesResponse>('/org/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const getActiveCategories = async (): Promise<CategoriesResponse> => {
    try {
        const response = await api.get<CategoriesResponse>('/org/categories/active');
        return response.data;
    } catch (error) {
        console.error('Error fetching active categories:', error);
        throw error;
    }
};

export const createCategory = async (categoryData: CreateCategoryData): Promise<CategoryResponse> => {
    try {
        const response = await api.post<CategoryResponse>('/org/categories', categoryData);
        return response.data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

export const updateCategory = async (categoryId: number, categoryData: UpdateCategoryData): Promise<CategoryResponse> => {
    try {
        const response = await api.put<CategoryResponse>(`/org/categories/${categoryId}`, categoryData);
        return response.data;
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
};

export const deleteCategory = async (categoryId: number): Promise<boolean> => {
    try {
        const response = await api.delete(`/org/categories/${categoryId}`);
        return response.status === 200 || response.status === 204;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
};

export const getCategoryById = async (categoryId: number): Promise<Category | null> => {
    try {
        const response = await api.get<CategoryResponse>(`/org/categories/${categoryId}`);
        if (response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error('Error getting category by ID:', error);
        return null;
    }
};
