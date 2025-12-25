import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Building2,
  Globe,
  Users,
  Calendar,
  TrendingUp,
  Zap,
  FileText,
  ExternalLink,
  ChevronRight,
  DollarSign,
  Briefcase,
} from 'lucide-react';
import { mockCompanies, mockCompanyEvents } from '@/data/mockData';
import { Company, CompanyEvent } from '@/types';

const eventTypeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pricing_change: { icon: DollarSign, color: 'warning', label: 'Pricing' },
  product_launch: { icon: Zap, color: 'primary', label: 'Product' },
  hiring: { icon: Briefcase, color: 'accent', label: 'Hiring' },
  funding: { icon: TrendingUp, color: 'success', label: 'Funding' },
  campaign: { icon: FileText, color: 'primary', label: 'Campaign' },
  news: { icon: FileText, color: 'secondary', label: 'News' },
  review: { icon: FileText, color: 'warning', label: 'Review' },
  acquisition: { icon: Building2, color: 'accent', label: 'Acquisition' },
};

export default function CompanyIntelligence() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(mockCompanies[0]);

  const companyEvents = mockCompanyEvents.filter(
    (event) => event.companyId === selectedCompany?.id
  );

  return (
    <DashboardLayout title="Company Intelligence" subtitle="Competitor tracking and market analysis">
      <div className="space-y-6 animate-fade-in">
        {/* Company Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockCompanies.map((company) => (
            <Card
              key={company.id}
              variant={selectedCompany?.id === company.id ? 'glow' : 'interactive'}
              onClick={() => setSelectedCompany(company)}
              className="cursor-pointer"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{company.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {company.domain}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{company.industry}</Badge>
                      <Badge variant="ghost">{company.size} employees</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Company Detail */}
        {selectedCompany && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company Profile */}
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{selectedCompany.name}</CardTitle>
                    <a
                      href={`https://${selectedCompany.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {selectedCompany.domain}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">{selectedCompany.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Industry</p>
                    <p className="font-semibold mt-1">{selectedCompany.industry}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Size</p>
                    <p className="font-semibold mt-1">{selectedCompany.size}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Founded</p>
                    <p className="font-semibold mt-1">{selectedCompany.founded || 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Events</p>
                    <p className="font-semibold mt-1">{companyEvents.length}</p>
                  </div>
                </div>

                {selectedCompany.competitors && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Known Competitors
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCompany.competitors.map((comp) => (
                        <Badge key={comp} variant="outline">{comp}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button variant="glow" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Company Report
                </Button>
              </CardContent>
            </Card>

            {/* Events Timeline */}
            <Card variant="elevated" className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Events Timeline</CardTitle>
                <CardDescription>Track all competitive intelligence signals</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Events</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="product">Product</TabsTrigger>
                    <TabsTrigger value="hiring">Hiring</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="space-y-4">
                    {companyEvents.length > 0 ? (
                      companyEvents.map((event, index) => (
                        <EventCard key={event.id} event={event} isLast={index === companyEvents.length - 1} />
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No events tracked for this company yet.</p>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="pricing">
                    {companyEvents.filter(e => e.eventType === 'pricing_change').map((event, index, arr) => (
                      <EventCard key={event.id} event={event} isLast={index === arr.length - 1} />
                    ))}
                  </TabsContent>
                  <TabsContent value="product">
                    {companyEvents.filter(e => e.eventType === 'product_launch').map((event, index, arr) => (
                      <EventCard key={event.id} event={event} isLast={index === arr.length - 1} />
                    ))}
                  </TabsContent>
                  <TabsContent value="hiring">
                    {companyEvents.filter(e => e.eventType === 'hiring').map((event, index, arr) => (
                      <EventCard key={event.id} event={event} isLast={index === arr.length - 1} />
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function EventCard({ event, isLast }: { event: CompanyEvent; isLast: boolean }) {
  const config = eventTypeConfig[event.eventType] || eventTypeConfig.news;
  const Icon = config.icon;

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
      )}
      
      {/* Icon */}
      <div className={`h-10 w-10 rounded-full bg-${config.color}/10 flex items-center justify-center flex-shrink-0 z-10`}>
        <Icon className={`h-5 w-5 text-${config.color}`} />
      </div>
      
      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="ghost" className="mb-2">{config.label}</Badge>
            <p className="font-medium">{event.summary}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{event.publishedAt}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="h-2 w-12 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${event.confidence}%` }} />
              </div>
              <span className="text-xs text-muted-foreground">{event.confidence}%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="outline" className="text-xs">
            {event.evidenceIds.length} evidence items
          </Badge>
          <Button variant="ghost" size="sm">
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
