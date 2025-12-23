import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/complaint/StatusBadge';
import { Search, Calendar, Paperclip, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { getComplaintByReference, ComplaintData } from '@/services/compliant';
import { useCategories } from '@/hooks/useCategories';
import { useOrganizationalUnits } from '@/hooks/useOrganizationalUnits';

const TrackComplaint = () => {
  const location = useLocation();
  const { categories } = useCategories();
  const { units } = useOrganizationalUnits(1);
  
  const [referenceNumber, setReferenceNumber] = useState('');
  const [complaint, setComplaint] = useState<ComplaintData | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we came from submission with a reference number
    if (location.state?.referenceNumber) {
      setReferenceNumber(location.state.referenceNumber);
      handleFetchComplaint(location.state.referenceNumber);
    }
  }, [location.state]);

  const handleFetchComplaint = async (refNumber: string) => {
    if (!refNumber.trim()) return;
    
    setIsLoading(true);
    setError('');
    setSearched(true);
    
    try {
      const response = await getComplaintByReference(refNumber.trim());
      if (response.success && response.data) {
        setComplaint(response.data);
      } else {
        setComplaint(null);
        setError('No complaint found with this reference number. Please check and try again.');
      }
    } catch (error: any) {
      console.error('Error fetching complaint:', error);
      setComplaint(null);
      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.error 
        || 'No complaint found with this reference number. Please check and try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFetchComplaint(referenceNumber);
  };

  // Get category and unit names
  const categoryName = categories.find(cat => cat.id === complaint?.categoryId)?.name || `Category ID: ${complaint?.categoryId}`;
  const unitName = units.find(unit => unit.id === complaint?.organizationalUnitId)?.name || `Unit ID: ${complaint?.organizationalUnitId}`;
  
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
  
  const statusDisplay = complaint ? getStatusDisplay(complaint.status) : null;

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-3xl font-bold md:text-4xl">Track Your Complaint</h1>
            <p className="mt-2 text-muted-foreground">
              Enter your reference number to check the status of your complaint.
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="reference" className="sr-only">Reference Number</Label>
                  <Input
                    id="reference"
                    placeholder="Enter reference number (e.g., CMP-2024-001)"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="h-11"
                  />
                </div>
                <Button type="submit" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Track
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error Message */}
          {searched && error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6 text-center">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Complaint Details */}
          {complaint && (
            <div className="space-y-6 animate-fade-in">
              {/* Main Info Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm text-muted-foreground">{complaint.referenceNumber}</p>
                      <CardTitle className="mt-1">{complaint.title}</CardTitle>
                    </div>
                    {statusDisplay && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusDisplay.className}`}>
                        {statusDisplay.label}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-sm">{complaint.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                        {categoryName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="px-2 py-1 rounded-md bg-muted text-xs">
                        {unitName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Submitted: {format(new Date(complaint.createdAt), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-xs">
                        {complaint.isAnonymous ? 'Anonymous' : 'Not Anonymous'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Status Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="relative flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                      </div>
                      <div className="flex-1 -mt-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">Current Status: {complaint.status}</span>
                          <span className="text-xs text-muted-foreground">
                            Created: {format(new Date(complaint.createdAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        {complaint.updatedAt !== complaint.createdAt && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Last Updated: {format(new Date(complaint.updatedAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TrackComplaint;
