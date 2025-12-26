import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UpdateUserData, UserData } from '@/services/users';
import { useOrganizationalUnits } from '@/hooks/useOrganizationalUnits';
import { useRoles } from '@/hooks/useRoles';
import { Loader2 } from 'lucide-react';

interface UserUpdateDialogProps {
    user: UserData | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (userId: number, data: UpdateUserData) => Promise<void>;
    isUpdating: boolean;
}

export function UserUpdateDialog({
    user,
    isOpen,
    onClose,
    onConfirm,
    isUpdating
}: UserUpdateDialogProps) {
    const { units } = useOrganizationalUnits(1);
    const { roles, isLoading: rolesLoading } = useRoles();

    const [formData, setFormData] = useState<UpdateUserData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        roleId: 0,
        organizationalUnitId: 0,
    });

    useEffect(() => {
        if (user && isOpen) {
            // Split name if possible or use what we have. API returns fullName usually but sometimes firstName/lastName
            // The UserData interface has firstName and lastName.
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                password: '', // Don't prefill password
                phoneNumber: user.phoneNumber || '',
                // We need to map roleName to roleId. 
                // This is tricky if we don't have the role ID in UserData.
                // Looking at UserData interface: it only has roleName.
                // We might need to find the role ID from the roles list based on name.
                roleId: 0,
                // Similarly for organizationalUnitId. UserData has organizationalUnitName.
                organizationalUnitId: 0,
            });
        }
    }, [user, isOpen]);

    // Effect to set roleId and unitId when roles/units are loaded and user matches
    useEffect(() => {
        if (user && roles.length > 0 && formData.roleId === 0) {
            const foundRole = roles.find(r => r.name === user.roleName);
            if (foundRole) {
                setFormData(prev => ({ ...prev, roleId: foundRole.id }));
            }
        }
        if (user && units.length > 0 && formData.organizationalUnitId === 0) {
            const foundUnit = units.find(u => u.name === user.organizationalUnitName);
            if (foundUnit) {
                setFormData(prev => ({ ...prev, organizationalUnitId: foundUnit.id }));
            }
        }
    }, [user, roles, units, formData.roleId, formData.organizationalUnitId]);

    // Enforce Organizational Unit = 1 if Role is User/Student
    useEffect(() => {
        const selectedRole = roles.find(r => r.id === formData.roleId);
        if (selectedRole && (selectedRole.name.toUpperCase() === 'USER' || selectedRole.name.toUpperCase() === 'STUDENT')) {
            setFormData(prev => ({ ...prev, organizationalUnitId: 1 }));
        }
    }, [formData.roleId, roles]);

    const handleInputChange = (field: keyof UpdateUserData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const isUserRole = () => {
        const selectedRole = roles.find(r => r.id === formData.roleId);
        return selectedRole && (selectedRole.name.toUpperCase() === 'USER' || selectedRole.name.toUpperCase() === 'STUDENT');
    };

    const handleSubmit = () => {
        if (user) {
            onConfirm(user.id, formData);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Update User</DialogTitle>
                    <DialogDescription>
                        Update user details. Leave password blank to keep current password.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="edit-firstName">First Name</Label>
                            <Input
                                id="edit-firstName"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                placeholder="First Name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-lastName">Last Name</Label>
                            <Input
                                id="edit-lastName"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                placeholder="Last Name"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                            id="edit-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Email"
                        />
                    </div>

                    <div>
                        <Label htmlFor="edit-password">Password (Optional)</Label>
                        <Input
                            id="edit-password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="New password"
                        />
                    </div>

                    <div>
                        <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                        <Input
                            id="edit-phoneNumber"
                            value={formData.phoneNumber}
                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                            placeholder="Phone Number"
                        />
                    </div>

                    <div>
                        <Label htmlFor="edit-organizationalUnit">Organizational Unit</Label>
                        <Select
                            value={formData.organizationalUnitId ? formData.organizationalUnitId.toString() : ''}
                            onValueChange={(value) => handleInputChange('organizationalUnitId', parseInt(value))}
                            disabled={isUserRole()}
                        >
                            <SelectTrigger id="edit-organizationalUnit">
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
                        <Label htmlFor="edit-role">Role</Label>
                        <Select
                            value={formData.roleId ? formData.roleId.toString() : ''}
                            onValueChange={(value) => handleInputChange('roleId', parseInt(value))}
                        >
                            <SelectTrigger id="edit-role">
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
                                            {role.name}
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
                        onClick={onClose}
                        disabled={isUpdating}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isUpdating || rolesLoading}>
                        {isUpdating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            'Update User'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
