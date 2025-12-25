import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout';
import {
  Users,
  Building2,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Calendar,
  Zap,
} from 'lucide-react';
import { weeklyStats, mockAlerts, mockTrendSignals, mockCompanyEvents, mockLeads } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { chartData } from '@/data/mockData';

const COLORS = ['hsl(186, 100%, 50%)', 'hsl(270, 70%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)'];

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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sentiment Chart */}
          <Card variant="elevated" className="lg:col-span-2">
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
                        <stop offset="5%" stopColor="hsl(186, 100%, 50%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(186, 100%, 50%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                    <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(222, 47%, 10%)',
                        border: '1px solid hsl(222, 30%, 16%)',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="positive"
                      stroke="hsl(186, 100%, 50%)"
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

          {/* Lead Sources */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Lead Sources</CardTitle>
              <CardDescription>Distribution this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.leadsBySource}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.leadsBySource.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(222, 47%, 10%)',
                        border: '1px solid hsl(222, 30%, 16%)',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {chartData.leadsBySource.map((source, index) => (
                  <div key={source.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-muted-foreground">{source.name}</span>
                    <span className="text-sm font-medium ml-auto">{source.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Alerts */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Latest intelligence updates</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/analytics">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAlerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <div className={`h-2 w-2 rounded-full mt-2 ${
                      alert.severity === 'critical' ? 'bg-destructive' :
                      alert.severity === 'warning' ? 'bg-warning' : 'bg-primary'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{alert.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                    </div>
                    {!alert.read && <Badge variant="glow" className="text-xs">New</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Trending Topics</CardTitle>
                <CardDescription>This week's top trends</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/analytics">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTrendSignals.slice(0, 4).map((trend) => (
                  <div key={trend.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{trend.topic}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${trend.score}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{trend.score}%</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 ml-3 ${
                      trend.change > 0 ? 'text-success' : trend.change < 0 ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {trend.change > 0 ? <ArrowUpRight className="h-4 w-4" /> : trend.change < 0 ? <ArrowDownRight className="h-4 w-4" /> : null}
                      <span className="text-sm font-medium">{Math.abs(trend.change)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competitor Updates */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Competitor Updates</CardTitle>
                <CardDescription>Latest company events</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/companies">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCompanyEvents.slice(0, 4).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {event.eventType === 'pricing_change' ? <Zap className="h-4 w-4 text-warning" /> :
                       event.eventType === 'product_launch' ? <FileText className="h-4 w-4 text-primary" /> :
                       event.eventType === 'funding' ? <TrendingUp className="h-4 w-4 text-success" /> :
                       <Calendar className="h-4 w-4 text-accent" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{event.summary}</p>
                      <p className="text-xs text-muted-foreground mt-1">{event.publishedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card variant="glass" className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-semibold">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">Jump to common tasks</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button variant="glow" asChild>
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
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <Card variant="interactive" className="group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`h-12 w-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="h-6 w-6" />
          </div>
          {change !== 0 && (
            <div className={`flex items-center gap-1 text-sm ${change > 0 ? 'text-success' : 'text-destructive'}`}>
              {change > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
