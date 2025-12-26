import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrgComplaints } from '@/hooks/useComplaints';
import { useCategories } from '@/hooks/useCategories';
import { useOrganizationalUnits } from '@/hooks/useOrganizationalUnits';
import { useUpdateComplaintStatus } from '@/hooks/useUpdateComplaintStatus';
import { AdminStats } from '@/components/admin/AdminStats';

import { ComplaintFilters } from '@/components/admin/ComplaintFilters';
import { ComplaintsList } from '@/components/admin/ComplaintsList';
import { ComplaintDetailDialog } from '@/components/admin/ComplaintDetailDialog';
import { ComplaintData } from '@/services/compliant';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';

export default function StaffDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Fetch complaints based on user's organization ID
    const { complaints, isLoading: complaintsLoading, refetch } = useOrgComplaints(user?.organizationalUnitId);
    console.log("orgid user", user?.organizationalUnitId);

    // Hooks for details
    const { categories } = useCategories();
    const { units } = useOrganizationalUnits(1); // Assuming 1 is main campus or handled by hook logic

    // Local state
    const [selectedComplaint, setSelectedComplaint] = useState<ComplaintData | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
    const [anonymousFilter, setAnonymousFilter] = useState<'all' | 'anonymous' | 'identified'>('all');

    // dedicated mutation hooks
    const { updateStatus, isUpdating } = useUpdateComplaintStatus({
        onSuccess: () => {
            setSelectedComplaint(null);
            refetch();
        },
    });

    // Handler functions
    const handleUpdateStatus = async (status: string) => {
        if (!selectedComplaint || !status) return;
        await updateStatus(selectedComplaint.id, status, selectedComplaint.referenceNumber);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

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
    const filteredComplaints = complaints.filter(complaint => {
        const matchesSearch =
            (complaint.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (complaint.referenceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (complaint.description || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || complaint.categoryId === categoryFilter;
        const matchesAnonymous =
            anonymousFilter === 'all' ||
            (anonymousFilter === 'anonymous' && complaint.isAnonymous) ||
            (anonymousFilter === 'identified' && !complaint.isAnonymous);

        return matchesSearch && matchesStatus && matchesCategory && matchesAnonymous;
    });

    // Calculate dynamic stats

    // Calculate dynamic stats
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
        <div className="flex flex-col min-h-screen w-full bg-background">
            {/* Header */}
            <div className="flex h-16 items-center gap-2 border-b px-4 bg-card">
                <div className="flex items-center gap-2 font-semibold text-lg px-2">
                    <span>Staff Dashboard</span>
                </div>
                <div className="flex-1" />
                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">{user.name}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <div className="px-2 py-1.5">
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <div className="container py-8">
                <div className="mb-8">
                    <h1 className="font-heading text-3xl font-bold">Complaints Overview</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {user?.name}. Here's an overview of complaints assigned to {user?.department || 'your department'}.
                    </p>
                </div>

                {/* Stats Section */}
                <AdminStats stats={stats} />

                <div className="grid grid-cols-1 gap-8">
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
                </div>

                {/* Complaint Detail Dialog */}
                <ComplaintDetailDialog
                    complaint={selectedComplaint}
                    isOpen={!!selectedComplaint}
                    onClose={() => setSelectedComplaint(null)}
                    getCategoryName={getCategoryName}
                    getUnitName={getUnitName}
                    getStatusDisplay={getStatusDisplay}
                    readOnly={true}
                />
            </div>
        </div>
    );
}
