import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useComplaints } from '@/contexts/ComplaintsContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X, FileText, Image, File, AlertCircle } from 'lucide-react';
import { createComplaint } from '@/services/compliant';
import { useCategories } from '@/hooks/useCategories';
import { useOrganizationalUnits } from '@/hooks/useOrganizationalUnits';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Copy, CheckCircle2 } from 'lucide-react';

const SubmitComplaint = () => {
  const { user, isAuthenticated } = useAuth();
  const { addComplaint } = useComplaints();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { units, isLoading: unitsLoading, error: unitsError } = useOrganizationalUnits(1); // parentId = 1

  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<number | null>(null);
  const [department, setDepartment] = useState<number | null>(null);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [attachments, setAttachments] = useState<{ file: File; name: string; url: string; type: string }[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [copied, setCopied] = useState(false);

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

      // Set isAnonymous to false as required
      // Try both field names in case backend expects different spelling
      formData.append('isAnonymous', 'true');

      formData.append('categoryId', category.toString());

      attachments.forEach((att) => {
        formData.append('files', att.file);
      });

      const res = await createComplaint(formData);

      // Extract reference number from response
      if (res.success && res.data?.referenceNumber) {
        setReferenceNumber(res.data.referenceNumber);
        setShowSuccessDialog(true);
      } else {
        toast({
          title: 'Complaint submitted successfully!',
          description: 'Your complaint has been received.',
        });
        navigate('/track');
      }
    } catch (error: any) {
      console.error('Error submitting complaint:', error);
      console.error('Error response data:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      
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
  console.log(title, description, category, department, isAnonymous, attachments);
  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-3xl font-bold md:text-4xl">Submit a Complaint Anonymously</h1>
            <p className="mt-2 text-muted-foreground">
              Fill out the form below to submit your complaint. All fields marked with * are required.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Complaint Details</CardTitle>
              <CardDescription>
                Provide as much detail as possible to help us address your concern.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">

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

                {/* Contact Information (Optional)
                <div className="space-y-4 rounded-lg border p-4">
                  <div>
                    <h3 className="font-medium">Contact for Updates (Optional)</h3>
                    <p className="text-sm text-muted-foreground">
                      Even when submitting anonymously, you can provide contact info for updates.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div> */}

                {/* Submitter Info Display */}
                {isAuthenticated && !isAnonymous && (
                  <div className="rounded-lg bg-muted/50 p-4 text-sm">
                    <p className="font-medium">Submitting as:</p>
                    <p className="text-muted-foreground">{user?.name} ({user?.email})</p>
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Complaint
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>

      {/* Success Dialog with Reference Number */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <AlertDialogTitle>Complaint Submitted Successfully!</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4">
              <p className="mb-4">Your complaint has been received and is being processed.</p>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Your Reference Number:</p>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <code className="flex-1 font-mono text-sm font-semibold">{referenceNumber}</code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(referenceNumber);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Important:</strong> Please save this reference number. You will need it to track the status of your complaint in the future.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowSuccessDialog(false);
              navigate('/track');
            }}>
              Track My Complaint
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default SubmitComplaint;
