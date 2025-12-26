import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useComplaintsList } from '@/hooks/useComplaints';
import { useCategories } from '@/hooks/useCategories';
import { useOrganizationalUnits } from '@/hooks/useOrganizationalUnits';
import { useUpdateComplaintStatus } from '@/hooks/useUpdateComplaintStatus';
import { useDeleteComplaint } from '@/hooks/useDeleteComplaint';
import { AdminStats } from '@/components/admin/AdminStats';
import { ComplaintFilters } from '@/components/admin/ComplaintFilters';
import { ComplaintsList } from '@/components/admin/ComplaintsList';
import { ComplaintDetailDialog } from '@/components/admin/ComplaintDetailDialog';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { ComplaintData } from '@/services/compliant';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { complaints, isLoading: complaintsLoading, refetch } = useComplaintsList();
  const { categories } = useCategories();
  const { units } = useOrganizationalUnits(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [anonymousFilter, setAnonymousFilter] = useState<'all' | 'anonymous' | 'identified'>('all');

  // Local state for dialogs and selected complaint
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState<ComplaintData | null>(null);

  // Use dedicated hooks
  const { updateStatus, isUpdating } = useUpdateComplaintStatus({
    onSuccess: () => {
      setSelectedComplaint(null);
      refetch();
    },
  });

  const { deleteComplaint, isDeleting } = useDeleteComplaint({
    onSuccess: () => {
      setShowDeleteDialog(false);
      setComplaintToDelete(null);
      if (selectedComplaint?.id === complaintToDelete?.id) {
        setSelectedComplaint(null);
      }
      refetch();
    },
  });

  // Handler functions
  const handleUpdateStatus = async (status: string) => {
    if (!selectedComplaint || !status) return;
    await updateStatus(selectedComplaint.id, status, selectedComplaint.referenceNumber);
  };

  const handleDeleteClick = (complaint: ComplaintData) => {
    setComplaintToDelete(complaint);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!complaintToDelete) return;
    await deleteComplaint(complaintToDelete.id, complaintToDelete.referenceNumber);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setComplaintToDelete(null);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  // Helper functions
  const getCategoryName = (categoryId: number) => {
    return categories.find(cat => cat.id === categoryId)?.name || `Category ID: ${categoryId}`;
  };

  const getUnitName = (unitId: number) => {
    return units.find(unit => unit.id === unitId)?.name || `Unit ID: ${unitId}`;
  };

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

  // Calculate stats
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'PENDING').length,
    received: complaints.filter(c => c.status === 'RECEIVED').length,
    underReview: complaints.filter(c => c.status === 'UNDER_REVIEW').length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length,
    closed: complaints.filter(c => c.status === 'CLOSED').length,
    anonymous: complaints.filter(c => c.isAnonymous).length,
  };

  return (
    <AdminLayout>
      <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage and respond to complaints</p>
        </div>

        {/* Stats */}
        <AdminStats stats={stats} />

        {/* Filters */}
        <ComplaintFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          anonymousFilter={anonymousFilter}
          setAnonymousFilter={setAnonymousFilter}
          categories={categories}
        />

        {/* Complaints List */}
        <ComplaintsList
          complaints={filteredComplaints}
          isLoading={complaintsLoading}
          onComplaintClick={setSelectedComplaint}
          getCategoryName={getCategoryName}
          getStatusDisplay={getStatusDisplay}
        />

        {/* Complaint Detail Dialog */}
        <ComplaintDetailDialog
          complaint={selectedComplaint}
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdateStatus={handleUpdateStatus}
          onDeleteClick={handleDeleteClick}
          getCategoryName={getCategoryName}
          getUnitName={getUnitName}
          getStatusDisplay={getStatusDisplay}
          isUpdating={isUpdating}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          complaint={complaintToDelete}
          isOpen={showDeleteDialog}
          onClose={closeDeleteDialog}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;