import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Loader2, Activity, ArrowUpDown, ArrowUp, ArrowDown, Bookmark
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const PAGE_SIZE = 50;

type SortKey = 'date' | 'trend';
type SortDir = 'asc' | 'desc' | null;

function useTrends() {
  return useInfiniteQuery({
    queryKey: ['perspects-trends'],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      let query = supabase
        .from('trends' as any)
        .select('*')
        .order('trend_date', { ascending: false })
        .limit(PAGE_SIZE);
      if (pageParam) query = query.lt('trend_date', pageParam);
      const { data, error } = await query;
      if (error) throw error;
      const items = data as any[];
      const nextCursor = items.length === PAGE_SIZE ? items[items.length - 1].trend_date : null;
      return { items, nextCursor };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

function useSavedItems(sourceType: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['saved-items', sourceType, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('saved_items' as any)
        .select('record_id')
        .eq('user_id', user.id)
        .eq('source_type', sourceType);
      if (error) throw error;
      return (data as any[]).map((d: any) => d.record_id as string);
    },
    enabled: !!user?.id,
  });
}

function useToggleSave() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ recordId, sourceType, isSaved }: { recordId: string; sourceType: string; isSaved: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (isSaved) {
        await supabase.from('saved_items' as any).delete().eq('user_id', user.id).eq('record_id', recordId).eq('source_type', sourceType);
      } else {
        const { error } = await supabase.from('saved_items' as any).insert([{ user_id: user.id, record_id: recordId, source_type: sourceType }] as any);
        if (error) throw error;
      }
    },
    onSuccess: (_, { sourceType }) => {
      queryClient.invalidateQueries({ queryKey: ['saved-items', sourceType] });
      queryClient.invalidateQueries({ queryKey: ['saved-items-all'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export default function Perspects() {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useTrends();
  const { data: savedIds = [] } = useSavedItems('perspect');
  const toggleSave = useToggleSave();

  const items = useMemo(() => data?.pages.flatMap(p => p.items) ?? [], [data]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return items;
    return [...items].sort((a: any, b: any) => {
      let aVal: any, bVal: any;
      switch (sortKey) {
        case 'date': aVal = a.trend_date; bVal = b.trend_date; break;
        case 'trend': aVal = a.trend ?? ''; bVal = b.trend ?? ''; break;
      }
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
    selectedIds.size === sorted.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(sorted.map((e: any) => e.id)));
  };

  const SortIcon = ({ field }: { field: SortKey }) =>
    sortKey === field ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />;

  return (
    <DashboardLayout title="Perspects" subtitle="Market trends and insights" flush>
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No trends yet</p>
          <p className="text-xs mt-1">Market trends will appear here once added by admin.</p>
        </div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-57px)]">
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
                {sorted.map((item: any) => {
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
                {isFetchingNextPage ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Loading...</> : 'Load More'}
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
