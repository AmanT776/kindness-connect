import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UpdateCategoryData, Category } from '@/services/categories';
import { Loader2 } from 'lucide-react';

interface CategoryUpdateDialogProps {
    category: Category | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (categoryId: number, data: UpdateCategoryData) => Promise<void>;
    isUpdating: boolean;
}

export function CategoryUpdateDialog({
    category,
    isOpen,
    onClose,
    onConfirm,
    isUpdating
}: CategoryUpdateDialogProps) {
    const [formData, setFormData] = useState<UpdateCategoryData>({
        name: '',
        isActive: true,
    });

    useEffect(() => {
        if (category && isOpen) {
            setFormData({
                name: category.name,
                isActive: category.isActive,
            });
        }
    }, [category, isOpen]);

    const handleInputChange = (field: keyof UpdateCategoryData, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        if (category) {
            onConfirm(category.id, formData);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Category</DialogTitle>
                    <DialogDescription>
                        Update category details.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Category Name"
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
                            'Update Category'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
