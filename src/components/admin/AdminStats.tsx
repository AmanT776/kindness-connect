import { Card, CardContent } from '@/components/ui/card';
import {
    FileText, Clock, CheckCircle, AlertCircle, UserX
} from 'lucide-react';

interface AdminStatsProps {
    stats: {
        total: number;
        pending: number;
        received: number;
        underReview: number;
        resolved: number;
        closed: number;
        anonymous: number;
    };
}

export function AdminStats({ stats }: AdminStatsProps) {
    return (
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
                            <p className="text-xs text-muted-foreground">Received</p>
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
    );
}