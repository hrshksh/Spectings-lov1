import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Eye, ArrowUpDown, ArrowUp, ArrowDown, Bookmark, Download, Plus
} from 'lucide-react';
import { AddCompanyDialog } from '@/components/inspects/AddCompanyDialog';
import { supabase } from '@/integrations/supabase/client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useSavedItemIds, useToggleSave } from '@/hooks/useSavedItems';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { exportToCsv } from '@/lib/csv-export';
import { toast } from 'sonner';

const PAGE_SIZE = 50;

const EVENT_TYPE_LABELS: Record<string, string> = {
  pricing_change: 'Pricing Change',
  product_launch: 'Product Launch',
  hiring: 'Hiring',
  campaign: 'Campaign',
  news: 'News',
  review: 'Review',
  funding: 'Funding',
  acquisition: 'Acquisition',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  pricing_change: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  product_launch: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  hiring: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  campaign: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  news: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
  review: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
  funding: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  acquisition: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
};

type SortKey = 'date' | 'company' | 'type';
type SortDir = 'asc' | 'desc' | null;

function useCompanyEvents() {
  return useInfiniteQuery({
    queryKey: ['inspects-events'],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      let query = supabase
        .from('company_events')
        .select('*, company:companies(name)')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);
      if (pageParam) query = query.lt('created_at', pageParam);
      const { data, error } = await query;
      if (error) throw error;
      const nextCursor = data.length === PAGE_SIZE ? data[data.length - 1].created_at : null;
      return { events: data, nextCursor };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export default function CompanyIntelligence() {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useCompanyEvents();
  const { data: savedIds = [] } = useSavedItemIds('inspect');
  const toggleSave = useToggleSave();

  const events = useMemo(() => data?.pages.flatMap(p => p.events) ?? [], [data]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return events;
    return [...events].sort((a, b) => {
      let aVal: string, bVal: string;
      switch (sortKey) {
        case 'date': aVal = a.created_at; bVal = b.created_at; break;
        case 'company': aVal = (a.company as { name: string } | null)?.name ?? ''; bVal = (b.company as { name: string } | null)?.name ?? ''; break;
        case 'type': aVal = a.event_type; bVal = b.event_type; break;
      }
      if (aVal === bVal) return 0;
      return (aVal < bVal ? -1 : 1) * (sortDir === 'asc' ? 1 : -1);
    });
  }, [events, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortKey(null); setSortDir(null); }
    } else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    selectedIds.size === sorted.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(sorted.map(e => e.id)));
  };

  const handleExportCsv = () => {
    const items = sorted.filter(e => selectedIds.has(e.id));
    if (items.length === 0) { toast.info('Select rows to export'); return; }
    exportToCsv('inspects-export', items.map(e => ({
      date: format(new Date(e.created_at), 'yyyy-MM-dd'),
      company: (e.company as { name: string } | null)?.name ?? '',
      type: EVENT_TYPE_LABELS[e.event_type] || e.event_type,
      summary: e.summary ?? '',
    })), [
      { key: 'date', label: 'Date' },
      { key: 'company', label: 'Company' },
      { key: 'type', label: 'Type' },
      { key: 'summary', label: 'Summary' },
    ]);
    toast.success(`Exported ${items.length} rows`);
  };

  const handleBulkSave = () => {
    const unsaved = Array.from(selectedIds).filter(id => !savedIds.includes(id));
    if (unsaved.length === 0) { toast.info('All selected items are already saved'); return; }
    unsaved.forEach(id => toggleSave.mutate({ recordId: id, sourceType: 'inspect', isSaved: false }));
    toast.success(`Saving ${unsaved.length} items to list`);
  };

  const SortIcon = ({ field }: { field: SortKey }) =>
    sortKey === field ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />;

  return (
    <DashboardLayout title="Inspects" subtitle="Company activity intelligence" flush>
      <AddCompanyDialog open={addCompanyOpen} onOpenChange={setAddCompanyOpen} />
      {isLoading ? (
        <TableSkeleton columns={5} flush />
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground animate-fade-in">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Eye className="h-7 w-7 opacity-40" />
          </div>
          <p className="text-sm font-medium text-foreground">No activity data yet</p>
          <p className="text-xs mt-1 max-w-[260px] mb-4">Add companies to track and activity will appear here.</p>
          <Button size="sm" className="gap-1" onClick={() => setAddCompanyOpen(true)}><Plus className="h-4 w-4" />Add Company</Button>
        </div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-57px)]">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border bg-muted/40 shrink-0 animate-fade-in">
              <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={handleBulkSave}>
                <Bookmark className="h-3 w-3" />Save to List
              </Button>
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
                  <th className="min-w-[120px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('date')}>
                      <span>Date</span><SortIcon field="date" />
                    </button>
                  </th>
                  <th className="min-w-[180px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('company')}>
                      <span>Company</span><SortIcon field="company" />
                    </button>
                  </th>
                  <th className="min-w-[130px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('type')}>
                      <span>Type</span><SortIcon field="type" />
                    </button>
                  </th>
                  <th className="min-w-[300px] px-3 py-2.5 border-b border-border text-left font-medium text-muted-foreground text-xs">Activity</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(event => {
                  const isSelected = selectedIds.has(event.id);
                  const companyName = (event.company as { name: string } | null)?.name ?? '—';
                  return (
                    <tr key={event.id} className={`group transition-colors hover:bg-muted/30 ${isSelected ? 'bg-muted/50' : ''}`}>
                      <td className="px-3 py-2 border-b border-r border-border">
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(event.id)} />
                      </td>
                      <td className="px-3 py-2 border-b border-r border-border text-xs text-muted-foreground">
                        {format(new Date(event.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-3 py-2 border-b border-r border-border">
                        <span className="text-sm font-medium">{companyName}</span>
                      </td>
                      <td className="px-3 py-2 border-b border-r border-border">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${EVENT_TYPE_COLORS[event.event_type] || ''}`}>
                          {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                        </span>
                      </td>
                      <td className="px-3 py-2 border-b border-border text-xs text-muted-foreground">
                        {event.summary || '—'}
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
            <span className="text-[11px] text-muted-foreground">{sorted.length} event{sorted.length !== 1 ? 's' : ''}</span>
            {selectedIds.size > 0 && <span className="text-[11px] text-muted-foreground">{selectedIds.size} selected</span>}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}