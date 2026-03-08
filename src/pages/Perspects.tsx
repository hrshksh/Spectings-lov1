import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Activity, ArrowUpDown, ArrowUp, ArrowDown, Bookmark, Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useSavedItemIds, useToggleSave } from '@/hooks/useSavedItems';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { exportToCsv } from '@/lib/csv-export';
import { toast } from 'sonner';

const PAGE_SIZE = 50;

type SortKey = 'date' | 'trend';
type SortDir = 'asc' | 'desc' | null;

function useTrends() {
  return useInfiniteQuery({
    queryKey: ['perspects-trends'],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      let query = supabase
        .from('trends')
        .select('*')
        .order('trend_date', { ascending: false })
        .limit(PAGE_SIZE);
      if (pageParam) query = query.lt('trend_date', pageParam);
      const { data, error } = await query;
      if (error) throw error;
      const nextCursor = data.length === PAGE_SIZE ? data[data.length - 1].trend_date : null;
      return { items: data, nextCursor };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export default function Perspects() {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useTrends();
  const { data: savedIds = [] } = useSavedItemIds('perspect');
  const toggleSave = useToggleSave();

  const items = useMemo(() => data?.pages.flatMap(p => p.items) ?? [], [data]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return items;
    return [...items].sort((a, b) => {
      const aVal = sortKey === 'date' ? a.trend_date : (a.trend ?? '');
      const bVal = sortKey === 'date' ? b.trend_date : (b.trend ?? '');
      if (aVal === bVal) return 0;
      return (aVal < bVal ? -1 : 1) * (sortDir === 'asc' ? 1 : -1);
    });
  }, [items, sortKey, sortDir]);

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
    const selected = sorted.filter(e => selectedIds.has(e.id));
    if (selected.length === 0) { toast.info('Select rows to export'); return; }
    exportToCsv('perspects-export', selected.map(t => ({
      date: t.trend_date,
      trend: t.trend,
      summary: t.summary ?? '',
    })), [
      { key: 'date', label: 'Date' },
      { key: 'trend', label: 'Trend' },
      { key: 'summary', label: 'Summary' },
    ]);
    toast.success(`Exported ${selected.length} rows`);
  };

  const SortIcon = ({ field }: { field: SortKey }) =>
    sortKey === field ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />;

  return (
    <DashboardLayout title="Perspects" subtitle="Market trends and insights" flush>
      {isLoading ? (
        <TableSkeleton columns={5} flush />
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground animate-fade-in">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Activity className="h-7 w-7 opacity-40" />
          </div>
          <p className="text-sm font-medium text-foreground">No trends yet</p>
          <p className="text-xs mt-1 max-w-[260px]">Market trends will appear here once your admin publishes them through the management panel.</p>
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
                  <th className="min-w-[120px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('date')}>
                      <span>Date</span><SortIcon field="date" />
                    </button>
                  </th>
                  <th className="min-w-[200px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('trend')}>
                      <span>Trend</span><SortIcon field="trend" />
                    </button>
                  </th>
                  <th className="min-w-[400px] px-3 py-2.5 border-b border-border text-left font-medium text-muted-foreground text-xs">Summary</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(item => {
                  const isSelected = selectedIds.has(item.id);
                  const isSaved = savedIds.includes(item.id);
                  return (
                    <tr key={item.id} className={`group transition-colors hover:bg-muted/30 ${isSelected ? 'bg-muted/50' : ''}`}>
                      <td className="px-3 py-2 border-b border-r border-border">
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(item.id)} />
                      </td>
                      <td className="px-3 py-2 border-b border-r border-border">
                        <button
                          onClick={() => toggleSave.mutate({ recordId: item.id, sourceType: 'perspect', isSaved })}
                          className="hover:text-primary transition-colors"
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                        </button>
                      </td>
                      <td className="px-3 py-2 border-b border-r border-border text-xs text-muted-foreground">
                        {format(new Date(item.trend_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-3 py-2 border-b border-r border-border">
                        <span className="text-sm font-medium">{item.trend}</span>
                      </td>
                      <td className="px-3 py-2 border-b border-border text-xs text-muted-foreground">
                        {item.summary || '—'}
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
            <span className="text-[11px] text-muted-foreground">{sorted.length} trend{sorted.length !== 1 ? 's' : ''}</span>
            {selectedIds.size > 0 && <span className="text-[11px] text-muted-foreground">{selectedIds.size} selected</span>}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
