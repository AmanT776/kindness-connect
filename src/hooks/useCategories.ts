import { useState, useEffect } from 'react';
import { fetchCategories, getActiveCategories, createCategory, updateCategory, deleteCategory as deleteCategoryAPI, Category, CreateCategoryData, UpdateCategoryData } from '@/services/categories';

export function useCategories(options?: { activeOnly?: boolean }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCategories = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const fetchFn = options?.activeOnly ? getActiveCategories : fetchCategories;
            const response = await fetchFn();

            if (response.success) {
                setCategories(response.data);
            } else {
                setError(response.message || 'Failed to fetch categories');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, [options?.activeOnly]);

    const refetch = () => {
        loadCategories();
    };

    return {
        categories,
        isLoading,
        error,
        refetch,
    };
}

export function useCreateCategory() {
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createCategoryMutation = async (categoryData: CreateCategoryData): Promise<Category | null> => {
        try {
            setIsCreating(true);
            setError(null);
            const response = await createCategory(categoryData);

            if (response.success) {
                return response.data;
            } else {
                setError(response.message || 'Failed to create category');
                return null;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
            setError(errorMessage);
            return null;
        } finally {
            setIsCreating(false);
        }
    };

    return {
        createCategory: createCategoryMutation,
        isCreating,
        error,
    };
}

export function useUpdateCategory() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateCategoryMutation = async (categoryId: number, categoryData: UpdateCategoryData): Promise<Category | null> => {
        try {
            setIsUpdating(true);
            setError(null);
            const response = await updateCategory(categoryId, categoryData);

            if (response.success) {
                return response.data;
            } else {
                setError(response.message || 'Failed to update category');
                return null;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
            setError(errorMessage);
            return null;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        updateCategory: updateCategoryMutation,
        isUpdating,
        error,
    };
}

export function useDeleteCategory() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteCategoryMutation = async (categoryId: number): Promise<boolean> => {
        try {
            setIsDeleting(true);
            setError(null);
            await deleteCategoryAPI(categoryId);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
            setError(errorMessage);
            return false;
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        deleteCategory: deleteCategoryMutation,
        isDeleting,
        error,
    };
}
