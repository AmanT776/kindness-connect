import { Link, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useComplaints } from '@/contexts/ComplaintsContext';
import { ComplaintCard } from '@/components/complaint/ComplaintCard';
import { Plus, FileText, Clock, CheckCircle, AlertCircle, Search, Filter, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { getComplaintsByUser } = useComplaints();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // For officers/admins, redirect to admin dashboard
  if (user?.role !== 'student') {
    return <Navigate to="/admin" replace />;
  }

  const userComplaints = getComplaintsByUser(user.id);

  // Filter complaints based on search term
  const filteredComplaints = userComplaints.filter(complaint =>
    complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter by status for tabs
  const getComplaintsByStatus = (status: string) => {
    if (status === 'all') return filteredComplaints;
    if (status === 'pending') return filteredComplaints.filter(c => c.status === 'received' || c.status === 'under_review');
    if (status === 'resolved') return filteredComplaints.filter(c => c.status === 'resolved');
    if (status === 'closed') return filteredComplaints.filter(c => c.status === 'closed');
    return filteredComplaints.filter(c => c.status === status);
  };

  const stats = {
    total: userComplaints.length,
    pending: userComplaints.filter(c => c.status === 'received' || c.status === 'under_review').length,
    resolved: userComplaints.filter(c => c.status === 'resolved').length,
    closed: userComplaints.filter(c => c.status === 'closed').length,
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
            <Button variant="outline" asChild>
              <Link to="/track">
                <Search className="mr-2 h-4 w-4" />
                Track Complaint
              </Link>
            </Button>
            <Button asChild>
              <Link to="/submit">
                <Plus className="mr-2 h-4 w-4" />
                New Complaint
              </Link>
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
                    placeholder="Search complaints by title, description, or reference number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="md:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
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
                <ComplaintsList complaints={getComplaintsByStatus('all')} />
              </TabsContent>

              <TabsContent value="pending" className="mt-6">
                <ComplaintsList complaints={getComplaintsByStatus('pending')} />
              </TabsContent>

              <TabsContent value="resolved" className="mt-6">
                <ComplaintsList complaints={getComplaintsByStatus('resolved')} />
              </TabsContent>

              <TabsContent value="closed" className="mt-6">
                <ComplaintsList complaints={getComplaintsByStatus('closed')} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

// Helper component for complaints list
const ComplaintsList = ({ complaints }: { complaints: any[] }) => {
  if (complaints.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No complaints found</h3>
        <p className="text-muted-foreground mt-1">
          {complaints.length === 0 ? "Submit your first complaint to get started." : "No complaints match your current filter."}
        </p>
        <Button className="mt-4" asChild>
          <Link to="/submit">
            <Plus className="mr-2 h-4 w-4" />
            Submit a Complaint
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {complaints.map((complaint) => (
        <ComplaintCard
          key={complaint.id}
          complaint={complaint}
          linkTo={`/track?ref=${complaint.referenceNumber}`}
        />
      ))}
    </div>
  );
};

export default Dashboard;
