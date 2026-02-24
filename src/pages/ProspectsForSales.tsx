import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Download, Mail, Phone, Linkedin, ChevronRight, Loader2,
  Users, X, ArrowUpDown, ArrowUp, ArrowDown
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

type SortKey = 'name' | 'company' | 'quality_score' | 'created_at';
type SortDir = 'asc' | 'desc' | null;

export default function ProspectsForSales() {
  const { user } = useAuth();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedLead, setSelectedLead] = useState<LeadWithPerson | null>(null);

  const { data: userTags = [], isLoading: tagsLoading } = useUserTags(user?.id);
  const { data: leadsData, isLoading: leadsLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useLeads(userTags);
  const isLoading = tagsLoading || leadsLoading;

  const leads = useMemo(() => leadsData?.pages.flatMap(p => p.leads) ?? [], [leadsData]);

  const filtered = useMemo(() => leads.filter(l => l.person), [leads]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortKey) {
        case 'name': aVal = a.person?.name ?? ''; bVal = b.person?.name ?? ''; break;
        case 'company': aVal = a.person?.company ?? ''; bVal = b.person?.company ?? ''; break;
        case 'quality_score': aVal = a.quality_score ?? -1; bVal = b.quality_score ?? -1; break;
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

  return (
    <DashboardLayout title="For Sales" subtitle="Sales-focused lead profiles">
      <div className="space-y-3 animate-fade-in">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
            )}
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Download className="h-3.5 w-3.5 mr-1" />Export
          </Button>
        </div>

        {/* Table */}
        <div className={`grid grid-cols-1 gap-3 ${selectedLead ? 'lg:grid-cols-[1fr_320px]' : ''}`}>
          <Card className="overflow-hidden border border-border">
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
                <p className="text-sm">No leads found</p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted/40">
                        <th className="w-10 px-3 py-2.5 border border-border text-left">
                          <Checkbox
                            checked={selectedIds.size === sorted.length && sorted.length > 0}
                            onCheckedChange={toggleAll}
                          />
                        </th>
                        <th className="min-w-[200px] px-3 py-2.5 border border-border text-left font-medium text-muted-foreground text-xs">
                          <SortHeader label="Name" sortField="name" />
                        </th>
                        <th className="min-w-[200px] px-3 py-2.5 border border-border text-left font-medium text-muted-foreground text-xs">
                          Email
                        </th>
                        <th className="min-w-[120px] px-3 py-2.5 border border-border text-left font-medium text-muted-foreground text-xs">
                          Phone
                        </th>
                        <th className="min-w-[160px] px-3 py-2.5 border border-border text-left font-medium text-muted-foreground text-xs">
                          <SortHeader label="Company" sortField="company" />
                        </th>
                        <th className="min-w-[120px] px-3 py-2.5 border border-border text-left font-medium text-muted-foreground text-xs">
                          Role
                        </th>
                        <th className="min-w-[130px] px-3 py-2.5 border border-border text-left font-medium text-muted-foreground text-xs">
                          <SortHeader label="Quality" sortField="quality_score" />
                        </th>
                        <th className="min-w-[60px] px-3 py-2.5 border border-border text-left font-medium text-muted-foreground text-xs">
                          Links
                        </th>
                        <th className="w-8 px-2 py-2.5 border border-border" />
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map(lead => {
                        const p = lead.person!;
                        const isSelected = selectedIds.has(lead.id);
                        return (
                          <tr
                            key={lead.id}
                            className={`cursor-pointer group transition-colors hover:bg-muted/30 ${isSelected ? 'bg-muted/50' : ''} ${selectedLead?.id === lead.id ? 'bg-accent' : ''}`}
                            onClick={() => setSelectedLead(lead)}
                          >
                            <td className="px-3 py-2 border border-border" onClick={e => e.stopPropagation()}>
                              <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(lead.id)} />
                            </td>
                            <td className="px-3 py-2 border border-border">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                  <span className="text-primary text-[10px] font-semibold">
                                    {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </span>
                                </div>
                                <span className="text-sm font-medium truncate">{p.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 border border-border">
                              {p.email ? (
                                <a href={`mailto:${p.email}`} onClick={e => e.stopPropagation()} className="text-xs text-primary hover:underline truncate block">{p.email}</a>
                              ) : <span className="text-xs text-muted-foreground">—</span>}
                            </td>
                            <td className="px-3 py-2 border border-border">
                              {p.phone ? (
                                <a href={`tel:${p.phone}`} onClick={e => e.stopPropagation()} className="text-xs text-muted-foreground hover:text-foreground">{p.phone}</a>
                              ) : <span className="text-xs text-muted-foreground">—</span>}
                            </td>
                            <td className="px-3 py-2 border border-border text-xs">{p.company || '—'}</td>
                            <td className="px-3 py-2 border border-border text-xs text-muted-foreground truncate">{p.role || '—'}</td>
                            <td className="px-3 py-2 border border-border">{qualityBar(lead.quality_score)}</td>
                            <td className="px-3 py-2 border border-border" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                {p.linkedin && (
                                  <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                                    <Linkedin className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="px-2 py-2 border border-border">
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
                    <div><span className="text-muted-foreground">Quality</span><div className="mt-0.5">{qualityBar(selectedLead.quality_score)}</div></div>
                    <div><span className="text-muted-foreground">Confidence</span><p className="mt-0.5">{selectedLead.person.confidence ?? '—'}%</p></div>
                  </div>
                </div>
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
