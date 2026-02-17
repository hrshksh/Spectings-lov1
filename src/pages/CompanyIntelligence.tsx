import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Building2, TrendingUp, Zap, FileText, 
  DollarSign, Download, Users,
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
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { data: trackedCompanies = [], isLoading: companiesLoading, error: companiesError } = useQuery({
    queryKey: ['companies', 'tracked'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('is_tracked', true)
        .order('name')
        .limit(200);
      if (error) throw error;
      return data as Company[];
    }
  });

  const { data: companyEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['company_events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_events')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as CompanyEvent[];
    }
  });

  const isLoading = companiesLoading || eventsLoading;
  const queryClient = useQueryClient();

  const untrackCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      const { error } = await supabase
        .from('companies')
        .update({ is_tracked: false })
        .eq('id', companyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company removed from tracking list');
      setSelectedCompetitor(null);
    },
    onError: () => {
      toast.error('Failed to untrack company');
    }
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

  const totalEvents = companyEvents.length;
  const pricingChanges = companyEvents.filter(e => e.event_type === 'pricing_change').length;
  const productLaunches = companyEvents.filter(e => e.event_type === 'product_launch').length;

  return (
    <DashboardLayout title="Competitor Tracking" subtitle="Monitor and analyze your competitors">
      <div className="space-y-4 animate-fade-in">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">{isLoading ? '—' : trackedCompanies.length}</p>
                  <p className="text-xs text-muted-foreground">Tracked</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">{isLoading ? '—' : totalEvents}</p>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">{isLoading ? '—' : pricingChanges}</p>
                  <p className="text-xs text-muted-foreground">Pricing Changes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">{isLoading ? '—' : productLaunches}</p>
                  <p className="text-xs text-muted-foreground">Product Launches</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Competitors
            <span className="ml-1.5 text-muted-foreground font-normal">({trackedCompanies.length})</span>
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={() => setAddDialogOpen(true)}>
              <Building2 className="h-3.5 w-3.5 mr-1.5" />
              Add Competitor
            </Button>
          </div>
        </div>

        <AddCompetitorDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

        {/* Error */}
        {companiesError && (
          <Card className="border-destructive">
            <CardContent className="p-4 flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">Failed to load competitors. Please try again.</p>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
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

        {/* Competitors List */}
        {!isLoading && !companiesError && (
          <div className="space-y-3">
            {trackedCompanies.map((company) => {
              const events = getCompanyEvents(company.id);
              const isSelected = selectedCompetitor === company.id;
              
              const eventStats = events.reduce((acc, event) => {
                acc[event.event_type] = (acc[event.event_type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              
              return (
                <Card 
                  key={company.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 overflow-hidden",
                    isSelected 
                      ? "ring-1 ring-primary" 
                      : "hover:border-primary/30"
                  )}
                  onClick={() => setSelectedCompetitor(isSelected ? null : company.id)}
                >
                  {/* Header */}
                  <div className="p-4 flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-semibold truncate">{company.name}</h3>
                        {company.domain && (
                          <a 
                            href={`https://${company.domain}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Globe className="h-3 w-3" />
                            <span className="hidden sm:inline">{company.domain}</span>
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {company.industry && (
                          <Badge variant="secondary" className="text-[10px]">{company.industry}</Badge>
                        )}
                        {company.size && (
                          <Badge variant="outline" className="text-[10px]">{company.size}</Badge>
                        )}
                        {company.founded && (
                          <span className="text-[10px] text-muted-foreground hidden sm:inline">Est. {company.founded}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Quick stats when collapsed */}
                    {!isSelected && Object.keys(eventStats).length > 0 && (
                      <div className="hidden xl:flex items-center gap-3">
                        {Object.entries(eventStats).slice(0, 3).map(([type, count]) => (
                          <div key={type} className="text-center">
                            <div className={cn(
                              "inline-flex items-center justify-center h-7 w-7 rounded-md mb-0.5",
                              getEventBadgeVariant(type)
                            )}>
                              {getEventIcon(type)}
                            </div>
                            <p className="text-[10px] text-muted-foreground">{count}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className="text-[10px]">
                        {events.length} events
                      </Badge>
                      <ChevronDown className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        isSelected && "rotate-180"
                      )} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem className="text-xs">
                            <Eye className="h-3.5 w-3.5 mr-2" />View Profile
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
                          <DropdownMenuItem 
                            className="text-xs text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              untrackCompanyMutation.mutate(company.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />Stop Tracking
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isSelected && (
                    <div className="border-t" onClick={(e) => e.stopPropagation()}>
                      {/* Event type stats */}
                      <div className="p-4 border-b bg-muted/20">
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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
                                "h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0",
                                getEventBadgeVariant(type)
                              )}>
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-lg font-semibold leading-none">{eventStats[type] || 0}</p>
                                <p className="text-[9px] text-muted-foreground truncate">{label}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Timeline */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xs font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            Activity Timeline
                          </h4>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => setSelectedCompetitor(null)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Collapse
                          </Button>
                        </div>
                        
                        {events.length > 0 ? (
                          <div className="relative">
                            <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                            <div className="space-y-0">
                              {events.map((event) => (
                                <div 
                                  key={event.id} 
                                  className="relative pl-8 py-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                                >
                                  <div className={cn(
                                    "absolute left-1.5 top-4 h-3.5 w-3.5 rounded-full ring-4 ring-background flex items-center justify-center",
                                    getEventColor(event.event_type)
                                  )}>
                                    <div className="h-1 w-1 rounded-full bg-white" />
                                  </div>
                                  
                                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-16 flex-shrink-0">
                                        <p className="text-xs font-medium">
                                          {event.published_at ? new Date(event.published_at).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric'
                                          }) : 'N/A'}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                          {event.published_at ? new Date(event.published_at).getFullYear() : ''}
                                        </p>
                                      </div>
                                      <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium",
                                        getEventBadgeVariant(event.event_type)
                                      )}>
                                        {getEventIcon(event.event_type)}
                                        <span className="hidden xs:inline">{formatEventType(event.event_type)}</span>
                                      </span>
                                    </div>
                                    <p className="flex-1 text-sm text-foreground leading-relaxed">
                                      {event.summary || 'No summary available'}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-sm text-muted-foreground bg-muted/20 rounded-lg">
                            No activities tracked yet for this competitor
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
            
            {trackedCompanies.length === 0 && (
              <Card>
                <CardContent className="py-16 text-center">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                  <p className="text-sm font-medium text-muted-foreground">No competitors tracked</p>
                  <p className="text-xs text-muted-foreground mt-1">Add companies to start monitoring.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
