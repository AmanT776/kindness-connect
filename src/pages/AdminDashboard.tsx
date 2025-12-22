import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useComplaints } from '@/contexts/ComplaintsContext';
import { StatusBadge } from '@/components/complaint/StatusBadge';
import { CategoryBadge } from '@/components/complaint/CategoryBadge';
import { Complaint, ComplaintStatus, ComplaintCategory, statusLabels, categoryLabels } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, Clock, CheckCircle, AlertCircle, Search, 
  User, UserX, Calendar, MessageSquare, Filter 
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { complaints, updateComplaintStatus, addOfficerComment } = useComplaints();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'all'>('all');
  const [anonymousFilter, setAnonymousFilter] = useState<'all' | 'anonymous' | 'identified'>('all');
  
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus | ''>('');
  const [statusComment, setStatusComment] = useState('');
  const [newComment, setNewComment] = useState('');

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
    const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;
    const matchesAnonymous = 
      anonymousFilter === 'all' || 
      (anonymousFilter === 'anonymous' && complaint.isAnonymous) ||
      (anonymousFilter === 'identified' && !complaint.isAnonymous);

    return matchesSearch && matchesStatus && matchesCategory && matchesAnonymous;
  });

  const stats = {
    total: complaints.length,
    received: complaints.filter(c => c.status === 'received').length,
    underReview: complaints.filter(c => c.status === 'under_review').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    anonymous: complaints.filter(c => c.isAnonymous).length,
  };

  const handleUpdateStatus = () => {
    if (!selectedComplaint || !newStatus) return;
    
    updateComplaintStatus(selectedComplaint.id, newStatus, statusComment, user?.name);
    
    toast({
      title: 'Status updated',
      description: `Complaint ${selectedComplaint.referenceNumber} status changed to ${statusLabels[newStatus]}.`,
    });
    
    setNewStatus('');
    setStatusComment('');
    setSelectedComplaint(null);
  };

  const handleAddComment = () => {
    if (!selectedComplaint || !newComment.trim()) return;
    
    addOfficerComment(selectedComplaint.id, newComment, user?.name || 'Officer');
    
    toast({
      title: 'Comment added',
      description: 'Your comment has been added to the complaint.',
    });
    
    setNewComment('');
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage and respond to complaints</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5 mb-8">
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
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as ComplaintStatus | 'all')}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {(Object.keys(statusLabels) as ComplaintStatus[]).map(status => (
                    <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val as ComplaintCategory | 'all')}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {(Object.keys(categoryLabels) as ComplaintCategory[]).map(cat => (
                    <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
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
            <div className="space-y-4">
              {filteredComplaints.map((complaint) => (
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
                          <User className="h-3 w-3" /> {complaint.submitterName}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium truncate">{complaint.title}</h3>
                    <p className="text-sm text-muted-foreground truncate mt-1">{complaint.description}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <CategoryBadge category={complaint.category} />
                    <StatusBadge status={complaint.status} />
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(complaint.createdAt), 'MMM d')}
                    </span>
                  </div>
                </div>
              ))}

              {filteredComplaints.length === 0 && (
                <div className="text-center py-12">
                  <Filter className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No complaints found</h3>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
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
                    <StatusBadge status={selectedComplaint.status} />
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
                        <p className="font-medium">{selectedComplaint.submitterName}</p>
                        <p className="text-sm text-muted-foreground">{selectedComplaint.submitterEmail}</p>
                      </div>
                    )}
                    {(selectedComplaint.contactEmail || selectedComplaint.contactPhone) && (
                      <div className="mt-2 pt-2 border-t text-sm">
                        <p className="text-muted-foreground">Contact for updates:</p>
                        {selectedComplaint.contactEmail && <p>{selectedComplaint.contactEmail}</p>}
                        {selectedComplaint.contactPhone && <p>{selectedComplaint.contactPhone}</p>}
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
                      <CategoryBadge category={selectedComplaint.category} className="mt-1" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="text-sm font-medium mt-1">{selectedComplaint.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Submitted</p>
                      <p className="text-sm font-medium mt-1">
                        {format(new Date(selectedComplaint.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Update Status</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Select value={newStatus} onValueChange={(val) => setNewStatus(val as ComplaintStatus)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(statusLabels) as ComplaintStatus[]).map(status => (
                            <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Add a comment (optional)"
                        value={statusComment}
                        onChange={(e) => setStatusComment(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleUpdateStatus} disabled={!newStatus}>
                        Update
                      </Button>
                    </div>
                  </div>

                  {/* Add Comment */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Add Comment
                    </h4>
                    <div className="flex gap-3">
                      <Textarea
                        placeholder="Write a comment for the complainant..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                        className="flex-1"
                      />
                      <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        Send
                      </Button>
                    </div>
                  </div>

                  {/* Previous Comments */}
                  {selectedComplaint.officerComments.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Previous Comments</h4>
                      <div className="space-y-3">
                        {selectedComplaint.officerComments.map((comment, index) => (
                          <div key={index} className="rounded-lg bg-muted/50 p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{comment.officerName}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.date), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            <p className="text-sm">{comment.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedComplaint(null)}>
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
