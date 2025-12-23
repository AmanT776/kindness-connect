import { useQuery } from "@tanstack/react-query";
import { getOrganizationalUnitsByParentId, OrganizationalUnit } from "@/services/organizationalUnit";

export const useOrganizationalUnits = (parentId: number | null) => {
    const { data, isLoading, error } = useQuery<OrganizationalUnit[]>({
        queryKey: ["organizationalUnits", parentId],
        queryFn: () => getOrganizationalUnitsByParentId(parentId!),
        enabled: parentId !== null && parentId > 0,
    });

    const units = Array.isArray(data) ? data : [];

    return {
        units,
        isLoading,
        error,
    };
};

