import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Mail, Phone, ExternalLink, ChevronRight, Loader2, Users, X } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

type Person = Tables<'people'>;
type Lead = Tables<'leads'>;

interface LeadWithPerson extends Lead {
  person: Person | null;
}

const LEADS_PAGE_SIZE = 50;

// Fetch user's assigned tags
function useUserTags(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-tags', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_tags')
        .select('tag')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data.map(t => t.tag);
    },
    enabled: !!userId,
  });
}

// Cursor-based infinite leads fetch
function useLeadsForUser(userTags: string[]) {
  return useInfiniteQuery({
    queryKey: ['leads-for-user', userTags],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      let query = supabase
        .from('leads')
        .select(`*, person:people(*)`)
        .order('created_at', { ascending: false })
        .limit(LEADS_PAGE_SIZE);
      
      if (pageParam) {
        query = query.lt('created_at', pageParam);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const leads = (data as LeadWithPerson[]).filter(lead =>
        lead.person?.tags?.some(tag => userTags.includes(tag))
      );
      
      const nextCursor = data.length === LEADS_PAGE_SIZE
        ? data[data.length - 1].created_at
        : null;
      
      return { leads, nextCursor };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: userTags.length > 0,
  });
}

export default function PeopleIntelligence() {
  const { user } = useAuth();
  
  const [selectedLead, setSelectedLead] = useState<LeadWithPerson | null>(null);
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: userTags = [], isLoading: tagsLoading } = useUserTags(user?.id);
  const { data: leadsData, isLoading: leadsLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useLeadsForUser(userTags);
  const isLoading = tagsLoading || leadsLoading;

  const leads = useMemo(() => {
    if (!leadsData) return [];
    return leadsData.pages.flatMap(page => page.leads);
  }, [leadsData]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    leads.forEach(lead => {
      lead.person?.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (!lead.person) return false;
      
      const matchesTag = tagFilter === 'all' || 
        (lead.person.tags?.includes(tagFilter) ?? false);
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

      return matchesTag && matchesStatus;
    });
  }, [leads, tagFilter, statusFilter]);


  return (
    <DashboardLayout title="Prospects" subtitle="People tagged by admin for your review">
      <div className="space-y-4 animate-fade-in">
        {/* Main content */}
        <div className={`grid grid-cols-1 gap-4 transition-all duration-300 ${selectedLead ? 'lg:grid-cols-3' : ''}`}>
          {/* Table Card */}
          <div className={selectedLead ? 'lg:col-span-2' : ''}>
            <Card>
              {/* Toolbar inside card */}
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">
                   Prospects
                   <span className="ml-1.5 text-muted-foreground font-normal">({filteredLeads.length})</span>
                </h2>
                <div className="flex items-center gap-2">
                  <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue placeholder="Tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {allTags.map(tag => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <Download className="h-3.5 w-3.5 mr-1.5" />Export
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div>
                {isLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : userTags.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No tags assigned</p>
                    <p className="text-xs mt-1">Contact an admin to assign tags to view relevant prospects.</p>
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <p className="text-sm">
                      {tagFilter !== 'all' || statusFilter !== 'all'
                        ? 'No prospects match your filters' 
                        : 'No prospects match your assigned tags'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="pl-4">Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead>Quality</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right pr-4">Details</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLeads.map((lead) => {
                            const qualityScore = (lead as any).quality_score;
                            return (
                            <TableRow 
                              key={lead.id} 
                              className={`cursor-pointer transition-colors ${
                                selectedLead?.id === lead.id 
                                  ? 'bg-muted/60' 
                                  : 'hover:bg-muted/30'
                              }`} 
                              onClick={() => setSelectedLead(lead)}
                            >
                              <TableCell className="py-3 pl-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary-foreground text-xs font-medium">
                                      {lead.person?.name.split(' ').map(n => n[0]).join('') || '?'}
                                    </span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{lead.person?.name || 'Unknown'}</p>
                                    <p className="text-xs text-muted-foreground truncate">{lead.person?.role || 'No role'}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="space-y-0.5">
                                  <p className="text-sm truncate">{lead.person?.email || '-'}</p>
                                  {lead.person?.phone && (
                                    <p className="text-xs text-muted-foreground">{lead.person.phone}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-3 text-sm">{lead.person?.company || '—'}</TableCell>
                              <TableCell className="py-3">
                                <div className="flex flex-wrap gap-1">
                                  {lead.person?.tags?.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                                  ))}
                                  {(lead.person?.tags?.length || 0) > 2 && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                      +{(lead.person?.tags?.length || 0) - 2}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                {qualityScore != null ? (
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          qualityScore >= 80 ? 'bg-success' :
                                          qualityScore >= 50 ? 'bg-primary' : 'bg-warning'
                                        }`}
                                        style={{ width: `${qualityScore}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-medium">{qualityScore}%</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="py-3">
                                {lead.status === 'verified' ? (
                                  <Badge variant="success" className="text-xs">Verified</Badge>
                                ) : lead.status === 'pending' ? (
                                  <Badge variant="warning" className="text-xs">Pending</Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-xs">Rejected</Badge>
                                )}
                              </TableCell>
                              <TableCell className="py-3 text-right pr-4">
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )})}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-border">
                      {filteredLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className={`p-4 cursor-pointer transition-colors ${
                            selectedLead?.id === lead.id ? 'bg-muted/60' : 'hover:bg-muted/30'
                          }`}
                          onClick={() => setSelectedLead(lead)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <span className="text-primary-foreground text-xs font-medium">
                                  {lead.person?.name.split(' ').map(n => n[0]).join('') || '?'}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{lead.person?.name || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {lead.person?.role || 'No role'} {lead.person?.company ? `· ${lead.person.company}` : ''}
                                </p>
                              </div>
                            </div>
                            {lead.status === 'verified' ? (
                              <Badge variant="success" className="text-[10px] flex-shrink-0">Verified</Badge>
                            ) : lead.status === 'pending' ? (
                              <Badge variant="warning" className="text-[10px] flex-shrink-0">Pending</Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[10px] flex-shrink-0">Rejected</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Load More */}
                    {hasNextPage && (
                      <div className="flex justify-center py-4 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchNextPage()}
                          disabled={isFetchingNextPage}
                          className="text-xs"
                        >
                          {isFetchingNextPage ? (
                            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Loading...</>
                          ) : (
                            'Load More'
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Detail Panel */}
          {selectedLead?.person && (
            <div className="animate-fade-in">
              <Card className="sticky top-20">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-sm font-bold">
                        {selectedLead.person.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-semibold truncate">{selectedLead.person.name}</h3>
                        {selectedLead.status === 'verified' && (
                          <Badge variant="success" className="text-[10px] px-1 py-0 flex-shrink-0">Verified</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{selectedLead.person.role || 'No role'}</p>
                      <p className="text-xs text-muted-foreground truncate">{selectedLead.person.company || 'No company'}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 flex-shrink-0" 
                    onClick={(e) => { e.stopPropagation(); setSelectedLead(null); }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <CardContent className="p-4 space-y-4">
                  {/* Contact info */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Contact</p>
                    {selectedLead.person.email && (
                      <a href={`mailto:${selectedLead.person.email}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-xs transition-colors">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />{selectedLead.person.email}
                      </a>
                    )}
                    {selectedLead.person.phone && (
                      <a href={`tel:${selectedLead.person.phone}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-xs transition-colors">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />{selectedLead.person.phone}
                      </a>
                    )}
                    {selectedLead.person.linkedin && (
                      <a href={selectedLead.person.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-xs transition-colors">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />LinkedIn
                      </a>
                    )}
                  </div>

                  {/* Tags */}
                  {selectedLead.person.tags && selectedLead.person.tags.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedLead.person.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedLead.notes && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Notes</p>
                      <p className="text-sm leading-relaxed">{selectedLead.notes}</p>
                    </div>
                  )}

                  {/* Quality Score */}
                  {(selectedLead as any).quality_score != null && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-muted-foreground uppercase tracking-wider">Quality Score</span>
                        <span className="font-semibold">{(selectedLead as any).quality_score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            (selectedLead as any).quality_score >= 80 ? 'bg-success' : 
                            (selectedLead as any).quality_score >= 50 ? 'bg-primary' : 'bg-warning'
                          }`} 
                          style={{ width: `${(selectedLead as any).quality_score}%` }} 
                        />
                      </div>
                    </div>
                  )}

                  {/* Confidence */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-muted-foreground uppercase tracking-wider">Confidence</span>
                      <span className="font-semibold">{selectedLead.person.confidence || 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          (selectedLead.person.confidence || 0) >= 90 ? 'bg-success' : 
                          (selectedLead.person.confidence || 0) >= 70 ? 'bg-primary' : 'bg-warning'
                        }`} 
                        style={{ width: `${selectedLead.person.confidence || 0}%` }} 
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1 h-8 text-xs" disabled={!selectedLead.person.email}>
                      <Mail className="h-3.5 w-3.5 mr-1.5" />Contact
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                      <Download className="h-3.5 w-3.5 mr-1.5" />Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
