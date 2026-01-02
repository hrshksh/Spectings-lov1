import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building2, Globe, TrendingUp, Zap, FileText, ExternalLink, 
  DollarSign, Search, Filter, Download, Users, Calendar,
  Briefcase, Target, Activity, ChevronRight, X
} from 'lucide-react';
import { mockCompanies, mockCompanyEvents } from '@/data/mockData';
import { Company, CompanyEvent } from '@/types';

export default function CompanyIntelligence() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');

  const filteredCompanies = mockCompanies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = industryFilter === 'all' || company.industry === industryFilter;
    const matchesSize = sizeFilter === 'all' || company.size === sizeFilter;
    return matchesSearch && matchesIndustry && matchesSize;
  });

  const companyEvents = mockCompanyEvents.filter((event) => event.companyId === selectedCompany?.id);
  const industries = [...new Set(mockCompanies.map(c => c.industry))];
  const sizes = [...new Set(mockCompanies.map(c => c.size))];

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'pricing_change': return <DollarSign className="h-3.5 w-3.5" />;
      case 'product_launch': return <Zap className="h-3.5 w-3.5" />;
      case 'hiring': return <Users className="h-3.5 w-3.5" />;
      case 'funding': return <TrendingUp className="h-3.5 w-3.5" />;
      default: return <Activity className="h-3.5 w-3.5" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'pricing_change': return 'text-amber-600 bg-amber-50 dark:bg-amber-950/30';
      case 'product_launch': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30';
      case 'hiring': return 'text-green-600 bg-green-50 dark:bg-green-950/30';
      case 'funding': return 'text-purple-600 bg-purple-50 dark:bg-purple-950/30';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <DashboardLayout title="Company Intelligence" subtitle="Competitor tracking and market analysis">
      <div className="space-y-3 animate-fade-in">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search companies by name, domain, or description..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pl-8 h-8 text-sm" 
                />
              </div>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-32 h-8 text-sm">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map(ind => (
                    <SelectItem key={ind} value={ind || ''}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sizeFilter} onValueChange={setSizeFilter}>
                <SelectTrigger className="w-28 h-8 text-sm">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  {sizes.map(size => (
                    <SelectItem key={size} value={size || ''}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-3.5 w-3.5 mr-1.5" />Filters
              </Button>
              <Button size="sm" className="h-8">
                <Download className="h-3.5 w-3.5 mr-1.5" />Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className={`grid gap-3 transition-all duration-300 ${selectedCompany ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1'}`}>
          {/* Companies Table */}
          <div className={selectedCompany ? 'lg:col-span-3' : 'col-span-1'}>
            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>Companies ({filteredCompanies.length})</span>
                  {selectedCompany && (
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedCompany(null)}>
                      Clear Selection
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Company</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Competitors</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow 
                        key={company.id} 
                        className={`cursor-pointer transition-all duration-150 ${selectedCompany?.id === company.id ? 'bg-muted/80 border-l-2 border-l-foreground' : 'hover:bg-muted/40'}`}
                        onClick={() => setSelectedCompany(company)}
                      >
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{company.name}</p>
                              <a 
                                href={`https://${company.domain}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-0.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {company.domain}
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{company.industry}</Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="text-xs text-muted-foreground">{company.size}</span>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {company.competitors?.slice(0, 3).map((comp) => (
                              <Badge key={comp} variant="outline" className="text-[10px] px-1.5 py-0">{comp}</Badge>
                            ))}
                            {company.competitors && company.competitors.length > 3 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{company.competitors.length - 3}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredCompanies.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No companies found matching your criteria
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Company Detail Panel */}
          {selectedCompany && (
            <div className="lg:col-span-2 space-y-3 animate-fade-in">
              {/* Company Overview */}
              <Card className="border-foreground/30">
                <CardHeader className="py-2 px-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{selectedCompany.name}</CardTitle>
                        <a 
                          href={`https://${selectedCompany.domain}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-primary hover:underline flex items-center gap-0.5"
                        >
                          {selectedCompany.domain}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedCompany(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-3 pb-3 pt-0 space-y-3">
                  <p className="text-xs text-muted-foreground">{selectedCompany.description}</p>
                  
                  {/* Key Info Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-md bg-secondary/50 border border-border">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                        <Briefcase className="h-3 w-3" />
                        <span className="text-[10px]">Industry</span>
                      </div>
                      <p className="text-xs font-medium">{selectedCompany.industry}</p>
                    </div>
                    <div className="p-2 rounded-md bg-secondary/50 border border-border">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                        <Users className="h-3 w-3" />
                        <span className="text-[10px]">Size</span>
                      </div>
                      <p className="text-xs font-medium">{selectedCompany.size}</p>
                    </div>
                    <div className="p-2 rounded-md bg-secondary/50 border border-border">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                        <Calendar className="h-3 w-3" />
                        <span className="text-[10px]">Founded</span>
                      </div>
                      <p className="text-xs font-medium">{selectedCompany.founded || 'N/A'}</p>
                    </div>
                    <div className="p-2 rounded-md bg-secondary/50 border border-border">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                        <Activity className="h-3 w-3" />
                        <span className="text-[10px]">Events</span>
                      </div>
                      <p className="text-xs font-medium">{companyEvents.length} tracked</p>
                    </div>
                  </div>

                  <Button size="sm" className="w-full h-8 text-xs">
                    <FileText className="h-3.5 w-3.5 mr-1.5" />Download Report
                  </Button>
                </CardContent>
              </Card>

              {/* Competitors */}
              <Card>
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" />
                    Competitors
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 pt-0">
                  {selectedCompany.competitors && selectedCompany.competitors.length > 0 ? (
                    <div className="grid grid-cols-1 gap-1.5">
                      {selectedCompany.competitors.map((competitor, idx) => (
                        <div 
                          key={competitor} 
                          className="flex items-center justify-between p-2 rounded-md bg-secondary/50 border border-border hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded bg-muted flex items-center justify-center text-[10px] font-medium">
                              {idx + 1}
                            </div>
                            <span className="text-xs font-medium">{competitor}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">No competitors tracked</p>
                  )}
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              <Card>
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 pt-0">
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-2 h-7 w-full grid grid-cols-4">
                      <TabsTrigger value="all" className="text-[10px] h-6">All</TabsTrigger>
                      <TabsTrigger value="pricing" className="text-[10px] h-6">Pricing</TabsTrigger>
                      <TabsTrigger value="product" className="text-[10px] h-6">Product</TabsTrigger>
                      <TabsTrigger value="hiring" className="text-[10px] h-6">Hiring</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="space-y-1.5 mt-0">
                      {companyEvents.length > 0 ? companyEvents.map((event) => (
                        <div key={event.id} className="flex gap-2 p-2 rounded-md bg-secondary/50 border border-border">
                          <div className={`h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0 ${getEventColor(event.eventType)}`}>
                            {getEventIcon(event.eventType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <Badge variant="outline" className="text-[9px] px-1 py-0 capitalize">
                                {event.eventType.replace('_', ' ')}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">{event.confidence}% confidence</span>
                            </div>
                            <p className="text-xs">{event.summary}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{event.publishedAt}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-6 text-xs text-muted-foreground">
                          No activity tracked for this company
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="pricing" className="space-y-1.5 mt-0">
                      {companyEvents.filter(e => e.eventType === 'pricing_change').length > 0 ? 
                        companyEvents.filter(e => e.eventType === 'pricing_change').map((event) => (
                          <div key={event.id} className="flex gap-2 p-2 rounded-md bg-secondary/50 border border-border">
                            <div className={`h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0 ${getEventColor(event.eventType)}`}>
                              {getEventIcon(event.eventType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs">{event.summary}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{event.publishedAt}</p>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-6 text-xs text-muted-foreground">No pricing events</div>
                        )
                      }
                    </TabsContent>
                    <TabsContent value="product" className="space-y-1.5 mt-0">
                      {companyEvents.filter(e => e.eventType === 'product_launch').length > 0 ? 
                        companyEvents.filter(e => e.eventType === 'product_launch').map((event) => (
                          <div key={event.id} className="flex gap-2 p-2 rounded-md bg-secondary/50 border border-border">
                            <div className={`h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0 ${getEventColor(event.eventType)}`}>
                              {getEventIcon(event.eventType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs">{event.summary}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{event.publishedAt}</p>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-6 text-xs text-muted-foreground">No product events</div>
                        )
                      }
                    </TabsContent>
                    <TabsContent value="hiring" className="space-y-1.5 mt-0">
                      {companyEvents.filter(e => e.eventType === 'hiring').length > 0 ? 
                        companyEvents.filter(e => e.eventType === 'hiring').map((event) => (
                          <div key={event.id} className="flex gap-2 p-2 rounded-md bg-secondary/50 border border-border">
                            <div className={`h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0 ${getEventColor(event.eventType)}`}>
                              {getEventIcon(event.eventType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs">{event.summary}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{event.publishedAt}</p>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-6 text-xs text-muted-foreground">No hiring events</div>
                        )
                      }
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
