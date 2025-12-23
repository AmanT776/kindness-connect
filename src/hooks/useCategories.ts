import { useQuery } from "@tanstack/react-query";
import { getCategories, Category } from "@/services/category";

export const useCategories = () => {
    const { data, isLoading, error } = useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: getCategories,
    });

    // Since we're using /org/categories/active endpoint, all returned categories are active
    // No need to filter by isActive
    const categories = Array.isArray(data) ? data : [];

    return {
        categories,
        isLoading,
        error,
    };
};
