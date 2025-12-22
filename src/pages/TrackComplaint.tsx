import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useComplaints } from '@/contexts/ComplaintsContext';
import { StatusBadge } from '@/components/complaint/StatusBadge';
import { CategoryBadge } from '@/components/complaint/CategoryBadge';
import { Search, Calendar, Paperclip, MessageSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Complaint, statusLabels } from '@/lib/mockData';

const TrackComplaint = () => {
  const location = useLocation();
  const { getComplaintByReference } = useComplaints();
  
  const [referenceNumber, setReferenceNumber] = useState('');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if we came from submission with a reference number
    if (location.state?.referenceNumber) {
      setReferenceNumber(location.state.referenceNumber);
      const found = getComplaintByReference(location.state.referenceNumber);
      if (found) {
        setComplaint(found);
        setSearched(true);
      }
    }
  }, [location.state, getComplaintByReference]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSearched(true);
    
    const found = getComplaintByReference(referenceNumber.trim());
    if (found) {
      setComplaint(found);
    } else {
      setComplaint(null);
      setError('No complaint found with this reference number. Please check and try again.');
    }
  };

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
                <Button type="submit" size="lg">
                  <Search className="mr-2 h-4 w-4" />
                  Track
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
                    <StatusBadge status={complaint.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-sm">{complaint.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={complaint.category} />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Submitted: {format(new Date(complaint.createdAt), 'MMM d, yyyy')}
                    </div>
                    {complaint.attachments.length > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Paperclip className="h-4 w-4" />
                        {complaint.attachments.length} attachment(s)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Status Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Status History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {complaint.statusHistory.map((history, index) => (
                      <div key={index} className="flex gap-4 pb-6 last:pb-0">
                        <div className="relative flex flex-col items-center">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                          {index < complaint.statusHistory.length - 1 && (
                            <div className="absolute top-3 h-full w-0.5 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 -mt-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{statusLabels[history.status]}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(history.date), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                          {history.comment && (
                            <p className="text-sm text-muted-foreground mt-1">{history.comment}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Officer Comments */}
              {complaint.officerComments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Officer Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {complaint.officerComments.map((comment, index) => (
                      <div key={index} className="rounded-lg bg-muted/50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{comment.officerName}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.date), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm">{comment.comment}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TrackComplaint;
