import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Globe, Calendar, TrendingUp, Zap, FileText, ExternalLink, ChevronRight, DollarSign, Briefcase } from 'lucide-react';
import { mockCompanies, mockCompanyEvents } from '@/data/mockData';
import { Company, CompanyEvent } from '@/types';

export default function CompanyIntelligence() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(mockCompanies[0]);
  const companyEvents = mockCompanyEvents.filter((event) => event.companyId === selectedCompany?.id);

  return (
    <DashboardLayout title="Company Intelligence" subtitle="Competitor tracking and market analysis">
      <div className="space-y-3 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {mockCompanies.map((company) => (
            <Card
              key={company.id}
              onClick={() => setSelectedCompany(company)}
              className={`cursor-pointer transition-all duration-200 ${selectedCompany?.id === company.id ? 'border-foreground/40 shadow-sm' : 'hover:border-foreground/20 hover:shadow-sm'}`}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">{company.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{company.domain}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{company.industry}</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{company.size}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedCompany && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm">{selectedCompany.name}</CardTitle>
                <a href={`https://${selectedCompany.domain}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                  {selectedCompany.domain} <ExternalLink className="h-3 w-3" />
                </a>
              </CardHeader>
              <CardContent className="space-y-3 px-3 pb-3 pt-0">
                <p className="text-xs text-muted-foreground">{selectedCompany.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-md bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground">Industry</p>
                    <p className="text-xs font-medium">{selectedCompany.industry}</p>
                  </div>
                  <div className="p-2 rounded-md bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground">Size</p>
                    <p className="text-xs font-medium">{selectedCompany.size}</p>
                  </div>
                </div>
                {selectedCompany.competitors && (
                  <div className="flex flex-wrap gap-1">
                    {selectedCompany.competitors.map((comp) => (
                      <Badge key={comp} variant="outline" className="text-[10px] px-1.5 py-0">{comp}</Badge>
                    ))}
                  </div>
                )}
                <Button size="sm" className="w-full h-8 text-xs"><FileText className="h-3.5 w-3.5 mr-1.5" />Download Report</Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm">Events Timeline</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
                <Tabs defaultValue="all">
                  <TabsList className="mb-2 h-8">
                    <TabsTrigger value="all" className="text-xs h-7">All Events</TabsTrigger>
                    <TabsTrigger value="pricing" className="text-xs h-7">Pricing</TabsTrigger>
                    <TabsTrigger value="product" className="text-xs h-7">Product</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="space-y-2">
                    {companyEvents.length > 0 ? companyEvents.map((event) => (
                      <div key={event.id} className="flex gap-2 p-2 rounded-md bg-secondary/50">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          {event.eventType === 'pricing_change' ? <DollarSign className="h-4 w-4 text-warning" /> :
                           event.eventType === 'product_launch' ? <Zap className="h-4 w-4 text-primary" /> :
                           <TrendingUp className="h-4 w-4 text-success" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="mb-1 text-[10px] px-1.5 py-0">{event.eventType.replace('_', ' ')}</Badge>
                          <p className="text-xs font-medium">{event.summary}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{event.publishedAt}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">{event.confidence}%</div>
                      </div>
                    )) : (
                      <div className="text-center py-6 text-xs text-muted-foreground">No events tracked</div>
                    )}
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
