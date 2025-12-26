import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useUnitTypes, useCreateUnitType, useUpdateUnitType, useDeleteUnitType } from '@/hooks/useUnitTypes';
import { CreateUnitTypeData, UnitType, UpdateUnitTypeData } from '@/services/unitTypes';
import { useToast } from '@/hooks/use-toast';
import { UnitTypeUpdateDialog } from '@/components/admin/UnitTypeUpdateDialog';
import { UnitTypeDeleteConfirmDialog } from '@/components/admin/UnitTypeDeleteConfirmDialog';
import {
    Layers, Plus, Search, Loader2, Edit, Trash2
} from 'lucide-react';

const AdminUnitTypes = () => {
    const { user, isAuthenticated } = useAuth();
    const { unitTypes, isLoading: unitTypesLoading, refetch } = useUnitTypes();
    const { createUnitType, isCreating } = useCreateUnitType();
    const { updateUnitType, isUpdating } = useUpdateUnitType();
    const { deleteUnitType, isDeleting } = useDeleteUnitType();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [unitTypeToUpdate, setUnitTypeToUpdate] = useState<UnitType | null>(null);
    const [unitTypeToDelete, setUnitTypeToDelete] = useState<UnitType | null>(null);

    // Form state for creating
    const [formData, setFormData] = useState<CreateUnitTypeData>({
        name: '',
    });

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    // Handle form input changes
    const handleInputChange = (value: string) => {
        setFormData({ name: value });
    };

    // Create unit type
    const handleCreateUnitType = async () => {
        if (!formData.name) {
            toast({
                title: 'Validation Error',
                description: 'Unit type name is required',
                variant: 'destructive',
            });
            return;
        }

        const newUnitType = await createUnitType(formData);

        if (newUnitType) {
            toast({
                title: 'Success',
                description: 'Unit type created successfully',
            });

            setFormData({ name: '' });
            setShowCreateDialog(false);
            refetch();
        } else {
            toast({
                title: 'Error',
                description: 'Failed to create unit type. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Handle delete unit type
    const handleDeleteUnitType = async () => {
        if (!unitTypeToDelete) return;

        const success = await deleteUnitType(unitTypeToDelete.id);
        console.log(unitTypeToDelete.id)
        if (success) {
            toast({
                title: 'Success',
                description: 'Unit type deleted successfully',
            });
            refetch();
            setUnitTypeToDelete(null);
        } else {
            toast({
                title: 'Error',
                description: 'Failed to delete unit type. It might be in use.',
                variant: 'destructive',
            });
        }
    };

    // Handle update unit type
    const handleUpdateUnitType = async (unitTypeId: number, data: UpdateUnitTypeData) => {
        const updatedUnitType = await updateUnitType(unitTypeId, data);

        if (updatedUnitType) {
            toast({
                title: 'Success',
                description: 'Unit type updated successfully',
            });
            refetch();
            setUnitTypeToUpdate(null);
        } else {
            toast({
                title: 'Error',
                description: 'Failed to update unit type. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Filter unit types
    const filteredUnitTypes = unitTypes.filter(unitType =>
        unitType.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="container py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-heading text-3xl font-bold">Unit Type Management</h1>
                        <p className="text-muted-foreground mt-1">Manage organizational unit types</p>
                    </div>
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Unit Type
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Unit Type</DialogTitle>
                                <DialogDescription>
                                    Add a new unit type to the system.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        placeholder="Unit Type Name"
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCreateDialog(false)}
                                    disabled={isCreating}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateUnitType} disabled={isCreating}>
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Unit Type
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search unit types by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Unit Types List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="h-5 w-5" />
                            Unit Types
                        </CardTitle>
                        <CardDescription>
                            {filteredUnitTypes.length} unit type(s) found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {unitTypesLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredUnitTypes.length === 0 ? (
                            <div className="text-center py-12">
                                <Layers className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-lg font-medium">No unit types found</h3>
                                <Button
                                    className="mt-4"
                                    onClick={() => setShowCreateDialog(true)}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Unit Type
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredUnitTypes.map((unitType) => (
                                    <div
                                        key={unitType.id}
                                        className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Layers className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="font-medium">{unitType.name}</h3>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setUnitTypeToUpdate(unitType)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setUnitTypeToDelete(unitType)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <UnitTypeUpdateDialog
                    unitType={unitTypeToUpdate}
                    isOpen={!!unitTypeToUpdate}
                    onClose={() => setUnitTypeToUpdate(null)}
                    onConfirm={handleUpdateUnitType}
                    isUpdating={isUpdating}
                />

                <UnitTypeDeleteConfirmDialog
                    unitType={unitTypeToDelete}
                    isOpen={!!unitTypeToDelete}
                    onClose={() => setUnitTypeToDelete(null)}
                    onConfirm={handleDeleteUnitType}
                    isDeleting={isDeleting}
                />
            </div>
        </AdminLayout>
    );
};

export default AdminUnitTypes;
