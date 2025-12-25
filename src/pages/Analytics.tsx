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
      <div className="space-y-3 animate-fade-in">
        <Tabs defaultValue="trends" className="space-y-3">
          <TabsList className="h-8">
            <TabsTrigger value="trends" className="text-xs h-7">Trend Analysis</TabsTrigger>
            <TabsTrigger value="sentiment" className="text-xs h-7">Sentiment</TabsTrigger>
            <TabsTrigger value="signals" className="text-xs h-7">Market Signals</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs h-7">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <Card className="lg:col-span-2">
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-sm font-medium">Weekly Trend Score</CardTitle>
                  <CardDescription className="text-xs">Overall market trend momentum</CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyTrends}>
                        <defs>
                          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                        <XAxis dataKey="week" stroke="hsl(220, 9%, 46%)" fontSize={10} />
                        <YAxis stroke="hsl(220, 9%, 46%)" fontSize={10} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(220, 13%, 91%)', borderRadius: '4px', fontSize: '11px' }} />
                        <Area type="monotone" dataKey="score" stroke="hsl(221, 83%, 53%)" strokeWidth={2} fillOpacity={1} fill="url(#trendGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-sm font-medium">Market Radar</CardTitle>
                  <CardDescription className="text-xs">Key metrics overview</CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(220, 13%, 91%)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 8 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 8 }} />
                        <Radar name="Score" dataKey="A" stroke="hsl(221, 83%, 53%)" fill="hsl(221, 83%, 53%)" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm font-medium">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {mockTrendSignals.map((trend) => (
                    <div key={trend.id} className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                      <div className={`h-8 w-8 rounded-md flex items-center justify-center ${trend.change > 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                        {trend.change > 0 ? <TrendingUp className="h-4 w-4 text-success" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium">{trend.topic}</h4>
                        <p className="text-[10px] text-muted-foreground truncate">{trend.description}</p>
                      </div>
                      <div className={`text-xs font-medium ${trend.change > 0 ? 'text-success' : 'text-destructive'}`}>
                        {trend.change > 0 ? '+' : ''}{trend.change}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <Card>
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-sm font-medium">Sentiment Over Time</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.sentimentTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                        <XAxis dataKey="date" stroke="hsl(220, 9%, 46%)" fontSize={10} />
                        <YAxis stroke="hsl(220, 9%, 46%)" fontSize={10} />
                        <Bar dataKey="positive" stackId="a" fill="hsl(142, 71%, 45%)" />
                        <Bar dataKey="neutral" stackId="a" fill="hsl(220, 9%, 70%)" />
                        <Bar dataKey="negative" stackId="a" fill="hsl(0, 84%, 60%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-sm font-medium">Recent Sentiment Signals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 px-3 pb-3 pt-0">
                  {mockSentimentSignals.map((signal) => (
                    <div key={signal.id} className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                      <div className={`h-8 w-8 rounded-md flex items-center justify-center ${signal.sentimentScore > 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                        <span className={`text-xs font-bold ${signal.sentimentScore > 0 ? 'text-success' : 'text-destructive'}`}>
                          {signal.sentimentScore > 0 ? '+' : ''}{signal.sentimentScore}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium">{signal.topic}</h4>
                        <p className="text-[10px] text-muted-foreground">Source: {signal.source}</p>
                      </div>
                      <Badge variant={signal.sentimentScore > 0 ? 'success' : 'destructive'} className="text-[10px]">
                        {signal.sentimentScore > 30 ? 'Positive' : signal.sentimentScore < -30 ? 'Negative' : 'Neutral'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="signals" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="h-10 w-10 rounded-md bg-success/10 flex items-center justify-center mx-auto mb-2">
                    <Target className="h-5 w-5 text-success" />
                  </div>
                  <h3 className="text-xl font-bold">23</h3>
                  <p className="text-xs text-muted-foreground">Opportunity Signals</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="h-10 w-10 rounded-md bg-warning/10 flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  </div>
                  <h3 className="text-xl font-bold">7</h3>
                  <p className="text-xs text-muted-foreground">Risk Signals</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">12</h3>
                  <p className="text-xs text-muted-foreground">Action Items</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-3">
            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm font-medium">Alert Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-3 pb-3 pt-0">
                <div className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-warning/10 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium">Negative Sentiment Alerts</h4>
                      <p className="text-[10px] text-muted-foreground">Alert when sentiment drops below -30</p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px]">Active</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full h-8 text-xs">+ Add New Alert Rule</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
