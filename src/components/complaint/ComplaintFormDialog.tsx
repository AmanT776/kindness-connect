import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X, FileText, Image, File, AlertCircle } from 'lucide-react';
import { createComplaint } from '@/services/compliant';
import { useCategories } from '@/hooks/useCategories';
import { useOrganizationalUnits } from '@/hooks/useOrganizationalUnits';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface ComplaintFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (referenceNumber: string) => void;
}

export function ComplaintFormDialog({
    isOpen,
    onClose,
    onSuccess
}: ComplaintFormDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
    const { units, isLoading: unitsLoading, error: unitsError } = useOrganizationalUnits(1);

    const [isLoading, setIsLoading] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<number | null>(null);
    const [department, setDepartment] = useState<number | null>(null);
    const [attachments, setAttachments] = useState<{ file: File; name: string; url: string; type: string }[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newAttachments = Array.from(files).map(file => ({
                file,
                name: file.name,
                url: URL.createObjectURL(file),
                type: file.type,
            }));
            setAttachments(prev => [...prev, ...newAttachments]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return Image;
        if (type.includes('pdf')) return FileText;
        return File;
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setCategory(null);
        setDepartment(null);
        setIsAnonymous(false);
        setAttachments([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!category) {
            toast({
                title: 'Category required',
                description: 'Please select a complaint category.',
                variant: 'destructive',
            });
            return;
        }

        if (!department) {
            toast({
                title: 'Department required',
                description: 'Please select a department.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('organizationalUnitId', department.toString());
            formData.append('isAnonymous', isAnonymous.toString());
            formData.append('categoryId', category.toString());

            // Add userId if not anonymous and user is authenticated
            if (!isAnonymous && user?.id) {
                formData.append('userId', user.id.toString());
            }

            // Add files
            attachments.forEach((att) => {
                formData.append('files', att.file);
            });

            const res = await createComplaint(formData);

            if (res.success) {
                toast({
                    title: 'Complaint submitted successfully!',
                    description: res.data?.referenceNumber
                        ? `Reference number: ${res.data.referenceNumber}`
                        : 'Your complaint has been received.',
                });

                resetForm();
                onSuccess?.(res.data?.referenceNumber || '');
                onClose();
            } else {
                toast({
                    title: 'Submission failed',
                    description: res.message || 'Failed to submit complaint.',
                    variant: 'destructive',
                });
            }
        } catch (error: any) {
            console.error('Error submitting complaint:', error);

            const errorMessage = error?.response?.data?.message
                || error?.response?.data?.error
                || error?.message
                || 'There was a problem submitting your complaint. Please try again.';

            toast({
                title: 'Submission failed',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            resetForm();
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Submit a Complaint</DialogTitle>
                    <DialogDescription>
                        Fill out the form below to submit your complaint. All fields marked with * are required.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        {categoriesError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <div className="flex items-center justify-between">
                                        <span>
                                            Failed to load categories. {categoriesError instanceof Error ? categoriesError.message : 'Please try again.'}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => queryClient.invalidateQueries({ queryKey: ['categories'] })}
                                            className="ml-4"
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}
                        <Select
                            value={category?.toString()}
                            onValueChange={(val) => setCategory(parseInt(val))}
                            disabled={categoriesLoading || categories.length === 0}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={categoriesLoading ? "Loading categories..." : categories.length === 0 ? "No categories available" : "Select a category"} />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.length === 0 && !categoriesLoading ? (
                                    <SelectItem value="no-categories" disabled>
                                        No categories available
                                    </SelectItem>
                                ) : (
                                    categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                        <Label htmlFor="department">Department / Service Area *</Label>
                        {unitsError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <div className="flex items-center justify-between">
                                        <span>
                                            Failed to load departments. {unitsError instanceof Error ? unitsError.message : 'Please try again.'}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => queryClient.invalidateQueries({ queryKey: ['organizationalUnits'] })}
                                            className="ml-4"
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}
                        <Select
                            value={department?.toString()}
                            onValueChange={(val) => setDepartment(parseInt(val))}
                            disabled={unitsLoading || units.length === 0}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={unitsLoading ? "Loading departments..." : units.length === 0 ? "No departments available" : "Select department"} />
                            </SelectTrigger>
                            <SelectContent>
                                {units.length === 0 && !unitsLoading ? (
                                    <SelectItem value="no-departments" disabled>
                                        No departments available
                                    </SelectItem>
                                ) : (
                                    units.map((unit) => (
                                        <SelectItem key={unit.id} value={unit.id.toString()}>
                                            {unit.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            placeholder="Brief summary of your complaint"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            placeholder="Provide detailed information about your complaint..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                            required
                        />
                    </div>

                    {/* Anonymous Checkbox */}
                    {/* <div className="flex items-center space-x-2">
                        <Checkbox
                            id="anonymous"
                            checked={isAnonymous}
                            onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                        />
                        <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
                            Submit anonymously
                        </Label>
                    </div> */}

                    {/* Attachments */}
                    <div className="space-y-2">
                        <Label>Attachments (Optional)</Label>
                        <div
                            className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                                Click to upload documents, images, or screenshots
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Supports PDF, JPG, PNG up to 10MB
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*,.pdf,.doc,.docx"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        {attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {attachments.map((file, index) => {
                                    const Icon = getFileIcon(file.type);
                                    return (
                                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => removeAttachment(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Complaint
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
