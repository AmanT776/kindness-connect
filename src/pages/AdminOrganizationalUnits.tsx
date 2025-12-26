import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganizationalUnitsAdmin, useCreateOrganizationalUnit, useUpdateOrganizationalUnit, useDeleteOrganizationalUnit } from '@/hooks/useOrganizationalUnitsAdmin';
import { useUnitTypes } from '@/hooks/useUnitTypes';
import { CreateOrganizationalUnitData, OrganizationalUnit, UpdateOrganizationalUnitData } from '@/services/organizationalUnits';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrganizationalUnitUpdateDialog } from '@/components/admin/OrganizationalUnitUpdateDialog';
import { OrganizationalUnitDeleteConfirmDialog } from '@/components/admin/OrganizationalUnitDeleteConfirmDialog';
import {
    Building2, Plus, Search, Loader2, Edit, Trash2
} from 'lucide-react';

const AdminOrganizationalUnits = () => {
    const { user, isAuthenticated } = useAuth();
    const { units, isLoading: unitsLoading, refetch } = useOrganizationalUnitsAdmin();
    const { unitTypes, isLoading: unitTypesLoading } = useUnitTypes();
    const { createUnit, isCreating } = useCreateOrganizationalUnit();
    const { updateUnit, isUpdating } = useUpdateOrganizationalUnit();
    const { deleteUnit, isDeleting } = useDeleteOrganizationalUnit();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [unitToUpdate, setUnitToUpdate] = useState<OrganizationalUnit | null>(null);
    const [unitToDelete, setUnitToDelete] = useState<OrganizationalUnit | null>(null);

    // Form state for creating
    const [formData, setFormData] = useState<CreateOrganizationalUnitData>({
        name: '',
        abbreviation: '',
        parentId: 1,
        unitTypeId: 1,
        unitEmail: '',
        phoneNumber: '',
        remark: '',
        status: 1,
        currentUserId: 1,
    });

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    // Handle form input changes
    const handleInputChange = (field: keyof CreateOrganizationalUnitData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Create organizational unit
    const handleCreateUnit = async () => {
        if (!formData.name || !formData.unitEmail || !formData.phoneNumber) {
            toast({
                title: 'Validation Error',
                description: 'Name, email, and phone number are required',
                variant: 'destructive',
            });
            return;
        }

        const newUnit = await createUnit(formData);

        if (newUnit) {
            toast({
                title: 'Success',
                description: 'Organizational unit created successfully',
            });

            setFormData({
                name: '',
                abbreviation: '',
                parentId: 1,
                unitTypeId: 1,
                unitEmail: '',
                phoneNumber: '',
                remark: '',
                status: 1,
                currentUserId: 1,
            });

            setShowCreateDialog(false);
            refetch();
        } else {
            toast({
                title: 'Error',
                description: 'Failed to create organizational unit. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Handle delete organizational unit
    const handleDeleteUnit = async () => {
        if (!unitToDelete) return;

        const success = await deleteUnit(unitToDelete.id);

        if (success) {
            toast({
                title: 'Success',
                description: 'Organizational unit deleted successfully',
            });
            refetch();
            setUnitToDelete(null);
        } else {
            toast({
                title: 'Error',
                description: 'Failed to delete organizational unit. It might be in use.',
                variant: 'destructive',
            });
        }
    };

    // Handle update organizational unit
    const handleUpdateUnit = async (unitId: number, data: UpdateOrganizationalUnitData) => {
        const updatedUnit = await updateUnit(unitId, data);

        if (updatedUnit) {
            toast({
                title: 'Success',
                description: 'Organizational unit updated successfully',
            });
            refetch();
            setUnitToUpdate(null);
        } else {
            toast({
                title: 'Error',
                description: 'Failed to update organizational unit. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Filter units
    const filteredUnits = units.filter(unit =>
        unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.unitEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="container py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-heading text-3xl font-bold">Organizational Unit Management</h1>
                        <p className="text-muted-foreground mt-1">Manage organizational units</p>
                    </div>
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Unit
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Organizational Unit</DialogTitle>
                                <DialogDescription>
                                    Add a new organizational unit to the system.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Unit Name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="abbreviation">Abbreviation</Label>
                                        <Input
                                            id="abbreviation"
                                            value={formData.abbreviation || ''}
                                            onChange={(e) => handleInputChange('abbreviation', e.target.value)}
                                            placeholder="Abbreviation"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="unitTypeId">Unit Type *</Label>
                                        <Select
                                            value={formData.unitTypeId.toString()}
                                            onValueChange={(value) => handleInputChange('unitTypeId', parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Unit Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {unitTypesLoading ? (
                                                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                                                ) : unitTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="unitEmail">Unit Email *</Label>
                                        <Input
                                            id="unitEmail"
                                            type="email"
                                            value={formData.unitEmail}
                                            onChange={(e) => handleInputChange('unitEmail', e.target.value)}
                                            placeholder="unit@example.com"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                                        <Input
                                            id="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                            placeholder="+251900000000"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="remark">Remark</Label>
                                    <Input
                                        id="remark"
                                        value={formData.remark}
                                        onChange={(e) => handleInputChange('remark', e.target.value)}
                                        placeholder="Additional information"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="parentId">Parent Unit</Label>
                                    <Select
                                        value={formData.parentId?.toString() || "1"}
                                        onValueChange={(value) => handleInputChange('parentId', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Parent Unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {units.map((unit) => (
                                                <SelectItem key={unit.id} value={unit.id.toString()}>
                                                    {unit.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                <Button onClick={handleCreateUnit} disabled={isCreating}>
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Unit
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
                                placeholder="Search units by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Units List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Organizational Units
                        </CardTitle>
                        <CardDescription>
                            {filteredUnits.length} unit(s) found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {unitsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredUnits.length === 0 ? (
                            <div className="text-center py-12">
                                <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-lg font-medium">No units found</h3>
                                <Button
                                    className="mt-4"
                                    onClick={() => setShowCreateDialog(true)}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Unit
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredUnits.map((unit) => (
                                    <div
                                        key={unit.id}
                                        className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="font-medium">{unit.name}</h3>
                                            </div>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <p>Email: {unit.unitEmail}</p>
                                                <p>Phone: {unit.phoneNumber}</p>
                                                {unit.remark && <p>Remark: {unit.remark}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setUnitToUpdate(unit)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setUnitToDelete(unit)}
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

                <OrganizationalUnitUpdateDialog
                    unit={unitToUpdate}
                    isOpen={!!unitToUpdate}
                    onClose={() => setUnitToUpdate(null)}
                    onConfirm={handleUpdateUnit}
                    isUpdating={isUpdating}
                />

                <OrganizationalUnitDeleteConfirmDialog
                    unit={unitToDelete}
                    isOpen={!!unitToDelete}
                    onClose={() => setUnitToDelete(null)}
                    onConfirm={handleDeleteUnit}
                    isDeleting={isDeleting}
                />
            </div>
        </AdminLayout >
    );
};

export default AdminOrganizationalUnits;
