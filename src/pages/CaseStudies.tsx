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
      <div className="space-y-3 animate-fade-in">
        <Tabs defaultValue="all" className="space-y-3">
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs h-7">All Studies</TabsTrigger>
            <TabsTrigger value="competitor" className="text-xs h-7">Competitor</TabsTrigger>
            <TabsTrigger value="trend" className="text-xs h-7">Trends</TabsTrigger>
            <TabsTrigger value="campaign" className="text-xs h-7">Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            <Card className="overflow-hidden border-primary/20">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-4 flex flex-col justify-center">
                  <Badge className="w-fit mb-2 text-[10px]">Featured Study</Badge>
                  <h2 className="text-base font-bold mb-2">How AI-Native Competitors are Disrupting Traditional SaaS</h2>
                  <p className="text-xs text-muted-foreground mb-3">A comprehensive analysis of how emerging AI-first companies are capturing market share.</p>
                  <Button size="sm" className="w-fit h-8 text-xs">Read Full Study <ArrowRight className="h-3 w-3 ml-1" /></Button>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 flex items-center justify-center">
                  <Target className="h-16 w-16 text-primary/50" />
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {mockCaseStudies.map((study) => (
                <Card key={study.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <Badge variant="outline" className="mb-2 text-[10px] px-1.5 py-0">{study.type}</Badge>
                    <h3 className="font-medium text-sm mb-1">{study.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{study.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{study.createdAt}</span>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">Read More</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {['competitor', 'trend', 'campaign'].map((type) => (
            <TabsContent key={type} value={type}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {mockCaseStudies.filter((s) => s.type === type).map((study) => (
                  <Card key={study.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <Badge variant="outline" className="mb-2 text-[10px] px-1.5 py-0">{study.type}</Badge>
                      <h3 className="font-medium text-sm mb-1">{study.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{study.content}</p>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">Read More</Button>
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
