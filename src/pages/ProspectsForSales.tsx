import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Linkedin, Users, ArrowUpDown, ArrowUp, ArrowDown, Bookmark, Download
} from 'lucide-react';
import type { Tables as DBTables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useSavedItemIds, useToggleSave } from '@/hooks/useSavedItems';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { exportToCsv } from '@/lib/csv-export';
import { toast } from 'sonner';

type Person = DBTables<'people'>;
type Lead = DBTables<'leads'>;
interface LeadWithPerson extends Lead { person: Person | null; }

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
      let query = (supabase.from('leads').select(`*, person:people(*)`) as any).eq('prospect_type', 'sales').order('created_at', { ascending: false }).limit(PAGE_SIZE);
      if (pageParam) query = query.lt('created_at', pageParam);
      const { data, error } = await query;
      if (error) throw error;
      const leads = (data as LeadWithPerson[]).filter(lead => lead.person?.tags?.some(tag => userTags.includes(tag)));
      const nextCursor = data.length === PAGE_SIZE ? data[data.length - 1].created_at : null;
      return { leads, nextCursor };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: userTags.length > 0,
  });
}

type SortKey = 'name' | 'company' | 'role' | 'quality_score';
type SortDir = 'asc' | 'desc' | null;

export default function ProspectsForSales() {
  const { user } = useAuth();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: userTags = [], isLoading: tagsLoading } = useUserTags(user?.id);
  const { data: leadsData, isLoading: leadsLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useLeads(userTags);
  const { data: savedIds = [] } = useSavedItemIds('prospect');
  const toggleSave = useToggleSave();
  const isLoading = tagsLoading || leadsLoading;

  const leads = useMemo(() => leadsData?.pages.flatMap(p => p.leads) ?? [], [leadsData]);
  const filtered = useMemo(() => leads.filter(l => l.person), [leads]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      let aVal: string | number, bVal: string | number;
      switch (sortKey) {
        case 'name': aVal = a.person?.name ?? ''; bVal = b.person?.name ?? ''; break;
        case 'company': aVal = a.person?.company ?? ''; bVal = b.person?.company ?? ''; break;
        case 'role': aVal = a.person?.role ?? ''; bVal = b.person?.role ?? ''; break;
        case 'quality_score': aVal = a.quality_score ?? -1; bVal = b.quality_score ?? -1; break;
      }
      if (aVal === bVal) return 0;
      return (aVal < bVal ? -1 : 1) * (sortDir === 'asc' ? 1 : -1);
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) { if (sortDir === 'asc') setSortDir('desc'); else { setSortKey(null); setSortDir(null); } }
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => { setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const toggleAll = () => { selectedIds.size === sorted.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(sorted.map(l => l.id))); };

  const handleExportCsv = () => {
    const items = sorted.filter(l => selectedIds.has(l.id));
    if (items.length === 0) { toast.info('Select rows to export'); return; }
    exportToCsv('prospects-sales-export', items.map(l => ({
      name: l.person?.name ?? '',
      company: l.person?.company ?? '',
      role: l.person?.role ?? '',
      email: l.person?.email ?? '',
      phone: l.person?.phone ?? '',
      quality_score: l.quality_score ?? '',
    })), [
      { key: 'name', label: 'Full Name' },
      { key: 'company', label: 'Company' },
      { key: 'role', label: 'Role' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'quality_score', label: 'Score' },
    ]);
    toast.success(`Exported ${items.length} rows`);
  };

  const SortIcon = ({ field }: { field: SortKey }) =>
    sortKey === field ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />;

  return (
    <DashboardLayout title="For Sales" subtitle="Sales-focused lead profiles" flush>
      {isLoading ? (
        <TableSkeleton columns={9} flush />
      ) : userTags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground animate-fade-in">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Users className="h-7 w-7 opacity-40" />
          </div>
          <p className="text-sm font-medium text-foreground">No tags assigned</p>
          <p className="text-xs mt-1 max-w-[260px]">Your admin needs to assign industry tags to your account before leads can be displayed.</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground animate-fade-in">
          <p className="text-sm font-medium text-foreground">No leads found</p>
          <p className="text-xs mt-1">No sales leads match your assigned tags yet.</p>
        </div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-57px)]">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border bg-muted/40 shrink-0 animate-fade-in">
              <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={handleExportCsv}>
                <Download className="h-3 w-3" />Export CSV
              </Button>
            </div>
          )}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-muted/60 backdrop-blur-sm">
                  <th className="w-10 px-3 py-2.5 border-b border-r border-border text-left">
                    <Checkbox checked={selectedIds.size === sorted.length && sorted.length > 0} onCheckedChange={toggleAll} />
                  </th>
                  <th className="w-10 px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">Save</th>
                  <th className="min-w-[200px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('name')}><span>Full Name</span><SortIcon field="name" /></button>
                  </th>
                  <th className="min-w-[160px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('company')}><span>Company</span><SortIcon field="company" /></button>
                  </th>
                  <th className="min-w-[140px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('role')}><span>Role</span><SortIcon field="role" /></button>
                  </th>
                  <th className="min-w-[200px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">Email</th>
                  <th className="min-w-[120px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">Phone</th>
                  <th className="w-[70px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('quality_score')}><span>Score</span><SortIcon field="quality_score" /></button>
                  </th>
                  <th className="w-[50px] px-3 py-2.5 border-b border-border text-left font-medium text-muted-foreground text-xs">Links</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(lead => {
                  const p = lead.person!;
                  const isSelected = selectedIds.has(lead.id);
                  const isSaved = savedIds.includes(lead.id);
                  return (
                    <tr key={lead.id} className={`group transition-colors hover:bg-muted/30 ${isSelected ? 'bg-muted/50' : ''}`}>
                      <td className="px-3 py-2 border-b border-r border-border">
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(lead.id)} />
                      </td>
                      <td className="px-3 py-2 border-b border-r border-border">
                        <button onClick={() => toggleSave.mutate({ recordId: lead.id, sourceType: 'prospect', isSaved })} className="hover:text-primary transition-colors">
                          <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                        </button>
                      </td>
                      <td className="px-3 py-2 border-b border-r border-border">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary text-[10px] font-semibold">{p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                          </div>
                          <span className="text-sm font-medium truncate">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 border-b border-r border-border text-xs">{p.company || '—'}</td>
                      <td className="px-3 py-2 border-b border-r border-border text-xs text-muted-foreground">{p.role || '—'}</td>
                      <td className="px-3 py-2 border-b border-r border-border">
                        {p.email ? <a href={`mailto:${p.email}`} className="text-xs text-primary hover:underline truncate block">{p.email}</a> : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="px-3 py-2 border-b border-r border-border">
                        {p.phone ? <a href={`tel:${p.phone}`} className="text-xs text-muted-foreground hover:text-foreground">{p.phone}</a> : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="px-3 py-2 border-b border-r border-border text-center">
                        {lead.quality_score != null ? <span className="text-xs font-mono font-medium">{lead.quality_score}</span> : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="px-3 py-2 border-b border-border">
                        {p.linkedin && <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-3.5 w-3.5" /></a>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {hasNextPage && (
            <div className="flex justify-center py-2 border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="text-xs">
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-1.5 border-t border-border bg-muted/20 shrink-0">
            <span className="text-[11px] text-muted-foreground">{sorted.length} lead{sorted.length !== 1 ? 's' : ''}</span>
            {selectedIds.size > 0 && <span className="text-[11px] text-muted-foreground">{selectedIds.size} selected</span>}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
