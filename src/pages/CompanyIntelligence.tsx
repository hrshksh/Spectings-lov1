import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Building2, TrendingUp, Zap, FileText, ExternalLink, 
  DollarSign, Search, Filter, Download, Users,
  Activity, ChevronDown, MoreHorizontal, Eye, Bell, Trash2, Globe, Calendar
} from 'lucide-react';
import { mockCompanies, mockCompanyEvents } from '@/data/mockData';

// Get all unique competitors across all companies
const allCompetitors = [...new Set(mockCompanies.flatMap(c => c.competitors || []))];

export default function CompanyIntelligence() {
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

  const industries = [...new Set(mockCompanies.map(c => c.industry))];
  const sizes = [...new Set(mockCompanies.map(c => c.size))];

  const getCompanyEvents = (companyId: string) => {
    return mockCompanyEvents.filter((event) => event.companyId === companyId);
  };

  const getLatestEvent = (companyId: string) => {
    const events = getCompanyEvents(companyId);
    return events.length > 0 ? events[0] : null;
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'pricing_change': return <DollarSign className="h-3 w-3" />;
      case 'product_launch': return <Zap className="h-3 w-3" />;
      case 'hiring': return <Users className="h-3 w-3" />;
      case 'funding': return <TrendingUp className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const getEventBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case 'pricing_change': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400';
      case 'product_launch': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400';
      case 'hiring': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400';
      case 'funding': return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Check if a company tracks a specific competitor
  const tracksCompetitor = (company: typeof mockCompanies[0], competitor: string) => {
    return company.competitors?.includes(competitor) || false;
  };

  return (
    <DashboardLayout title="Competitor Tracking" subtitle="Monitor and analyze your competitors">
      <div className="space-y-3 animate-fade-in">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search competitors..." 
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

        {/* Competitors Table with Column Dropdowns */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Tracked Competitors ({filteredCompanies.length})</span>
              <Button size="sm" className="h-7 text-xs">
                <Building2 className="h-3.5 w-3.5 mr-1.5" />Add Competitor
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px] sticky left-0 bg-card z-10">Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Size</TableHead>
                  {/* Dynamic competitor columns with dropdowns */}
                  {allCompetitors.map((competitor) => (
                    <TableHead key={competitor} className="min-w-[140px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 text-xs font-medium -ml-2 hover:bg-secondary">
                            {competitor}
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <div className="px-2 py-1.5">
                            <p className="text-xs font-medium">{competitor}</p>
                            <p className="text-[10px] text-muted-foreground">Competitor details</p>
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-xs">
                            <Globe className="h-3 w-3 mr-2" />
                            Visit Website
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs">
                            <Eye className="h-3 w-3 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs">
                            <Activity className="h-3 w-3 mr-2" />
                            View Activities
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs">
                            <FileText className="h-3 w-3 mr-2" />
                            Generate Report
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-xs">
                            <Bell className="h-3 w-3 mr-2" />
                            Set Alerts
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs">
                            <Calendar className="h-3 w-3 mr-2" />
                            View Timeline
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                  ))}
                  <TableHead>Latest Activity</TableHead>
                  <TableHead className="text-right w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => {
                  const latestEvent = getLatestEvent(company.id);
                  
                  return (
                    <TableRow key={company.id} className="hover:bg-muted/40">
                      <TableCell className="py-2 sticky left-0 bg-card z-10">
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
                      {/* Competitor tracking status for each column */}
                      {allCompetitors.map((competitor) => (
                        <TableCell key={competitor} className="py-2">
                          {tracksCompetitor(company, competitor) ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
                                  Tracking
                                  <ChevronDown className="h-2.5 w-2.5 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-48">
                                <div className="px-2 py-1.5">
                                  <p className="text-xs font-medium">{company.name} vs {competitor}</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-xs">
                                  <TrendingUp className="h-3 w-3 mr-2" />
                                  Compare Metrics
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-xs">
                                  <DollarSign className="h-3 w-3 mr-2" />
                                  Pricing Comparison
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-xs">
                                  <Zap className="h-3 w-3 mr-2" />
                                  Feature Comparison
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-xs">
                                  <Activity className="h-3 w-3 mr-2" />
                                  Activity Log
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-xs text-destructive">
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Stop Tracking
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-muted-foreground">
                              —
                            </Button>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="py-2">
                        {latestEvent ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${getEventBadgeVariant(latestEvent.eventType)}`}>
                              {getEventIcon(latestEvent.eventType)}
                              {latestEvent.eventType.replace('_', ' ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem className="text-xs">
                              <Eye className="h-3 w-3 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs">
                              <FileText className="h-3 w-3 mr-2" />
                              Generate Report
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs">
                              <Bell className="h-3 w-3 mr-2" />
                              Set Alerts
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-xs text-destructive">
                              <Trash2 className="h-3 w-3 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredCompanies.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No competitors found matching your criteria
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Total Tracked</p>
                  <p className="text-lg font-semibold">{mockCompanies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Pricing Changes</p>
                  <p className="text-lg font-semibold">{mockCompanyEvents.filter(e => e.eventType === 'pricing_change').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Product Launches</p>
                  <p className="text-lg font-semibold">{mockCompanyEvents.filter(e => e.eventType === 'product_launch').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Total Events</p>
                  <p className="text-lg font-semibold">{mockCompanyEvents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
