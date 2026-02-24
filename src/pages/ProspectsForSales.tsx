import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Download, Mail, Phone, Linkedin, ExternalLink, ChevronRight, Loader2,
  Users, X, Search, ArrowUpDown, ArrowUp, ArrowDown, Globe
} from 'lucide-react';
import type { Tables as DBTables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

type Person = DBTables<'people'>;
type Lead = DBTables<'leads'>;

interface LeadWithPerson extends Lead {
  person: Person | null;
}

const PAGE_SIZE = 50;

function useUserTags(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-tags', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase.from('user_tags').select('tag').eq('user_id', userId);
      if (error) throw error;
      return data.map(t => t.tag);
    },
    enabled: !!userId,
  });
}

function useLeads(userTags: string[]) {
  return useInfiniteQuery({
    queryKey: ['leads-for-sales', userTags],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      let query = supabase
        .from('leads')
        .select(`*, person:people(*)`)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);
      if (pageParam) query = query.lt('created_at', pageParam);
      const { data, error } = await query;
      if (error) throw error;
      const leads = (data as LeadWithPerson[]).filter(lead =>
        lead.person?.tags?.some(tag => userTags.includes(tag))
      );
      const nextCursor = data.length === PAGE_SIZE ? data[data.length - 1].created_at : null;
      return { leads, nextCursor };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: userTags.length > 0,
  });
}

type SortKey = 'name' | 'company' | 'quality_score' | 'status' | 'created_at';
type SortDir = 'asc' | 'desc' | null;

