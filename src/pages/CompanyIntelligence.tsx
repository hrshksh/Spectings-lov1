import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Building2, TrendingUp, Zap, FileText, ExternalLink, 
  DollarSign, Search, Download, Users,
  Activity, ChevronDown, MoreHorizontal, Eye, Bell, Trash2, Globe, Calendar,
  X, Megaphone, Newspaper, Star
} from 'lucide-react';
import { mockCompanies, mockCompanyEvents } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function CompanyIntelligence() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);

  // Filter competitors based on search
  const filteredCompanies = mockCompanies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.domain.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getCompanyEvents = (companyId: string) => {
    return mockCompanyEvents.filter((event) => event.companyId === companyId);
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

  const selectedCompany = selectedCompetitor ? mockCompanies.find(c => c.id === selectedCompetitor) : null;
  const selectedEvents = selectedCompetitor ? getCompanyEvents(selectedCompetitor) : [];

  return (
    <DashboardLayout title="Competitor Tracking" subtitle="Monitor and analyze your competitors">
      <div className="space-y-3 animate-fade-in">
        {/* Search and Actions */}
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
              <Button size="sm" className="h-8">
                <Download className="h-3.5 w-3.5 mr-1.5" />Export
              </Button>
              <Button size="sm" className="h-8">
                <Building2 className="h-3.5 w-3.5 mr-1.5" />Add Competitor
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Competitors Grid */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {filteredCompanies.map((company) => {
            const events = getCompanyEvents(company.id);
            const isSelected = selectedCompetitor === company.id;
            
            return (
              <Card 
                key={company.id}
                className={cn(
                  "flex-shrink-0 cursor-pointer transition-all duration-300 ease-in-out",
                  isSelected 
                    ? "w-[400px] ring-2 ring-primary shadow-lg" 
                    : "w-[200px] hover:shadow-md hover:border-primary/50"
                )}
                onClick={() => setSelectedCompetitor(isSelected ? null : company.id)}
              >
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-semibold truncate">{company.name}</CardTitle>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 -mr-1 -mt-1">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem className="text-xs">
                          <Eye className="h-3 w-3 mr-2" />View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">
                          <Globe className="h-3 w-3 mr-2" />Visit Website
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">
                          <FileText className="h-3 w-3 mr-2" />Generate Report
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">
                          <Bell className="h-3 w-3 mr-2" />Set Alerts
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs text-destructive">
                          <Trash2 className="h-3 w-3 mr-2" />Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="p-3 pt-0">
                  {/* Quick Stats */}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{company.industry}</Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{company.size}</Badge>
                  </div>
                  
                  {/* Event Count */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <Activity className="h-3 w-3" />
                    <span>{events.length} activities tracked</span>
                  </div>

                  {/* Expanded Timeline View */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-primary" />
                          Activity Timeline
                        </h4>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => setSelectedCompetitor(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <ScrollArea className="h-[300px] pr-3">
                        {events.length > 0 ? (
                          <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
                            
                            <div className="space-y-4">
                              {events.map((event, index) => (
                                <div key={event.id} className="relative pl-6">
                                  {/* Timeline dot */}
                                  <div className={cn(
                                    "absolute left-0 top-1 h-4 w-4 rounded-full flex items-center justify-center text-white",
                                    getEventColor(event.eventType)
                                  )}>
                                    <div className="h-2 w-2 rounded-full bg-white" />
                                  </div>
                                  
                                  <div className="bg-muted/50 rounded-lg p-3">
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                      <span className={cn(
                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                                        getEventBadgeVariant(event.eventType)
                                      )}>
                                        {getEventIcon(event.eventType)}
                                        {formatEventType(event.eventType)}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                        {new Date(event.publishedAt).toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-xs text-foreground leading-relaxed">
                                      {event.summary}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                                        {Math.round(event.confidence * 100)}% confidence
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-sm text-muted-foreground">
                            No activities tracked yet
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  )}
                  
                  {/* Collapsed: Show latest events preview */}
                  {!isSelected && events.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      {events.slice(0, 2).map((event) => (
                        <div key={event.id} className="flex items-center gap-1.5">
                          <span className={cn(
                            "h-2 w-2 rounded-full flex-shrink-0",
                            getEventColor(event.eventType)
                          )} />
                          <span className="text-[10px] text-muted-foreground truncate">
                            {formatEventType(event.eventType)}
                          </span>
                        </div>
                      ))}
                      {events.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{events.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          {filteredCompanies.length === 0 && (
            <div className="flex-1 text-center py-12 text-sm text-muted-foreground">
              No competitors found matching your search
            </div>
          )}
        </div>

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
