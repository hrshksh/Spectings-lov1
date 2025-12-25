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
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockCompanies.map((company) => (
            <Card
              key={company.id}
              onClick={() => setSelectedCompany(company)}
              className={`cursor-pointer hover:shadow-md transition-shadow ${selectedCompany?.id === company.id ? 'ring-2 ring-primary' : ''}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">{company.domain}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{company.industry}</Badge>
                      <Badge variant="outline">{company.size}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedCompany && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{selectedCompany.name}</CardTitle>
                <a href={`https://${selectedCompany.domain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                  {selectedCompany.domain} <ExternalLink className="h-3 w-3" />
                </a>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{selectedCompany.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Industry</p>
                    <p className="font-medium">{selectedCompany.industry}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Size</p>
                    <p className="font-medium">{selectedCompany.size}</p>
                  </div>
                </div>
                {selectedCompany.competitors && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.competitors.map((comp) => (
                      <Badge key={comp} variant="outline">{comp}</Badge>
                    ))}
                  </div>
                )}
                <Button className="w-full"><FileText className="h-4 w-4 mr-2" />Download Report</Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Events Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Events</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="product">Product</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="space-y-4">
                    {companyEvents.length > 0 ? companyEvents.map((event) => (
                      <div key={event.id} className="flex gap-4 p-4 rounded-lg bg-secondary/50">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          {event.eventType === 'pricing_change' ? <DollarSign className="h-5 w-5 text-warning" /> :
                           event.eventType === 'product_launch' ? <Zap className="h-5 w-5 text-primary" /> :
                           <TrendingUp className="h-5 w-5 text-success" />}
                        </div>
                        <div className="flex-1">
                          <Badge variant="outline" className="mb-2">{event.eventType.replace('_', ' ')}</Badge>
                          <p className="font-medium">{event.summary}</p>
                          <p className="text-sm text-muted-foreground mt-1">{event.publishedAt}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">{event.confidence}%</div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">No events tracked</div>
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