export default function ProspectsForSales() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedLead, setSelectedLead] = useState<LeadWithPerson | null>(null);

  const { data: userTags = [], isLoading: tagsLoading } = useUserTags(user?.id);
  const { data: leadsData, isLoading: leadsLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useLeads(userTags);
  const isLoading = tagsLoading || leadsLoading;

  const leads = useMemo(() => leadsData?.pages.flatMap(p => p.leads) ?? [], [leadsData]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    leads.forEach(l => l.person?.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [leads]);

  const filtered = useMemo(() => {
    let result = leads.filter(l => l.person);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.person!.name.toLowerCase().includes(q) ||
        l.person!.email?.toLowerCase().includes(q) ||
        l.person!.company?.toLowerCase().includes(q) ||
        l.person!.role?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter(l => l.status === statusFilter);
    if (tagFilter !== 'all') result = result.filter(l => l.person!.tags?.includes(tagFilter));
    return result;
  }, [leads, search, statusFilter, tagFilter]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortKey) {
        case 'name': aVal = a.person?.name ?? ''; bVal = b.person?.name ?? ''; break;
        case 'company': aVal = a.person?.company ?? ''; bVal = b.person?.company ?? ''; break;
        case 'quality_score': aVal = a.quality_score ?? -1; bVal = b.quality_score ?? -1; break;
        case 'status': aVal = a.status; bVal = b.status; break;
        case 'created_at': aVal = a.created_at; bVal = b.created_at; break;
      }
      if (aVal === bVal) return 0;
      const cmp = aVal < bVal ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortKey(null); setSortDir(null); }
    } else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selectedIds.size === sorted.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(sorted.map(l => l.id)));
  };

  const SortHeader = ({ label, sortField }: { label: string; sortField: SortKey }) => (
    <button
      className="flex items-center gap-1 hover:text-foreground transition-colors text-left"
      onClick={() => handleSort(sortField)}
    >
      <span>{label}</span>
      {sortKey === sortField ? (
        sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );

  const qualityBar = (score: number | null) => {
    if (score == null) return <span className="text-xs text-muted-foreground">—</span>;
    return (
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-primary' : 'bg-amber-500'}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-xs font-mono font-medium w-7 text-right">{score}</span>
      </div>
    );
  };

  const statusBadge = (status: string) => {
    if (status === 'verified') return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/25 text-[10px] px-1.5 py-0 font-medium">Verified</Badge>;
    if (status === 'pending') return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/25 text-[10px] px-1.5 py-0 font-medium">Pending</Badge>;
    return <Badge className="bg-destructive/15 text-destructive border-destructive/25 text-[10px] px-1.5 py-0 font-medium">Rejected</Badge>;
  };

  return (
    <DashboardLayout title="For Sales" subtitle="Sales-focused lead profiles">
      <div className="space-y-3 animate-fade-in">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Tag" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {selectedIds.size > 0 && (
              <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
            )}
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Download className="h-3.5 w-3.5 mr-1" />Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className={`grid grid-cols-1 gap-3 ${selectedLead ? 'lg:grid-cols-[1fr_320px]' : ''}`}>
          <Card className="overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : userTags.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No tags assigned</p>
                <p className="text-xs mt-1">Contact admin to assign tags.</p>
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-sm">No leads match your filters</p>
              </div>
            ) : (
              <>
                {/* Desktop spreadsheet table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent bg-muted/30">
                        <TableHead className="w-10 pl-3">
                          <Checkbox
                            checked={selectedIds.size === sorted.length && sorted.length > 0}
                            onCheckedChange={toggleAll}
                          />
                        </TableHead>
                        <TableHead className="min-w-[200px]"><SortHeader label="Name" sortField="name" /></TableHead>
                        <TableHead className="min-w-[180px]">Email</TableHead>
                        <TableHead className="min-w-[100px]">Phone</TableHead>
                        <TableHead className="min-w-[140px]"><SortHeader label="Company" sortField="company" /></TableHead>
                        <TableHead className="min-w-[80px]">Role</TableHead>
                        <TableHead className="min-w-[120px]">Tags</TableHead>
                        <TableHead className="min-w-[120px]"><SortHeader label="Quality" sortField="quality_score" /></TableHead>
                        <TableHead className="min-w-[80px]"><SortHeader label="Status" sortField="status" /></TableHead>
                        <TableHead className="min-w-[80px]">Source</TableHead>
                        <TableHead className="min-w-[50px]">Links</TableHead>
                        <TableHead className="w-8 pr-3" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sorted.map(lead => {
                        const p = lead.person!;
                        const isSelected = selectedIds.has(lead.id);
                        return (
                          <TableRow
                            key={lead.id}
                            data-state={isSelected ? 'selected' : undefined}
                            className={`cursor-pointer group ${selectedLead?.id === lead.id ? 'bg-accent' : ''}`}
                            onClick={() => setSelectedLead(lead)}
                          >
                            <TableCell className="pl-3 py-2" onClick={e => e.stopPropagation()}>
                              <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(lead.id)} />
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                  <span className="text-primary text-[10px] font-semibold">
                                    {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </span>
                                </div>
                                <span className="text-sm font-medium truncate">{p.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-2">
                              {p.email ? (
                                <a href={`mailto:${p.email}`} onClick={e => e.stopPropagation()} className="text-xs text-primary hover:underline truncate block">{p.email}</a>
                              ) : <span className="text-xs text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className="py-2">
                              {p.phone ? (
                                <a href={`tel:${p.phone}`} onClick={e => e.stopPropagation()} className="text-xs text-muted-foreground hover:text-foreground">{p.phone}</a>
                              ) : <span className="text-xs text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className="py-2 text-xs">{p.company || '—'}</TableCell>
                            <TableCell className="py-2 text-xs text-muted-foreground truncate">{p.role || '—'}</TableCell>
                            <TableCell className="py-2">
                              <div className="flex flex-wrap gap-0.5">
                                {p.tags?.slice(0, 2).map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-[9px] px-1 py-0 font-normal">{tag}</Badge>
                                ))}
                                {(p.tags?.length || 0) > 2 && (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0">+{(p.tags?.length || 0) - 2}</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-2">{qualityBar(lead.quality_score)}</TableCell>
                            <TableCell className="py-2">{statusBadge(lead.status)}</TableCell>
                            <TableCell className="py-2 text-xs text-muted-foreground">{lead.source || '—'}</TableCell>
                            <TableCell className="py-2" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                {p.linkedin && (
                                  <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                                    <Linkedin className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-2 pr-3">
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-border">
                  {sorted.map(lead => {
                    const p = lead.person!;
                    return (
                      <div key={lead.id} className="p-3 cursor-pointer hover:bg-muted/30" onClick={() => setSelectedLead(lead)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary text-[10px] font-semibold">{p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{p.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{p.role} {p.company ? `· ${p.company}` : ''}</p>
                            </div>
                          </div>
                          {statusBadge(lead.status)}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex gap-1">{p.tags?.slice(0, 3).map(t => <Badge key={t} variant="secondary" className="text-[9px] px-1 py-0">{t}</Badge>)}</div>
                          {qualityBar(lead.quality_score)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {hasNextPage && (
                  <div className="flex justify-center py-3 border-t border-border">
                    <Button variant="ghost" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="text-xs">
                      {isFetchingNextPage ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Loading...</> : 'Load More'}
                    </Button>
                  </div>
                )}

                {/* Footer stats */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/20">
                  <span className="text-[11px] text-muted-foreground">{sorted.length} lead{sorted.length !== 1 ? 's' : ''}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {sorted.filter(l => l.status === 'verified').length} verified
                  </span>
                </div>
              </>
            )}
          </Card>

          {/* Detail panel */}
          {selectedLead?.person && (
            <Card className="sticky top-20 animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                <h3 className="text-sm font-semibold truncate">{selectedLead.person.name}</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedLead(null)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="p-4 space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-primary text-base font-bold">
                      {selectedLead.person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{selectedLead.person.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedLead.person.role || 'No role'}</p>
                    <p className="text-xs text-muted-foreground">{selectedLead.person.company || 'No company'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</h4>
                  {selectedLead.person.email && (
                    <a href={`mailto:${selectedLead.person.email}`} className="flex items-center gap-2 text-xs text-primary hover:underline">
                      <Mail className="h-3 w-3" />{selectedLead.person.email}
                    </a>
                  )}
                  {selectedLead.person.phone && (
                    <a href={`tel:${selectedLead.person.phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                      <Phone className="h-3 w-3" />{selectedLead.person.phone}
                    </a>
                  )}
                  {selectedLead.person.linkedin && (
                    <a href={selectedLead.person.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                      <Linkedin className="h-3 w-3" />LinkedIn Profile
                    </a>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Status</span><div className="mt-0.5">{statusBadge(selectedLead.status)}</div></div>
                    <div><span className="text-muted-foreground">Quality</span><div className="mt-0.5">{qualityBar(selectedLead.quality_score)}</div></div>
                    <div><span className="text-muted-foreground">Source</span><p className="mt-0.5">{selectedLead.source || '—'}</p></div>
                    <div><span className="text-muted-foreground">Confidence</span><p className="mt-0.5">{selectedLead.person.confidence ?? '—'}%</p></div>
                  </div>
                </div>
                {selectedLead.person.tags && selectedLead.person.tags.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedLead.person.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                    </div>
                  </div>
                )}
                {selectedLead.notes && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</h4>
                    <p className="text-xs text-muted-foreground">{selectedLead.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
