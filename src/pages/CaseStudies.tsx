import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, TrendingUp, Zap, Target, ArrowRight, Calendar, Tag } from 'lucide-react';
import { mockCaseStudies } from '@/data/mockData';

const caseStudyTypes = {
  competitor: { icon: Target, color: 'primary', label: 'Competitor Analysis' },
  trend: { icon: TrendingUp, color: 'success', label: 'Trend Analysis' },
  campaign: { icon: Zap, color: 'accent', label: 'Campaign Breakdown' },
  sentiment: { icon: BookOpen, color: 'warning', label: 'Sentiment Analysis' },
};

export default function CaseStudies() {
  return (
    <DashboardLayout title="Case Studies & Playbooks" subtitle="Strategic insights and actionable playbooks">
      <div className="space-y-6 animate-fade-in">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-secondary p-1">
            <TabsTrigger value="all">All Studies</TabsTrigger>
            <TabsTrigger value="competitor">Competitor</TabsTrigger>
            <TabsTrigger value="trend">Trends</TabsTrigger>
            <TabsTrigger value="campaign">Campaigns</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Featured Case Study */}
            <Card variant="glow" className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 flex flex-col justify-center">
                  <Badge variant="glow" className="w-fit mb-4">Featured Study</Badge>
                  <h2 className="text-2xl font-bold mb-3">
                    How AI-Native Competitors are Disrupting Traditional SaaS
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    A comprehensive analysis of how emerging AI-first companies are capturing market share 
                    from established players through product innovation and pricing strategies.
                  </p>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      December 2025
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Tag className="h-4 w-4" />
                      SaaS, AI, Competition
                    </div>
                  </div>
                  <Button variant="glow" className="w-fit">
                    Read Full Study
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-8 flex items-center justify-center">
                  <div className="h-48 w-48 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                    <Target className="h-24 w-24 text-primary" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Case Study Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCaseStudies.map((study) => (
                <CaseStudyCard key={study.id} study={study} />
              ))}
            </div>
          </TabsContent>

          {['competitor', 'trend', 'campaign', 'sentiment'].map((type) => (
            <TabsContent key={type} value={type} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockCaseStudies
                  .filter((s) => s.type === type)
                  .map((study) => (
                    <CaseStudyCard key={study.id} study={study} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Playbooks Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Strategic Playbooks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="interactive">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-7 w-7 text-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Market Entry Playbook</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Step-by-step guide to entering new market segments based on trend analysis and 
                      competitor positioning.
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">12 Steps</Badge>
                      <Badge variant="ghost">45 min read</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="interactive">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-7 w-7 text-warning" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Pricing Response Playbook</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      How to respond when competitors change their pricing strategy. Includes 
                      decision frameworks and templates.
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">8 Steps</Badge>
                      <Badge variant="ghost">30 min read</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function CaseStudyCard({ study }: { study: typeof mockCaseStudies[0] }) {
  const config = caseStudyTypes[study.type];
  const Icon = config.icon;

  return (
    <Card variant="interactive" className="group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`h-12 w-12 rounded-xl bg-${config.color}/10 flex items-center justify-center`}>
            <Icon className={`h-6 w-6 text-${config.color}`} />
          </div>
          <Badge variant="ghost">{config.label}</Badge>
        </div>
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
          {study.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{study.content}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {study.createdAt}
          </div>
          <Button variant="ghost" size="sm">
            Read More
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
