import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UpdateOrganizationalUnitData, OrganizationalUnit } from '@/services/organizationalUnits';
import { Loader2 } from 'lucide-react';
import { useUnitTypes } from '@/hooks/useUnitTypes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OrganizationalUnitUpdateDialogProps {
    unit: OrganizationalUnit | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (unitId: number, data: UpdateOrganizationalUnitData) => Promise<void>;
    isUpdating: boolean;
}

export function OrganizationalUnitUpdateDialog({
    unit,
    isOpen,
    onClose,
    onConfirm,
    isUpdating
}: OrganizationalUnitUpdateDialogProps) {
    const { unitTypes, isLoading: unitTypesLoading } = useUnitTypes();
    const [formData, setFormData] = useState<UpdateOrganizationalUnitData>({
        name: '',
        unitTypeId: 1,
        unitEmail: '',
        phoneNumber: '',
        remark: '',
        status: 1,
        currentUserId: 1,
    });

    useEffect(() => {
        if (unit && isOpen) {
            setFormData({
                name: unit.name,
                unitTypeId: unit.unitTypeId,
                unitEmail: unit.unitEmail,
                phoneNumber: unit.phoneNumber,
                remark: unit.remark,
                status: unit.status,
                currentUserId: unit.currentUserId,
            });
        }
    }, [unit, isOpen]);

    const handleInputChange = (field: keyof UpdateOrganizationalUnitData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        if (unit) {
            onConfirm(unit.id, formData);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Update Organizational Unit</DialogTitle>
                    <DialogDescription>
                        Update organizational unit details.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="edit-name">Name *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Unit Name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-unitTypeId">Unit Type *</Label>
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
                            <Label htmlFor="edit-unitEmail">Unit Email *</Label>
                            <Input
                                id="edit-unitEmail"
                                type="email"
                                value={formData.unitEmail}
                                onChange={(e) => handleInputChange('unitEmail', e.target.value)}
                                placeholder="unit@example.com"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-phoneNumber">Phone Number *</Label>
                            <Input
                                id="edit-phoneNumber"
                                value={formData.phoneNumber}
                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                placeholder="+251900000000"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="edit-remark">Remark</Label>
                        <Input
                            id="edit-remark"
                            value={formData.remark}
                            onChange={(e) => handleInputChange('remark', e.target.value)}
                            placeholder="Additional information"
                        />
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
                            'Update Unit'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
