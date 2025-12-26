import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/useRoles';
import { CreateRoleData, Role, UpdateRoleData } from '@/services/roles';
import { useToast } from '@/hooks/use-toast';
import { RoleUpdateDialog } from '@/components/admin/RoleUpdateDialog';
import { RoleDeleteConfirmDialog } from '@/components/admin/RoleDeleteConfirmDialog';
import {
    Shield, Plus, Search, Loader2, Edit, Trash2, CheckCircle, XCircle
} from 'lucide-react';

const AdminRoles = () => {
    const { user, isAuthenticated } = useAuth();
    const { roles, isLoading: rolesLoading, refetch } = useRoles();
    const { createRole, isCreating } = useCreateRole();
    const { updateRole, isUpdating } = useUpdateRole();
    const { deleteRole, isDeleting } = useDeleteRole();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [roleToUpdate, setRoleToUpdate] = useState<Role | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

    // Form state for creating
    const [formData, setFormData] = useState<CreateRoleData>({
        name: '',
        description: '',
    });

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    // Handle form input changes
    const handleInputChange = (field: keyof CreateRoleData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Create role
    const handleCreateRole = async () => {
        if (!formData.name) {
            toast({
                title: 'Validation Error',
                description: 'Role name is required',
                variant: 'destructive',
            });
            return;
        }

        const newRole = await createRole(formData);

        if (newRole) {
            toast({
                title: 'Success',
                description: 'Role created successfully',
            });

            setFormData({
                name: '',
                description: '',
            });

            setShowCreateDialog(false);
            refetch();
        } else {
            toast({
                title: 'Error',
                description: 'Failed to create role. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Handle delete role
    const handleDeleteRole = async () => {
        if (!roleToDelete) return;

        const success = await deleteRole(roleToDelete.id);

        if (success) {
            toast({
                title: 'Success',
                description: 'Role deleted successfully',
            });
            refetch();
            setRoleToDelete(null);
        } else {
            toast({
                title: 'Error',
                description: 'Failed to delete role. It might be in use.',
                variant: 'destructive',
            });
        }
    };

    // Handle update role
    const handleUpdateRole = async (roleId: number, data: UpdateRoleData) => {
        const updatedRole = await updateRole(roleId, data);

        if (updatedRole) {
            toast({
                title: 'Success',
                description: 'Role updated successfully',
            });
            refetch();
            setRoleToUpdate(null);
        } else {
            toast({
                title: 'Error',
                description: 'Failed to update role. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Filter roles
    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AdminLayout>
            <div className="container py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-heading text-3xl font-bold">Role Management</h1>
                        <p className="text-muted-foreground mt-1">Manage system roles</p>
                    </div>
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Role
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Role</DialogTitle>
                                <DialogDescription>
                                    Add a new role to the system.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Role Name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Role Description"
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
                                <Button onClick={handleCreateRole} disabled={isCreating}>
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Role
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
                                placeholder="Search roles by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Roles List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            System Roles
                        </CardTitle>
                        <CardDescription>
                            {filteredRoles.length} role(s) found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {rolesLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredRoles.length === 0 ? (
                            <div className="text-center py-12">
                                <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-lg font-medium">No roles found</h3>
                                <Button
                                    className="mt-4"
                                    onClick={() => setShowCreateDialog(true)}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Role
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredRoles.map((role) => (
                                    <div
                                        key={role.id}
                                        className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Shield className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="font-medium">{role.name}</h3>
                                                {role.isActive ? (
                                                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                        <CheckCircle className="h-3 w-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                                        <XCircle className="h-3 w-3" /> Inactive
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{role.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setRoleToUpdate(role)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setRoleToDelete(role)}
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

                <RoleUpdateDialog
                    role={roleToUpdate}
                    isOpen={!!roleToUpdate}
                    onClose={() => setRoleToUpdate(null)}
                    onConfirm={handleUpdateRole}
                    isUpdating={isUpdating}
                />

                <RoleDeleteConfirmDialog
                    role={roleToDelete}
                    isOpen={!!roleToDelete}
                    onClose={() => setRoleToDelete(null)}
                    onConfirm={handleDeleteRole}
                    isDeleting={isDeleting}
                />
            </div>
        </AdminLayout>
    );
};

export default AdminRoles;
