import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UpdateRoleData, Role } from '@/services/roles';
import { Loader2 } from 'lucide-react';

interface RoleUpdateDialogProps {
    role: Role | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (roleId: number, data: UpdateRoleData) => Promise<void>;
    isUpdating: boolean;
}

export function RoleUpdateDialog({
    role,
    isOpen,
    onClose,
    onConfirm,
    isUpdating
}: RoleUpdateDialogProps) {
    const [formData, setFormData] = useState<UpdateRoleData>({
        name: '',
        description: '',
        isActive: true,
    });

    useEffect(() => {
        if (role && isOpen) {
            setFormData({
                name: role.name,
                description: role.description || '',
                isActive: role.isActive,
            });
        }
    }, [role, isOpen]);

    const handleInputChange = (field: keyof UpdateRoleData, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        if (role) {
            onConfirm(role.id, formData);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Role</DialogTitle>
                    <DialogDescription>
                        Update role details.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Role Name"
                        />
                    </div>
                    <div>
                        <Label htmlFor="edit-description">Description</Label>
                        <Input
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Role Description"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="edit-active"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => handleInputChange('isActive', checked as boolean)}
                        />
                        <Label htmlFor="edit-active">Active</Label>
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
                    <Button onClick={handleSubmit} disabled={isUpdating}>
                        {isUpdating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            'Update Role'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
