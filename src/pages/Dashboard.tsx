import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout';
import { DataTable, Column } from '@/components/ui/data-table';
import {
  Users,
  Building2,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { chartData } from '@/data/mockData';
import { useRealtimeStats } from '@/hooks/useRealtimeData';
import type { Tables } from '@/integrations/supabase/types';

type CompanyEvent = Tables<'company_events'>;

// Column definitions for company events
const eventColumns: Column<CompanyEvent>[] = [
  {
    key: 'summary',
    header: 'Event',
    sortable: true,
    searchable: true,
    render: (event) => (
      <div className="font-medium text-sm max-w-[300px]">{event.summary || 'No summary'}</div>
    ),
    mobileRender: (event) => (
      <div className="font-medium text-sm text-right">{event.summary || 'No summary'}</div>
    ),
  },
  {
    key: 'event_type',
    header: 'Type',
    sortable: true,
    filterable: true,
    filterOptions: [
      { label: 'Pricing', value: 'pricing_change' },
      { label: 'Product', value: 'product_launch' },
      { label: 'Hiring', value: 'hiring' },
      { label: 'Funding', value: 'funding' },
    ],
    render: (event) => (
      <Badge variant="outline" className="capitalize text-xs">
        {event.event_type.replace('_', ' ')}
      </Badge>
    ),
  },
  {
    key: 'confidence',
    header: 'Confidence',
    sortable: true,
    mobileHidden: true,
    render: (event) => (
      <div className="flex items-center gap-1.5 text-xs">
        <div className={`w-1.5 h-1.5 rounded-full ${
          (event.confidence || 0) >= 90 ? 'bg-success' :
          (event.confidence || 0) >= 70 ? 'bg-warning' : 'bg-destructive'
        }`} />
        <span>{event.confidence || 0}%</span>
      </div>
    ),
  },
  {
    key: 'published_at',
    header: 'Date',
    sortable: true,
    mobileHidden: true,
    render: (event) => (
      <span className="text-muted-foreground text-xs">
        {event.published_at ? new Date(event.published_at).toLocaleDateString() : 'N/A'}
      </span>
    ),
  },
  {
    key: 'actions',
    header: '',
    hidden: false,
    render: () => (
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
        <ExternalLink className="h-3.5 w-3.5" />
      </Button>
    ),
  },
];

export default function Dashboard() {
  const { stats, companyEvents, loading } = useRealtimeStats();

  if (loading) {
    return (
      <DashboardLayout title="Weekly Intelligence Summary" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Weekly Intelligence Summary" subtitle="Live Data">
      <div className="space-y-3 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <StatCard
            title="New Leads"
            value={stats.newLeads}
            subtitle={`${stats.verifiedLeads} verified`}
            icon={Users}
            color="primary"
          />
          <StatCard
            title="Tracked Companies"
            value={stats.trackedCompanies}
            subtitle={`${stats.totalCompanies} total`}
            icon={Building2}
            color="accent"
          />
          <StatCard
            title="Company Events"
            value={stats.recentEvents}
            subtitle="This period"
            icon={TrendingUp}
            color="success"
          />
          <StatCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            subtitle={`${stats.inProgressTasks} in progress`}
            icon={AlertTriangle}
            color="warning"
          />
        </div>

        {/* Sentiment Chart */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm font-medium">Weekly Sentiment Trend</CardTitle>
            <CardDescription className="text-xs">Positive vs Negative sentiment across all tracked topics</CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.sentimentTrend}>
                  <defs>
                    <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '4px',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="positive"
                    stroke="hsl(var(--foreground))"
                    fillOpacity={1}
                    fill="url(#colorPositive)"
                  />
                  <Area
                    type="monotone"
                    dataKey="negative"
                    stroke="hsl(var(--destructive))"
                    fillOpacity={1}
                    fill="url(#colorNegative)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Live Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* People Stats */}
          <Card>
            <CardHeader className="py-2 px-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">People Intelligence</CardTitle>
                <CardDescription className="text-xs">Real-time contact database</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                <Link to="/people">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{stats.totalPeople}</p>
                  <p className="text-xs text-muted-foreground">Total Contacts</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{stats.verifiedLeads}</p>
                  <p className="text-xs text-muted-foreground">Verified Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Stats */}
          <Card>
            <CardHeader className="py-2 px-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">Evidence Pipeline</CardTitle>
                <CardDescription className="text-xs">Real-time evidence tracking</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {stats.pendingEvidence} pending
              </Badge>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{stats.pendingEvidence}</p>
                  <p className="text-xs text-muted-foreground">Pending Review</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{stats.publishedEvidence}</p>
                  <p className="text-xs text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competitor Events Table */}
        <Card>
          <CardHeader className="py-2 px-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">Competitor Updates</CardTitle>
              <CardDescription className="text-xs">Real-time company events</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
              <Link to="/companies">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-2">
            {companyEvents.length > 0 ? (
              <DataTable 
                data={companyEvents} 
                columns={eventColumns} 
                pageSize={5}
                showSearch
                searchPlaceholder="Search events..."
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No company events yet. Events will appear here in real-time.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-semibold">Quick Actions</h3>
                <p className="text-xs text-muted-foreground">Jump to common tasks</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" className="h-8" asChild>
                  <Link to="/people">
                    <Users className="h-3.5 w-3.5 mr-1.5" />
                    Browse Leads
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="h-8" asChild>
                  <Link to="/companies">
                    <Building2 className="h-3.5 w-3.5 mr-1.5" />
                    Track Competitors
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="h-8" asChild>
                  <Link to="/reports">
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    Download Report
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  color: 'primary' | 'accent' | 'success' | 'warning';
}

function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-foreground/5 text-foreground',
    accent: 'bg-foreground/5 text-foreground',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className={`h-8 w-8 rounded-md ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="h-4 w-4" />
          </div>
          <Badge variant="outline" className="text-xs">Live</Badge>
        </div>
        <div className="mt-2">
          <p className="text-xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-xs text-muted-foreground/70">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}
