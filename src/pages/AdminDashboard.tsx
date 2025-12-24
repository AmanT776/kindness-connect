import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge } from '@/components/complaint/StatusBadge';
import { CategoryBadge } from '@/components/complaint/CategoryBadge';
import { ComplaintStatus, ComplaintCategory, statusLabels, categoryLabels } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { updateComplaintStatus as updateComplaintStatusAPI, deleteComplaint as deleteComplaintAPI, ComplaintData } from '@/services/compliant';
import { useQueryClient } from '@tanstack/react-query';
import { useComplaintsList } from '@/hooks/useComplaints';
import { useCategories } from '@/hooks/useCategories';
import { useOrganizationalUnits } from '@/hooks/useOrganizationalUnits';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, Clock, CheckCircle, AlertCircle, Search, 
  User, UserX, Calendar, Filter, Loader2, Trash2 
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { complaints, isLoading: complaintsLoading, error: complaintsError, refetch } = useComplaintsList();
  const { categories } = useCategories();
  const { units } = useOrganizationalUnits(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [anonymousFilter, setAnonymousFilter] = useState<'all' | 'anonymous' | 'identified'>('all');
  
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintData | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState<ComplaintData | null>(null);

  // Map API status to UI status format
  const mapAPIStatusToUI = (status: string): ComplaintStatus => {
    const statusMap: Record<string, ComplaintStatus> = {
      'PENDING': 'received',
      'RECEIVED': 'received',
      'UNDER_REVIEW': 'under_review',
      'RESOLVED': 'resolved',
      'CLOSED': 'closed',
    };
    return statusMap[status] || 'received';
  };


  // Get category and unit names
  const getCategoryName = (categoryId: number) => {
    return categories.find(cat => cat.id === categoryId)?.name || `Category ID: ${categoryId}`;
  };

  const getUnitName = (unitId: number) => {
    return units.find(unit => unit.id === unitId)?.name || `Unit ID: ${unitId}`;
  };

  // Map API status to display format
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'PENDING': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      'RECEIVED': { label: 'Received', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      'UNDER_REVIEW': { label: 'Under Review', className: 'bg-purple-100 text-purple-800 border-purple-300' },
      'RESOLVED': { label: 'Resolved', className: 'bg-green-100 text-green-800 border-green-300' },
      'CLOSED': { label: 'Closed', className: 'bg-gray-100 text-gray-800 border-gray-300' },
    };
    return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-300' };
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || complaint.categoryId === categoryFilter;
    const matchesAnonymous = 
      anonymousFilter === 'all' || 
      (anonymousFilter === 'anonymous' && complaint.isAnonymous) ||
      (anonymousFilter === 'identified' && !complaint.isAnonymous);

    return matchesSearch && matchesStatus && matchesCategory && matchesAnonymous;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'PENDING').length,
    received: complaints.filter(c => c.status === 'RECEIVED').length,
    underReview: complaints.filter(c => c.status === 'UNDER_REVIEW').length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length,
    closed: complaints.filter(c => c.status === 'CLOSED').length,
    anonymous: complaints.filter(c => c.isAnonymous).length,
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint || !newStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      // Ensure status is one of the valid enum values
      const validStatuses = ['PENDING', 'RECEIVED', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'];
      const statusToSend = validStatuses.includes(newStatus) ? newStatus : newStatus.toUpperCase();
      
      console.log('Updating complaint status:', {
        id: selectedComplaint.id,
        status: statusToSend
      });
      
      const response = await updateComplaintStatusAPI(selectedComplaint.id, {
        status: statusToSend,
      });

      console.log('Status update response:', response);

      if (response && response.success) {
        toast({
          title: 'Status updated',
          description: response.message || `Complaint ${selectedComplaint.referenceNumber} status changed.`,
        });
        
        setNewStatus('');
        setSelectedComplaint(null);
        
        // Refresh complaints list
        refetch();
      } else {
        toast({
          title: 'Update failed',
          description: response?.message || 'Failed to update complaint status.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText
      });
      
      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.error 
        || error?.message
        || 'Failed to update complaint status. Please try again.';
      
      toast({
        title: 'Update failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteClick = (complaint: ComplaintData) => {
    setComplaintToDelete(complaint);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!complaintToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteComplaintAPI(complaintToDelete.id);

      if (response.success) {
        toast({
          title: 'Complaint deleted',
          description: response.message || `Complaint ${complaintToDelete.referenceNumber} has been deleted.`,
        });

        // Close dialogs and reset state
        setShowDeleteDialog(false);
        setComplaintToDelete(null);
        if (selectedComplaint?.id === complaintToDelete.id) {
          setSelectedComplaint(null);
        }

        // Refresh complaints list
        refetch();
      } else {
        toast({
          title: 'Delete failed',
          description: response.message || 'Failed to delete complaint.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error deleting complaint:', error);
      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.error 
        || error?.message
        || 'Failed to delete complaint. Please try again.';

      toast({
        title: 'Delete failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage and respond to complaints</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{stats.received}</p>
                  <p className="text-xs text-muted-foreground">New</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-info" />
                <div>
                  <p className="text-2xl font-bold">{stats.underReview}</p>
                  <p className="text-xs text-muted-foreground">Under Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <UserX className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{stats.anonymous}</p>
                  <p className="text-xs text-muted-foreground">Anonymous</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, reference, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="RECEIVED">Received</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter.toString()} onValueChange={(val) => setCategoryFilter(val === 'all' ? 'all' : parseInt(val))}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={anonymousFilter} onValueChange={(val) => setAnonymousFilter(val as 'all' | 'anonymous' | 'identified')}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="anonymous">Anonymous</SelectItem>
                  <SelectItem value="identified">Identified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Complaints</CardTitle>
            <CardDescription>
              {filteredComplaints.length} complaint(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {complaintsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => {
                  const statusDisplay = getStatusDisplay(complaint.status);
                  return (
                    <div
                      key={complaint.id}
                      className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-medium text-muted-foreground">{complaint.referenceNumber}</span>
                          {complaint.isAnonymous ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded">
                              <UserX className="h-3 w-3" /> Anonymous
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              <User className="h-3 w-3" /> Identified
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium truncate">{complaint.title}</h3>
                        <p className="text-sm text-muted-foreground truncate mt-1">{complaint.description}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                          {getCategoryName(complaint.categoryId)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusDisplay.className}`}>
                          {statusDisplay.label}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(complaint.createdAt), 'MMM d')}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredComplaints.length === 0 && (
                  <div className="text-center py-12">
                    <Filter className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No complaints found</h3>
                    <p className="text-muted-foreground mt-1">
                      {complaints.length === 0 ? 'No complaints have been submitted yet.' : 'Try adjusting your search or filter criteria.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complaint Detail Dialog */}
        <Dialog open={!!selectedComplaint} onOpenChange={(open) => !open && setSelectedComplaint(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedComplaint && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{selectedComplaint.referenceNumber}</p>
                      <DialogTitle className="mt-1">{selectedComplaint.title}</DialogTitle>
                    </div>
                    {(() => {
                      const statusDisplay = getStatusDisplay(selectedComplaint.status);
                      return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusDisplay.className}`}>
                          {statusDisplay.label}
                        </span>
                      );
                    })()}
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Submitter Info */}
                  <div className="rounded-lg bg-muted/50 p-4">
                    {selectedComplaint.isAnonymous ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <UserX className="h-4 w-4" />
                        <span>Submitted anonymously</span>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">Identified User</p>
                        <p className="text-sm text-muted-foreground">User ID: {selectedComplaint.userId || 'N/A'}</p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedComplaint.description}</p>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium mt-1 inline-block">
                        {getCategoryName(selectedComplaint.categoryId)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Organizational Unit</p>
                      <p className="text-sm font-medium mt-1">{getUnitName(selectedComplaint.organizationalUnitId)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Submitted</p>
                      <p className="text-sm font-medium mt-1">
                        {format(new Date(selectedComplaint.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Updated</p>
                      <p className="text-sm font-medium mt-1">
                        {format(new Date(selectedComplaint.updatedAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Update Status</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="RECEIVED">Received</SelectItem>
                          <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                          <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleUpdateStatus} disabled={!newStatus || isUpdatingStatus}>
                        {isUpdatingStatus ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update'
                        )}
                      </Button>
                    </div>
                  </div>

                </div>

                <DialogFooter className="flex justify-between">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteClick(selectedComplaint)}
                    className="mr-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedComplaint(null)}>
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Complaint</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete complaint <strong>{complaintToDelete?.referenceNumber}</strong>? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteDialog(false);
                  setComplaintToDelete(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
