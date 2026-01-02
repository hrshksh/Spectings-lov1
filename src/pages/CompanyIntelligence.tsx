import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Building2, TrendingUp, Zap, FileText, 
  DollarSign, Search, Download, Users,
  Activity, ChevronDown, MoreHorizontal, Eye, Bell, Trash2, Globe, Calendar,
  X, Megaphone, Newspaper, Star, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { AddCompetitorDialog } from '@/components/competitors/AddCompetitorDialog';

type Company = Tables<'companies'>;
type CompanyEvent = Tables<'company_events'>;

export default function CompanyIntelligence() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Fetch companies from database
  const { data: companies = [], isLoading: companiesLoading, error: companiesError } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Company[];
    }
  });

  // Fetch company events from database
  const { data: companyEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['company_events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_events')
        .select('*')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data as CompanyEvent[];
    }
  });

  const isLoading = companiesLoading || eventsLoading;

  // Filter competitors based on search
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesSearch;
  });

  const getCompanyEvents = (companyId: string) => {
    return companyEvents.filter((event) => event.company_id === companyId);
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'pricing_change': return <DollarSign className="h-4 w-4" />;
      case 'product_launch': return <Zap className="h-4 w-4" />;
      case 'hiring': return <Users className="h-4 w-4" />;
      case 'funding': return <TrendingUp className="h-4 w-4" />;
      case 'campaign': return <Megaphone className="h-4 w-4" />;
      case 'news': return <Newspaper className="h-4 w-4" />;
      case 'review': return <Star className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'pricing_change': return 'bg-amber-500';
      case 'product_launch': return 'bg-blue-500';
      case 'hiring': return 'bg-green-500';
      case 'funding': return 'bg-purple-500';
      case 'campaign': return 'bg-pink-500';
      case 'news': return 'bg-cyan-500';
      case 'review': return 'bg-orange-500';
      default: return 'bg-muted-foreground';
    }
  };

  const getEventBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case 'pricing_change': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400';
      case 'product_launch': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400';
      case 'hiring': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400';
      case 'funding': return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400';
      case 'campaign': return 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400';
      case 'news': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400';
      case 'review': return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatEventType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Calculate stats
  const totalEvents = companyEvents.length;
  const pricingChanges = companyEvents.filter(e => e.event_type === 'pricing_change').length;
  const productLaunches = companyEvents.filter(e => e.event_type === 'product_launch').length;

  return (
    <DashboardLayout title="Competitor Tracking" subtitle="Monitor and analyze your competitors">
      <div className="space-y-3 animate-fade-in">
        {/* Search and Actions */}
        <Card>
          <CardContent className="p-2 sm:p-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search competitors..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pl-8 h-9 text-sm w-full" 
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-9 flex-1 sm:flex-none">
                  <Download className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <Button size="sm" className="h-9 flex-1 sm:flex-none" onClick={() => setAddDialogOpen(true)}>
                  <Building2 className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Add Competitor</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Competitor Dialog */}
        <AddCompetitorDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

        {/* Error State */}
        {companiesError && (
          <Card className="border-destructive">
            <CardContent className="p-4 flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">Failed to load competitors. Please try again.</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Competitors List - Row wise */}
        {!isLoading && !companiesError && (
          <div className="space-y-3">
            {filteredCompanies.map((company) => {
              const events = getCompanyEvents(company.id);
              const isSelected = selectedCompetitor === company.id;
              
              // Group events by type for stats
              const eventStats = events.reduce((acc, event) => {
                acc[event.event_type] = (acc[event.event_type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              
              return (
                <Card 
                  key={company.id}
                  className={cn(
                    "cursor-pointer transition-all duration-300 ease-in-out overflow-hidden",
                    isSelected 
                      ? "ring-2 ring-primary shadow-lg" 
                      : "hover:shadow-md hover:border-primary/50"
                  )}
                  onClick={() => setSelectedCompetitor(isSelected ? null : company.id)}
                >
                  {/* Competitor Header */}
                  <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* Logo/Icon */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/10">
                        <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      
                      {/* Company Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-sm sm:text-base font-semibold">{company.name}</h3>
                          {company.domain && (
                            <a 
                              href={`https://${company.domain}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Globe className="h-3 w-3" />
                              <span className="hidden xs:inline">{company.domain}</span>
                            </a>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {company.industry && (
                            <Badge variant="secondary" className="text-[10px] sm:text-xs">{company.industry}</Badge>
                          )}
                          {company.size && (
                            <Badge variant="outline" className="text-[10px] sm:text-xs">{company.size}</Badge>
                          )}
                          {company.founded && (
                            <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">Est. {company.founded}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Stats - visible when collapsed on large screens */}
                    {!isSelected && Object.keys(eventStats).length > 0 && (
                      <div className="hidden xl:flex items-center gap-4">
                        {Object.entries(eventStats).slice(0, 4).map(([type, count]) => (
                          <div key={type} className="text-center">
                            <div className={cn(
                              "inline-flex items-center justify-center h-8 w-8 rounded-lg mb-1",
                              getEventBadgeVariant(type)
                            )}>
                              {getEventIcon(type)}
                            </div>
                            <p className="text-[10px] text-muted-foreground">{count}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 mt-2 sm:mt-0">
                      <Badge variant="outline" className="text-[10px] sm:text-xs">
                        <Activity className="h-3 w-3 mr-1" />
                        {events.length} events
                      </Badge>
                      <div className="flex items-center gap-1">
                        <ChevronDown className={cn(
                          "h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform duration-300",
                          isSelected && "rotate-180"
                        )} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="text-xs">
                              <Eye className="h-3.5 w-3.5 mr-2" />View Full Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs">
                              <Globe className="h-3.5 w-3.5 mr-2" />Visit Website
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs">
                              <FileText className="h-3.5 w-3.5 mr-2" />Generate Report
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs">
                              <Bell className="h-3.5 w-3.5 mr-2" />Set Alerts
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-xs text-destructive">
                              <Trash2 className="h-3.5 w-3.5 mr-2" />Stop Tracking
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isSelected && (
                    <div className="border-t bg-muted/30" onClick={(e) => e.stopPropagation()}>
                      {/* Stats Row */}
                      <div className="p-3 sm:p-4 border-b bg-background/50">
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                          {[
                            { type: 'pricing_change', label: 'Pricing', icon: DollarSign },
                            { type: 'product_launch', label: 'Products', icon: Zap },
                            { type: 'hiring', label: 'Hiring', icon: Users },
                            { type: 'funding', label: 'Funding', icon: TrendingUp },
                            { type: 'campaign', label: 'Campaigns', icon: Megaphone },
                            { type: 'news', label: 'News', icon: Newspaper },
                          ].map(({ type, label, icon: Icon }) => (
                            <div key={type} className="flex items-center gap-2 p-2 rounded-lg bg-background border">
                              <div className={cn(
                                "h-7 w-7 sm:h-8 sm:w-8 rounded-md flex items-center justify-center flex-shrink-0",
                                getEventBadgeVariant(type)
                              )}>
                                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-base sm:text-lg font-semibold leading-none">{eventStats[type] || 0}</p>
                                <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">{label}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Timeline Section */}
                      <div className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <h4 className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            Activity Timeline
                          </h4>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => setSelectedCompetitor(null)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Collapse</span>
                          </Button>
                        </div>
                        
                        {events.length > 0 ? (
                          <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                            
                            <div className="space-y-0">
                              {events.map((event) => (
                                <div 
                                  key={event.id} 
                                  className="relative pl-8 py-2 sm:py-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                                >
                                  {/* Timeline dot */}
                                  <div className={cn(
                                    "absolute left-1.5 top-3 sm:top-4 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full ring-2 sm:ring-4 ring-background flex items-center justify-center",
                                    getEventColor(event.event_type)
                                  )}>
                                    <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-white" />
                                  </div>
                                  
                                  {/* Event Content - Stacked on mobile, inline on larger screens */}
                                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                                    {/* Date & Event Type Row */}
                                    <div className="flex items-center gap-2 sm:gap-4">
                                      {/* Date Column */}
                                      <div className="w-16 sm:w-20 flex-shrink-0">
                                        <p className="text-[11px] sm:text-xs font-medium">
                                          {event.published_at ? new Date(event.published_at).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric'
                                          }) : 'N/A'}
                                        </p>
                                        <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                                          {event.published_at ? new Date(event.published_at).getFullYear() : ''}
                                        </p>
                                      </div>
                                      
                                      {/* Event Type */}
                                      <div className="flex-shrink-0">
                                        <span className={cn(
                                          "inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium",
                                          getEventBadgeVariant(event.event_type)
                                        )}>
                                          {getEventIcon(event.event_type)}
                                          <span className="hidden xs:inline">{formatEventType(event.event_type)}</span>
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {/* Summary */}
                                    <div className="flex-1 min-w-0 mt-1 sm:mt-0">
                                      <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                                        {event.summary || 'No summary available'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground bg-muted/30 rounded-lg">
                            No activities tracked yet for this competitor
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
            
            {filteredCompanies.length === 0 && !isLoading && (
              <Card>
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  {companies.length === 0 
                    ? "No competitors being tracked yet. Add a competitor to get started."
                    : "No competitors found matching your search"
                  }
                </CardContent>
              </Card>
            )}
          </div>
        )}

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
                  <p className="text-lg font-semibold">{isLoading ? '-' : companies.length}</p>
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
                  <p className="text-lg font-semibold">{isLoading ? '-' : pricingChanges}</p>
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
                  <p className="text-lg font-semibold">{isLoading ? '-' : productLaunches}</p>
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
                  <p className="text-lg font-semibold">{isLoading ? '-' : totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
