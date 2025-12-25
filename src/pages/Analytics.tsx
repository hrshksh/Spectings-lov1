import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, ArrowDownRight, Target, Zap, Activity } from 'lucide-react';
import { mockTrendSignals, mockSentimentSignals, chartData } from '@/data/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

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
          <TabsList>
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="signals">Market Signals</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
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
                            <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                        <XAxis dataKey="week" stroke="hsl(220, 9%, 46%)" fontSize={12} />
                        <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(220, 13%, 91%)', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="score" stroke="hsl(221, 83%, 53%)" strokeWidth={2} fillOpacity={1} fill="url(#trendGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Radar</CardTitle>
                  <CardDescription>Key metrics overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(220, 13%, 91%)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 10 }} />
                        <Radar name="Score" dataKey="A" stroke="hsl(221, 83%, 53%)" fill="hsl(221, 83%, 53%)" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockTrendSignals.map((trend) => (
                    <div key={trend.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${trend.change > 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                        {trend.change > 0 ? <TrendingUp className="h-5 w-5 text-success" /> : <TrendingDown className="h-5 w-5 text-destructive" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{trend.topic}</h4>
                        <p className="text-sm text-muted-foreground">{trend.description}</p>
                      </div>
                      <div className={`text-sm font-medium ${trend.change > 0 ? 'text-success' : 'text-destructive'}`}>
                        {trend.change > 0 ? '+' : ''}{trend.change}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.sentimentTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                        <XAxis dataKey="date" stroke="hsl(220, 9%, 46%)" fontSize={12} />
                        <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} />
                        <Bar dataKey="positive" stackId="a" fill="hsl(142, 71%, 45%)" />
                        <Bar dataKey="neutral" stackId="a" fill="hsl(220, 9%, 70%)" />
                        <Bar dataKey="negative" stackId="a" fill="hsl(0, 84%, 60%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Sentiment Signals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockSentimentSignals.map((signal) => (
                    <div key={signal.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${signal.sentimentScore > 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                        <span className={`font-bold ${signal.sentimentScore > 0 ? 'text-success' : 'text-destructive'}`}>
                          {signal.sentimentScore > 0 ? '+' : ''}{signal.sentimentScore}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{signal.topic}</h4>
                        <p className="text-sm text-muted-foreground">Source: {signal.source}</p>
                      </div>
                      <Badge variant={signal.sentimentScore > 0 ? 'success' : 'destructive'}>
                        {signal.sentimentScore > 30 ? 'Positive' : signal.sentimentScore < -30 ? 'Negative' : 'Neutral'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="signals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="h-14 w-14 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Target className="h-7 w-7 text-success" />
                  </div>
                  <h3 className="text-2xl font-bold">23</h3>
                  <p className="text-sm text-muted-foreground">Opportunity Signals</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="h-14 w-14 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-7 w-7 text-warning" />
                  </div>
                  <h3 className="text-2xl font-bold">7</h3>
                  <p className="text-sm text-muted-foreground">Risk Signals</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">12</h3>
                  <p className="text-sm text-muted-foreground">Action Items</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <h4 className="font-medium">Negative Sentiment Alerts</h4>
                      <p className="text-sm text-muted-foreground">Alert when sentiment drops below -30</p>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <Button variant="outline" className="w-full">+ Add New Alert Rule</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
