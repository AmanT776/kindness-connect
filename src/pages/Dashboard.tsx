import { Link, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useUserComplaints } from '@/hooks/useComplaints';
import { useUpdateComplaint } from '@/hooks/useUpdateComplaint';
import { useDeleteComplaint } from '@/hooks/useDeleteComplaint';
import { ComplaintCard } from '@/components/complaint/ComplaintCard';
import { ComplaintFormDialog } from '@/components/complaint/ComplaintFormDialog';
import { ComplaintData } from '@/services/compliant';
import { Plus, FileText, Clock, CheckCircle, AlertCircle, Search, Filter, TrendingUp, Loader2, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { complaints: userComplaints, isLoading, refetch } = useUserComplaints(user?.id);
  const { update, isUpdating } = useUpdateComplaint();
  const { deleteComplaint, isDeleting } = useDeleteComplaint();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showComplaintDialog, setShowComplaintDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // For officers/admins, redirect to admin dashboard
  if (user?.role !== 'student') {
    return <Navigate to="/admin" replace />;
  }

  // Filter complaints based on search term
  const filteredComplaints = userComplaints.filter(complaint =>
    complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter by status for tabs
  const getComplaintsByStatus = (status: string) => {
    if (status === 'all') return filteredComplaints;
    if (status === 'pending') return filteredComplaints.filter(c => c.status === 'PENDING' || c.status === 'RECEIVED' || c.status === 'UNDER_REVIEW');
    if (status === 'resolved') return filteredComplaints.filter(c => c.status === 'RESOLVED');
    if (status === 'closed') return filteredComplaints.filter(c => c.status === 'CLOSED');
    return filteredComplaints.filter(c => c.status === status);
  };

  const stats = {
    total: userComplaints.length,
    pending: userComplaints.filter(c => c.status === 'PENDING' || c.status === 'RECEIVED' || c.status === 'UNDER_REVIEW').length,
    resolved: userComplaints.filter(c => c.status === 'RESOLVED').length,
    closed: userComplaints.filter(c => c.status === 'CLOSED').length,
  };

  const handleEditClick = () => {
    if (selectedComplaint) {
      setEditTitle(selectedComplaint.title);
      setEditDescription(selectedComplaint.description);
      setIsEditMode(true);
    }
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;

    await update(selectedComplaint.id, {
      title: editTitle,
      description: editDescription,
      categoryId: selectedComplaint.categoryId,
      organizationalUnitId: selectedComplaint.organizationalUnitId,
    }, () => {
      setIsEditMode(false);
      setSelectedComplaint(null);
      refetch();
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedComplaint) return;

    await deleteComplaint(selectedComplaint.id, () => {
      setShowDeleteDialog(false);
      setSelectedComplaint(null);
      refetch();
    });
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditTitle('');
    setEditDescription('');
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold">My Complaint Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowComplaintDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Complaint
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-blue-100">Total Complaints</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-orange-100">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                  <p className="text-sm text-green-100">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.closed}</p>
                  <p className="text-sm text-gray-100">Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search complaints by title, description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              My Complaints
            </CardTitle>
            <CardDescription>
              View and track all your submitted complaints
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    All
                    <Badge variant="secondary" className="ml-1">{stats.total}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="flex items-center gap-2">
                    Pending
                    <Badge variant="secondary" className="ml-1">{stats.pending}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className="flex items-center gap-2">
                    Resolved
                    <Badge variant="secondary" className="ml-1">{stats.resolved}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="closed" className="flex items-center gap-2">
                    Closed
                    <Badge variant="secondary" className="ml-1">{stats.closed}</Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  <ComplaintsList
                    complaints={getComplaintsByStatus('all')}
                    onNewComplaint={() => setShowComplaintDialog(true)}
                    onComplaintClick={(complaint) => setSelectedComplaint(complaint)}
                  />
                </TabsContent>

                <TabsContent value="pending" className="mt-6">
                  <ComplaintsList
                    complaints={getComplaintsByStatus('pending')}
                    onNewComplaint={() => setShowComplaintDialog(true)}
                    onComplaintClick={(complaint) => setSelectedComplaint(complaint)}
                  />
                </TabsContent>

                <TabsContent value="resolved" className="mt-6">
                  <ComplaintsList
                    complaints={getComplaintsByStatus('resolved')}
                    onNewComplaint={() => setShowComplaintDialog(true)}
                    onComplaintClick={(complaint) => setSelectedComplaint(complaint)}
                  />
                </TabsContent>

                <TabsContent value="closed" className="mt-6">
                  <ComplaintsList
                    complaints={getComplaintsByStatus('closed')}
                    onNewComplaint={() => setShowComplaintDialog(true)}
                    onComplaintClick={(complaint) => setSelectedComplaint(complaint)}
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Complaint Form Dialog */}
      <ComplaintFormDialog
        isOpen={showComplaintDialog}
        onClose={() => setShowComplaintDialog(false)}
        onSuccess={(referenceNumber) => {
          console.log('Complaint submitted with reference:', referenceNumber);
          refetch(); // Refresh the complaints list
        }}
      />

      {/* Complaint Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={(open) => !open && setSelectedComplaint(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-4">
              {/* Reference Number */}
              <div>
                <p className="text-sm text-muted-foreground">Reference Number</p>
                <p className="font-mono font-semibold">{selectedComplaint.referenceNumber}</p>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Title</Label>
                {isEditMode ? (
                  <Input
                    id="title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-semibold mt-1">{selectedComplaint.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                {isEditMode ? (
                  <Textarea
                    id="description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={6}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap mt-1">{selectedComplaint.description}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge variant="secondary">{selectedComplaint.status}</Badge>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="text-sm">{format(new Date(selectedComplaint.createdAt), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{format(new Date(selectedComplaint.updatedAt), 'PPP')}</p>
                </div>
              </div>

              {/* Files */}
              {selectedComplaint.files && selectedComplaint.files.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Attachments ({selectedComplaint.files.length})</p>
                  <div className="space-y-2">
                    {selectedComplaint.files.map((file, index) => (
                      <div key={file.id} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm flex-1">Attachment {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`${import.meta.env.VITE_API_URL}${file.file_path}`, '_blank')}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between items-center">
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit} disabled={isUpdating}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateComplaint} disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="destructive" onClick={handleDeleteClick} disabled={isDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button onClick={handleEditClick}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Complaint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this complaint? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

// Helper component for complaints list
const ComplaintsList = ({ complaints, onNewComplaint, onComplaintClick }: { complaints: any[]; onNewComplaint: () => void; onComplaintClick: (complaint: any) => void }) => {
  if (complaints.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No complaints found</h3>
        <p className="text-muted-foreground mt-1">
          {complaints.length === 0 ? "Submit your first complaint to get started." : "No complaints match your current filter."}
        </p>
        <Button className="mt-4" onClick={onNewComplaint}>
          <Plus className="mr-2 h-4 w-4" />
          Submit a Complaint
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {complaints.map((complaint) => (
        <div key={complaint.id} onClick={() => onComplaintClick(complaint)} className="cursor-pointer">
          <ComplaintCard
            complaint={complaint}
          />
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
