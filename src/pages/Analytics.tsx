import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Activity,
} from 'lucide-react';
import { mockTrendSignals, mockSentimentSignals, chartData } from '@/data/mockData';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from 'recharts';

const radarData = [
  { subject: 'AI Adoption', A: 85, fullMark: 100 },
  { subject: 'Pricing Trends', A: 72, fullMark: 100 },
  { subject: 'Product Innovation', A: 65, fullMark: 100 },
  { subject: 'Market Growth', A: 78, fullMark: 100 },
  { subject: 'Competition', A: 90, fullMark: 100 },
  { subject: 'Customer Sentiment', A: 68, fullMark: 100 },
];

const weeklyTrends = [
  { week: 'W1', score: 62 },
  { week: 'W2', score: 68 },
  { week: 'W3', score: 71 },
  { week: 'W4', score: 75 },
  { week: 'W5', score: 82 },
];

export default function Analytics() {
  return (
    <DashboardLayout title="Analytics" subtitle="Market trends, sentiment, and behavioral signals">
      <div className="space-y-6 animate-fade-in">
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="bg-secondary p-1">
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="signals">Market Signals</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trend Score Chart */}
              <Card variant="elevated" className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Weekly Trend Score</CardTitle>
                  <CardDescription>Overall market trend momentum</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyTrends}>
                        <defs>
                          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(186, 100%, 50%)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="hsl(186, 100%, 50%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                        <XAxis dataKey="week" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                        <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(222, 47%, 10%)',
                            border: '1px solid hsl(222, 30%, 16%)',
                            borderRadius: '8px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="hsl(186, 100%, 50%)"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#trendGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Market Radar */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Market Radar</CardTitle>
                  <CardDescription>Key metrics overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(222, 30%, 16%)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }} />
                        <Radar
                          name="Score"
                          dataKey="A"
                          stroke="hsl(186, 100%, 50%)"
                          fill="hsl(186, 100%, 50%)"
                          fillOpacity={0.3}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(222, 47%, 10%)',
                            border: '1px solid hsl(222, 30%, 16%)',
                            borderRadius: '8px',
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trend Topics */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
                <CardDescription>Key market trends and their momentum</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockTrendSignals.map((trend) => (
                    <div
                      key={trend.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        trend.change > 0 ? 'bg-success/10' : trend.change < 0 ? 'bg-destructive/10' : 'bg-muted'
                      }`}>
                        {trend.change > 0 ? (
                          <TrendingUp className="h-6 w-6 text-success" />
                        ) : trend.change < 0 ? (
                          <TrendingDown className="h-6 w-6 text-destructive" />
                        ) : (
                          <Activity className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{trend.topic}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">{trend.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${trend.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{trend.score}</span>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 text-sm ${
                          trend.change > 0 ? 'text-success' : trend.change < 0 ? 'text-destructive' : 'text-muted-foreground'
                        }`}>
                          {trend.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : trend.change < 0 ? <ArrowDownRight className="h-3 w-3" /> : null}
                          {trend.change !== 0 && <span>{Math.abs(trend.change)}%</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sentiment Tab */}
          <TabsContent value="sentiment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Over Time */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Sentiment Over Time</CardTitle>
                  <CardDescription>Weekly sentiment breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.sentimentTrend}>
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
                        <Bar dataKey="positive" stackId="a" fill="hsl(142, 76%, 36%)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="neutral" stackId="a" fill="hsl(215, 20%, 55%)" />
                        <Bar dataKey="negative" stackId="a" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment Signals */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Recent Sentiment Signals</CardTitle>
                  <CardDescription>Latest sentiment analysis results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockSentimentSignals.map((signal) => (
                    <div
                      key={signal.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50"
                    >
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        signal.sentimentScore > 0 ? 'bg-success/10' : signal.sentimentScore < 0 ? 'bg-destructive/10' : 'bg-muted'
                      }`}>
                        <span className={`text-lg font-bold ${
                          signal.sentimentScore > 0 ? 'text-success' : signal.sentimentScore < 0 ? 'text-destructive' : 'text-muted-foreground'
                        }`}>
                          {signal.sentimentScore > 0 ? '+' : ''}{signal.sentimentScore}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{signal.topic}</h4>
                        <p className="text-sm text-muted-foreground">Source: {signal.source}</p>
                      </div>
                      <Badge variant={signal.sentimentScore > 0 ? 'success' : signal.sentimentScore < 0 ? 'destructive' : 'secondary'}>
                        {signal.sentimentScore > 30 ? 'Positive' : signal.sentimentScore < -30 ? 'Negative' : 'Neutral'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="glow">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="text-2xl font-bold">23</h3>
                  <p className="text-sm text-muted-foreground">Opportunity Signals</p>
                  <p className="text-xs text-success mt-2">+5 this week</p>
                </CardContent>
              </Card>
              <Card variant="elevated">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-warning" />
                  </div>
                  <h3 className="text-2xl font-bold">7</h3>
                  <p className="text-sm text-muted-foreground">Risk Signals</p>
                  <p className="text-xs text-warning mt-2">+2 this week</p>
                </CardContent>
              </Card>
              <Card variant="elevated">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">12</h3>
                  <p className="text-sm text-muted-foreground">Action Items</p>
                  <p className="text-xs text-primary mt-2">3 high priority</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Alert Configuration</CardTitle>
                <CardDescription>Manage your intelligence alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Negative Sentiment Alerts</h4>
                      <p className="text-sm text-muted-foreground">Alert when sentiment drops below -30</p>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Trend Spike Alerts</h4>
                      <p className="text-sm text-muted-foreground">Alert when trend score increases by 10+</p>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Competitor Event Alerts</h4>
                      <p className="text-sm text-muted-foreground">Alert on pricing, product, or funding events</p>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  + Add New Alert Rule
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
