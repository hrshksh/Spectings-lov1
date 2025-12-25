import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, TrendingUp, Zap, Target, ArrowRight, Calendar } from 'lucide-react';
import { mockCaseStudies } from '@/data/mockData';

export default function CaseStudies() {
  return (
    <DashboardLayout title="Case Studies & Playbooks" subtitle="Strategic insights and actionable playbooks">
      <div className="space-y-6 animate-fade-in">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Studies</TabsTrigger>
            <TabsTrigger value="competitor">Competitor</TabsTrigger>
            <TabsTrigger value="trend">Trends</TabsTrigger>
            <TabsTrigger value="campaign">Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <Card className="overflow-hidden border-primary/20">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-4">Featured Study</Badge>
                  <h2 className="text-2xl font-bold mb-3">How AI-Native Competitors are Disrupting Traditional SaaS</h2>
                  <p className="text-muted-foreground mb-6">A comprehensive analysis of how emerging AI-first companies are capturing market share.</p>
                  <Button className="w-fit">Read Full Study <ArrowRight className="h-4 w-4 ml-2" /></Button>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 flex items-center justify-center">
                  <Target className="h-24 w-24 text-primary/50" />
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCaseStudies.map((study) => (
                <Card key={study.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Badge variant="outline" className="mb-4">{study.type}</Badge>
                    <h3 className="font-semibold text-lg mb-2">{study.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{study.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{study.createdAt}</span>
                      <Button variant="ghost" size="sm">Read More</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {['competitor', 'trend', 'campaign'].map((type) => (
            <TabsContent key={type} value={type}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockCaseStudies.filter((s) => s.type === type).map((study) => (
                  <Card key={study.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <Badge variant="outline" className="mb-4">{study.type}</Badge>
                      <h3 className="font-semibold text-lg mb-2">{study.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{study.content}</p>
                      <Button variant="ghost" size="sm">Read More</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
