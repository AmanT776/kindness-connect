import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UpdateUnitTypeData, UnitType } from '@/services/unitTypes';
import { Loader2 } from 'lucide-react';

interface UnitTypeUpdateDialogProps {
    unitType: UnitType | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (unitTypeId: number, data: UpdateUnitTypeData) => Promise<void>;
    isUpdating: boolean;
}

export function UnitTypeUpdateDialog({
    unitType,
    isOpen,
    onClose,
    onConfirm,
    isUpdating
}: UnitTypeUpdateDialogProps) {
    const [formData, setFormData] = useState<UpdateUnitTypeData>({
        name: '',
    });

    useEffect(() => {
        if (unitType && isOpen) {
            setFormData({
                name: unitType.name,
            });
        }
    }, [unitType, isOpen]);

    const handleInputChange = (value: string) => {
        setFormData({ name: value });
    };

    const handleSubmit = () => {
        if (unitType) {
            onConfirm(unitType.id, formData);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Unit Type</DialogTitle>
                    <DialogDescription>
                        Update unit type details.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder="Unit Type Name"
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
                            'Update Unit Type'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
