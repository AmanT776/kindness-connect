import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { CreateCategoryData, Category, UpdateCategoryData } from '@/services/categories';
import { useToast } from '@/hooks/use-toast';
import { CategoryUpdateDialog } from '@/components/admin/CategoryUpdateDialog';
import { CategoryDeleteConfirmDialog } from '@/components/admin/CategoryDeleteConfirmDialog';
import {
    Tag, Plus, Search, Loader2, Edit, Trash2, CheckCircle, XCircle
} from 'lucide-react';

const AdminCategories = () => {
    const { user, isAuthenticated } = useAuth();
    const { categories, isLoading: categoriesLoading, refetch } = useCategories();
    const { createCategory, isCreating } = useCreateCategory();
    const { updateCategory, isUpdating } = useUpdateCategory();
    const { deleteCategory, isDeleting } = useDeleteCategory();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [categoryToUpdate, setCategoryToUpdate] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    // Form state for creating
    const [formData, setFormData] = useState<CreateCategoryData>({
        name: '',
        isActive: true,
    });

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    // Handle form input changes
    const handleInputChange = (field: keyof CreateCategoryData, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Create category
    const handleCreateCategory = async () => {
        if (!formData.name) {
            toast({
                title: 'Validation Error',
                description: 'Category name is required',
                variant: 'destructive',
            });
            return;
        }

        const newCategory = await createCategory(formData);

        if (newCategory) {
            toast({
                title: 'Success',
                description: 'Category created successfully',
            });

            setFormData({
                name: '',
                isActive: true,
            });

            setShowCreateDialog(false);
            refetch();
        } else {
            toast({
                title: 'Error',
                description: 'Failed to create category. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Handle delete category
    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;

        const success = await deleteCategory(categoryToDelete.id);

        if (success) {
            toast({
                title: 'Success',
                description: 'Category deleted successfully',
            });
            refetch();
            setCategoryToDelete(null);
        } else {
            toast({
                title: 'Error',
                description: 'Failed to delete category. It might be in use.',
                variant: 'destructive',
            });
        }
    };

    // Handle update category
    const handleUpdateCategory = async (categoryId: number, data: UpdateCategoryData) => {
        const updatedCategory = await updateCategory(categoryId, data);

        if (updatedCategory) {
            toast({
                title: 'Success',
                description: 'Category updated successfully',
            });
            refetch();
            setCategoryToUpdate(null);
        } else {
            toast({
                title: 'Error',
                description: 'Failed to update category. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Filter categories
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="container py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-heading text-3xl font-bold">Category Management</h1>
                        <p className="text-muted-foreground mt-1">Manage complaint categories</p>
                    </div>
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Category</DialogTitle>
                                <DialogDescription>
                                    Add a new complaint category to the system.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Category Name"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => handleInputChange('isActive', checked as boolean)}
                                    />
                                    <Label htmlFor="isActive">Active</Label>
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
                                <Button onClick={handleCreateCategory} disabled={isCreating}>
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Category
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
                                placeholder="Search categories by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Categories List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Categories
                        </CardTitle>
                        <CardDescription>
                            {filteredCategories.length} category(ies) found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categoriesLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="text-center py-12">
                                <Tag className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-lg font-medium">No categories found</h3>
                                <Button
                                    className="mt-4"
                                    onClick={() => setShowCreateDialog(true)}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Category
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Tag className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="font-medium">{category.name}</h3>
                                                {category.isActive ? (
                                                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                        <CheckCircle className="h-3 w-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                                        <XCircle className="h-3 w-3" /> Inactive
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCategoryToUpdate(category)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCategoryToDelete(category)}
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

                <CategoryUpdateDialog
                    category={categoryToUpdate}
                    isOpen={!!categoryToUpdate}
                    onClose={() => setCategoryToUpdate(null)}
                    onConfirm={handleUpdateCategory}
                    isUpdating={isUpdating}
                />

                <CategoryDeleteConfirmDialog
                    category={categoryToDelete}
                    isOpen={!!categoryToDelete}
                    onClose={() => setCategoryToDelete(null)}
                    onConfirm={handleDeleteCategory}
                    isDeleting={isDeleting}
                />
            </div>
        </AdminLayout>
    );
};

export default AdminCategories;
