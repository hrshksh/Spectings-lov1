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

const eventColumns: Column<CompanyEvent>[] = [
  {
    key: 'summary',
    header: 'Event',
    sortable: true,
    searchable: true,
    render: (event) => (
      <div className="font-medium text-sm max-w-[300px] truncate">{event.summary || 'No summary'}</div>
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
      <DashboardLayout title="Dashboard" subtitle="Weekly Intelligence Summary">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" subtitle="Weekly Intelligence Summary">
      <div className="space-y-5 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="New Leads" value={stats.newLeads} subtitle={`${stats.verifiedLeads} verified`} icon={Users} />
          <StatCard title="Tracked Companies" value={stats.trackedCompanies} subtitle={`${stats.totalCompanies} total`} icon={Building2} />
          <StatCard title="Company Events" value={stats.recentEvents} subtitle="This period" icon={TrendingUp} />
          <StatCard title="Pending Tasks" value={stats.pendingTasks} subtitle={`${stats.inProgressTasks} in progress`} icon={AlertTriangle} />
        </div>

        {/* Chart */}
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-semibold">Weekly Sentiment Trend</CardTitle>
            <CardDescription className="text-xs">Positive vs Negative sentiment across all tracked topics</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.sentimentTrend}>
                  <defs>
                    <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area type="monotone" dataKey="positive" stroke="hsl(var(--foreground))" fillOpacity={1} fill="url(#colorPositive)" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="negative" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorNegative)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Two column summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="px-4 pt-4 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">People Intelligence</CardTitle>
                <CardDescription className="text-xs">Real-time contact database</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                <Link to="/people">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-muted/40 rounded-lg">
                  <p className="text-2xl font-bold tracking-tight">{stats.totalPeople}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Total Contacts</p>
                </div>
                <div className="p-4 bg-muted/40 rounded-lg">
                  <p className="text-2xl font-bold tracking-tight">{stats.verifiedLeads}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Verified Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-4 pt-4 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Evidence Pipeline</CardTitle>
                <CardDescription className="text-xs">Real-time evidence tracking</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">{stats.pendingEvidence} pending</Badge>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-muted/40 rounded-lg">
                  <p className="text-2xl font-bold tracking-tight">{stats.pendingEvidence}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Pending Review</p>
                </div>
                <div className="p-4 bg-muted/40 rounded-lg">
                  <p className="text-2xl font-bold tracking-tight">{stats.publishedEvidence}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Table */}
        <Card>
          <CardHeader className="px-4 pt-4 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Competitor Updates</CardTitle>
              <CardDescription className="text-xs">Real-time company events</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
              <Link to="/companies">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {companyEvents.length > 0 ? (
              <DataTable 
                data={companyEvents} 
                columns={eventColumns} 
                pageSize={5}
                showSearch
                searchPlaceholder="Search events..."
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No company events yet. Events will appear here in real-time.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-semibold">Quick Actions</h3>
                <p className="text-xs text-muted-foreground">Jump to common tasks</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-8 text-xs" asChild>
                  <Link to="/people">
                    <Users className="h-3.5 w-3.5 mr-1.5" />Browse Leads
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                  <Link to="/companies">
                    <Building2 className="h-3.5 w-3.5 mr-1.5" />Track Competitors
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                  <Link to="/reports">
                    <FileText className="h-3.5 w-3.5 mr-1.5" />Reports
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
}

function StatCard({ title, value, subtitle, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <Badge variant="outline" className="text-[10px]">Live</Badge>
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
        <p className="text-[10px] text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
