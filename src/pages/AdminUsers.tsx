import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganizationalUnits } from '@/hooks/useOrganizationalUnits';
import { useRoles } from '@/hooks/useRoles';
import { useAllUsers, useCreateUser } from '@/hooks/useUsers';
import { CreateUserData } from '@/services/users';
import { useToast } from '@/hooks/use-toast';
import {
    Users, Plus, Search, Loader2, User, Mail,
    Building2, Shield, Edit, Trash2
} from 'lucide-react';

const AdminUsers = () => {
    const { user, isAuthenticated } = useAuth();
    const { units } = useOrganizationalUnits(1);
    const { roles, isLoading: rolesLoading } = useRoles();
    const { users, isLoading: usersLoading, refetch } = useAllUsers();
    const { createUser, isCreating } = useCreateUser();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    // Form state
    const [formData, setFormData] = useState<CreateUserData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        organizationalUnitId: '',
        roleId: 0,
    });

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role === 'student') {
        return <Navigate to="/dashboard" replace />;
    }

    // Handle form input changes
    const handleInputChange = (field: keyof CreateUserData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Create user using the service
    const handleCreateUser = async () => {
        if (!formData.firstName || !formData.lastName || !formData.email ||
            !formData.password || !formData.organizationalUnitId || !formData.roleId) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            });
            return;
        }

        const newUser = await createUser(formData);

        if (newUser) {
            toast({
                title: 'Success',
                description: 'User created successfully',
            });

            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                organizationalUnitId: '',
                roleId: 0,
            });

            setShowCreateDialog(false);
            refetch(); // Refresh users list
        } else {
            toast({
                title: 'Error',
                description: 'Failed to create user. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Filter users based on search term
    const filteredUsers = users.filter(userData =>
        userData.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userData.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userData.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (userData.organizationalUnitName && userData.organizationalUnitName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AdminLayout>
            <div className="container py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-heading text-3xl font-bold">User Management</h1>
                        <p className="text-muted-foreground mt-1">Manage system users and their roles</p>
                    </div>
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New User</DialogTitle>
                                <DialogDescription>
                                    Add a new user to the system with appropriate role and organizational unit.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="firstName">First Name *</Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastName">Last Name *</Label>
                                        <Input
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="Enter email address"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="password">Password *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        placeholder="Enter password"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="organizationalUnit">Organizational Unit *</Label>
                                    <Select
                                        value={formData.organizationalUnitId}
                                        onValueChange={(value) => handleInputChange('organizationalUnitId', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select organizational unit" />
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

                                <div>
                                    <Label htmlFor="role">Role *</Label>
                                    <Select
                                        value={formData.roleId.toString()}
                                        onValueChange={(value) => handleInputChange('roleId', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rolesLoading ? (
                                                <SelectItem value="loading" disabled>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Loading roles...
                                                </SelectItem>
                                            ) : (
                                                roles.map((role) => (
                                                    <SelectItem key={role.id} value={role.id.toString()}>
                                                        <div className="flex flex-col items-start">
                                                            <span className="font-medium">{role.name}</span>
                                                            <span className="text-xs text-muted-foreground">{role.description}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            )}
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
                                <Button onClick={handleCreateUser} disabled={isCreating || rolesLoading}>
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create User
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
                                placeholder="Search users by name, email, role, or organizational unit..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Users List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            System Users
                        </CardTitle>
                        <CardDescription>
                            {filteredUsers.length} user(s) found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {usersLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-lg font-medium">No users found</h3>
                                <p className="text-muted-foreground mt-1">
                                    {users.length === 0 ? 'Create your first user to get started.' : 'Try adjusting your search criteria.'}
                                </p>
                                <Button
                                    className="mt-4"
                                    onClick={() => setShowCreateDialog(true)}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create User
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredUsers.map((userData) => (
                                    <div
                                        key={userData.id}
                                        className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="font-medium">{userData.fullName}</h3>
                                                {!userData.isActive && (
                                                    <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {userData.email}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Shield className="h-3 w-3" />
                                                    {userData.roleName}
                                                </span>
                                                {userData.organizationalUnitName && (
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        {userData.organizationalUnitName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;