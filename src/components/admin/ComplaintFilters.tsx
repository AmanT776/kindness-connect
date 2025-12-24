import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface ComplaintFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    categoryFilter: number | 'all';
    setCategoryFilter: (value: number | 'all') => void;
    anonymousFilter: 'all' | 'anonymous' | 'identified';
    setAnonymousFilter: (value: 'all' | 'anonymous' | 'identified') => void;
    categories: Category[];
}

export function ComplaintFilters({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    anonymousFilter,
    setAnonymousFilter,
    categories
}: ComplaintFiltersProps) {
    return (
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

                    <Select
                        value={categoryFilter.toString()}
                        onValueChange={(val) => setCategoryFilter(val === 'all' ? 'all' : parseInt(val))}
                    >
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

                    <Select
                        value={anonymousFilter}
                        onValueChange={(val) => setAnonymousFilter(val as 'all' | 'anonymous' | 'identified')}
                    >
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
    );
}