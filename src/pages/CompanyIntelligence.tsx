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

        {/* Competitors List - Row wise */}
        <div className="space-y-2">
          {filteredCompanies.map((company) => {
            const events = getCompanyEvents(company.id);
            const isSelected = selectedCompetitor === company.id;
            
            return (
              <Card 
                key={company.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 ease-in-out",
                  isSelected 
                    ? "ring-2 ring-primary shadow-lg" 
                    : "hover:shadow-md hover:border-primary/50"
                )}
                onClick={() => setSelectedCompetitor(isSelected ? null : company.id)}
              >
                <CardContent className="p-3">
                  {/* Row Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold truncate">{company.name}</h3>
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
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{company.industry}</Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{company.size}</Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {events.length} activities
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Latest Events Preview (when collapsed) */}
                    {!isSelected && events.length > 0 && (
                      <div className="hidden md:flex items-center gap-2 mr-4">
                        {events.slice(0, 3).map((event) => (
                          <span 
                            key={event.id}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                              getEventBadgeVariant(event.eventType)
                            )}
                          >
                            {getEventIcon(event.eventType)}
                            {formatEventType(event.eventType)}
                          </span>
                        ))}
                        {events.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{events.length - 3}</span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <ChevronDown className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
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
                  </div>

                  {/* Expanded Timeline View */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-primary" />
                          Activity Timeline
                        </h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={() => setSelectedCompetitor(null)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Collapse
                        </Button>
                      </div>
                      
                      {events.length > 0 ? (
                        <div className="relative ml-2">
                          {/* Timeline line */}
                          <div className="absolute left-[5px] top-1 bottom-1 w-0.5 bg-border" />
                          
                          <div className="space-y-3">
                            {events.map((event) => (
                              <div key={event.id} className="relative pl-6 flex items-start gap-3">
                                {/* Timeline dot */}
                                <div className={cn(
                                  "absolute left-0 top-1.5 h-3 w-3 rounded-full ring-2 ring-background",
                                  getEventColor(event.eventType)
                                )} />
                                
                                {/* Date */}
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap min-w-[60px]">
                                  {new Date(event.publishedAt).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric'
                                  })}
                                </span>
                                
                                {/* Event badge */}
                                <span className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap",
                                  getEventBadgeVariant(event.eventType)
                                )}>
                                  {getEventIcon(event.eventType)}
                                  {formatEventType(event.eventType)}
                                </span>
                                
                                {/* Summary */}
                                <p className="text-xs text-foreground leading-relaxed flex-1">
                                  {event.summary}
                                </p>
                                
                                {/* Confidence */}
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 whitespace-nowrap">
                                  {Math.round(event.confidence * 100)}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-sm text-muted-foreground">
                          No activities tracked yet
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          {filteredCompanies.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
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
