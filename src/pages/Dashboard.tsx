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
} from 'lucide-react';
import { weeklyStats, mockAlerts, mockTrendSignals, mockCompanyEvents } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { chartData } from '@/data/mockData';
import type { Alert, TrendSignal, CompanyEvent } from '@/types';

// Column definitions
const alertColumns: Column<Alert>[] = [
  {
    key: 'title',
    header: 'Alert',
    sortable: true,
    searchable: true,
    render: (alert) => (
      <div>
        <div className="font-medium">{alert.title}</div>
        <div className="text-sm text-muted-foreground truncate max-w-[200px]">{alert.message}</div>
      </div>
    ),
    mobileRender: (alert) => (
      <div className="text-right">
        <div className="font-medium">{alert.title}</div>
        <div className="text-sm text-muted-foreground">{alert.message}</div>
      </div>
    ),
  },
  {
    key: 'severity',
    header: 'Severity',
    sortable: true,
    filterable: true,
    filterOptions: [
      { label: 'Critical', value: 'critical' },
      { label: 'Warning', value: 'warning' },
      { label: 'Info', value: 'info' },
    ],
    render: (alert) => (
      <Badge variant={
        alert.severity === 'critical' ? 'destructive' :
        alert.severity === 'warning' ? 'warning' : 'secondary'
      }>
        {alert.severity}
      </Badge>
    ),
  },
  {
    key: 'read',
    header: 'Status',
    sortable: true,
    mobileHidden: true,
    render: (alert) => (
      alert.read ? (
        <span className="text-muted-foreground text-sm">Read</span>
      ) : (
        <Badge variant="default">New</Badge>
      )
    ),
  },
];

const trendColumns: Column<TrendSignal>[] = [
  {
    key: 'topic',
    header: 'Topic',
    sortable: true,
    searchable: true,
    render: (trend) => (
      <div>
        <div className="font-medium">{trend.topic}</div>
        <div className="text-sm text-muted-foreground">{trend.timeframe}</div>
      </div>
    ),
    mobileRender: (trend) => (
      <div className="text-right">
        <div className="font-medium">{trend.topic}</div>
        <div className="text-sm text-muted-foreground">{trend.timeframe}</div>
      </div>
    ),
  },
  {
    key: 'score',
    header: 'Score',
    sortable: true,
    render: (trend) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground rounded-full"
            style={{ width: `${trend.score}%` }}
          />
        </div>
        <span className="text-sm font-medium">{trend.score}%</span>
      </div>
    ),
    mobileRender: (trend) => (
      <span className="text-sm font-medium">{trend.score}%</span>
    ),
  },
  {
    key: 'change',
    header: 'Change',
    sortable: true,
    render: (trend) => (
      <div className={`flex items-center gap-1 ${
        trend.change > 0 ? 'text-success' : trend.change < 0 ? 'text-destructive' : 'text-muted-foreground'
      }`}>
        {trend.change > 0 ? <ArrowUpRight className="h-4 w-4" /> : trend.change < 0 ? <ArrowDownRight className="h-4 w-4" /> : null}
        <span className="font-medium">{Math.abs(trend.change)}%</span>
      </div>
    ),
  },
];

const eventColumns: Column<CompanyEvent>[] = [
  {
    key: 'summary',
    header: 'Event',
    sortable: true,
    searchable: true,
    render: (event) => (
      <div className="font-medium max-w-[300px]">{event.summary}</div>
    ),
    mobileRender: (event) => (
      <div className="font-medium text-right">{event.summary}</div>
    ),
  },
  {
    key: 'eventType',
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
      <Badge variant="outline" className="capitalize">
        {event.eventType.replace('_', ' ')}
      </Badge>
    ),
  },
  {
    key: 'confidence',
    header: 'Confidence',
    sortable: true,
    mobileHidden: true,
    render: (event) => (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          event.confidence >= 90 ? 'bg-success' :
          event.confidence >= 70 ? 'bg-warning' : 'bg-destructive'
        }`} />
        <span>{event.confidence}%</span>
      </div>
    ),
  },
  {
    key: 'publishedAt',
    header: 'Date',
    sortable: true,
    mobileHidden: true,
    render: (event) => (
      <span className="text-muted-foreground">{event.publishedAt}</span>
    ),
  },
  {
    key: 'actions',
    header: '',
    hidden: false,
    render: () => (
      <Button variant="ghost" size="sm">
        <ExternalLink className="h-4 w-4" />
      </Button>
    ),
  },
];

export default function Dashboard() {
  return (
    <DashboardLayout title="Weekly Intelligence Summary" subtitle="December 19-25, 2025">
      <div className="space-y-6 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="New Leads"
            value={weeklyStats.newLeads}
            change={12}
            icon={Users}
            color="primary"
          />
          <StatCard
            title="Competitor Changes"
            value={weeklyStats.competitorChanges}
            change={-3}
            icon={Building2}
            color="accent"
          />
          <StatCard
            title="Trend Spikes"
            value={weeklyStats.trendSpikes}
            change={8}
            icon={TrendingUp}
            color="success"
          />
          <StatCard
            title="Sentiment Alerts"
            value={weeklyStats.sentimentAlerts}
            change={0}
            icon={AlertTriangle}
            color="warning"
          />
        </div>

        {/* Sentiment Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Sentiment Trend</CardTitle>
            <CardDescription>Positive vs Negative sentiment across all tracked topics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.sentimentTrend}>
                  <defs>
                    <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 0%, 9%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(0, 0%, 9%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                  <XAxis dataKey="date" stroke="hsl(0, 0%, 45%)" fontSize={12} />
                  <YAxis stroke="hsl(0, 0%, 45%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(0, 0%, 90%)',
                      borderRadius: '6px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="positive"
                    stroke="hsl(0, 0%, 9%)"
                    fillOpacity={1}
                    fill="url(#colorPositive)"
                  />
                  <Area
                    type="monotone"
                    dataKey="negative"
                    stroke="hsl(0, 72%, 51%)"
                    fillOpacity={1}
                    fill="url(#colorNegative)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Alerts Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Latest intelligence updates</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/analytics">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable 
                data={mockAlerts} 
                columns={alertColumns} 
                pageSize={5}
                showSearch
                searchPlaceholder="Search alerts..."
              />
            </CardContent>
          </Card>

          {/* Trending Topics Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Trending Topics</CardTitle>
                <CardDescription>This week's top trends</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/analytics">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable 
                data={mockTrendSignals} 
                columns={trendColumns} 
                pageSize={5}
                showSearch
                searchPlaceholder="Search topics..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Competitor Events Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Competitor Updates</CardTitle>
              <CardDescription>Latest company events</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/companies">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={mockCompanyEvents} 
              columns={eventColumns} 
              pageSize={5}
              showSearch
              searchPlaceholder="Search events..."
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-semibold">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">Jump to common tasks</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button asChild>
                  <Link to="/people">
                    <Users className="h-4 w-4 mr-2" />
                    Browse Leads
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/companies">
                    <Building2 className="h-4 w-4 mr-2" />
                    Track Competitors
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/reports">
                    <FileText className="h-4 w-4 mr-2" />
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
  change: number;
  icon: React.ElementType;
  color: 'primary' | 'accent' | 'success' | 'warning';
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-foreground/5 text-foreground',
    accent: 'bg-foreground/5 text-foreground',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`h-10 w-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="h-5 w-5" />
          </div>
          {change !== 0 && (
            <div className={`flex items-center gap-1 text-sm ${change > 0 ? 'text-success' : 'text-destructive'}`}>
              {change > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
