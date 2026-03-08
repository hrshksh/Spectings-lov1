import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bookmark, Trash2, Users, Eye, Activity, Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { useAllSavedItems, useBulkRemoveSaved } from '@/hooks/useSavedItems';
import { exportToCsv } from '@/lib/csv-export';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type SourceType = 'prospect' | 'inspect' | 'perspect';

interface SavedItem {
  id: string;
  source_type: string;
  record_id: string;
  created_at: string;
}

function useProspectDetails(recordIds: string[]) {
  return useQuery({
    queryKey: ['saved-prospect-details', recordIds],
    queryFn: async () => {
      if (recordIds.length === 0) return [];
      const { data, error } = await supabase
        .from('leads')
        .select('id, prospect_type, quality_score, person:people(name, company, role, email)')
        .in('id', recordIds);
      if (error) throw error;
      return data as any[];
    },
    enabled: recordIds.length > 0,
  });
}

function useInspectDetails(recordIds: string[]) {
  return useQuery({
    queryKey: ['saved-inspect-details', recordIds],
    queryFn: async () => {
      if (recordIds.length === 0) return [];
      const { data, error } = await supabase
        .from('company_events')
        .select('id, event_type, summary, created_at, company:companies(name)')
        .in('id', recordIds);
      if (error) throw error;
      return data as any[];
    },
    enabled: recordIds.length > 0,
  });
}

function usePerspectDetails(recordIds: string[]) {
  return useQuery({
    queryKey: ['saved-perspect-details', recordIds],
    queryFn: async () => {
      if (recordIds.length === 0) return [];
      const { data, error } = await supabase
        .from('trends')
        .select('id, trend, summary, trend_date')
        .in('id', recordIds);
      if (error) throw error;
      return data as any[];
    },
    enabled: recordIds.length > 0,
  });
}

function useRemoveSaved() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ recordId, sourceType }: { recordId: string; sourceType: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('saved_items')
        .delete()
        .eq('user_id', user.id)
        .eq('record_id', recordId)
        .eq('source_type', sourceType);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-items-all'] });
      queryClient.invalidateQueries({ queryKey: ['saved-items'] });
      toast.success('Removed from list');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

const SOURCE_LABELS: Record<string, string> = {
  prospect: 'Prospects',
  inspect: 'Inspects',
  perspect: 'Perspects',
};

const SOURCE_ICONS: Record<string, React.ElementType> = {
  prospect: Users,
  inspect: Eye,
  perspect: Activity,
};

export default function Lists() {
  const { data: savedItems = [], isLoading } = useAllSavedItems();
  const removeSaved = useRemoveSaved();
  const bulkRemove = useBulkRemoveSaved();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const prospectIds = useMemo(() => savedItems.filter(s => s.source_type === 'prospect').map(s => s.record_id), [savedItems]);
  const inspectIds = useMemo(() => savedItems.filter(s => s.source_type === 'inspect').map(s => s.record_id), [savedItems]);
  const perspectIds = useMemo(() => savedItems.filter(s => s.source_type === 'perspect').map(s => s.record_id), [savedItems]);

  const { data: prospectDetails = [] } = useProspectDetails(prospectIds);
  const { data: inspectDetails = [] } = useInspectDetails(inspectIds);
  const { data: perspectDetails = [] } = usePerspectDetails(perspectIds);

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return savedItems;
    return savedItems.filter(s => s.source_type === activeTab);
  }, [savedItems, activeTab]);

  const getDetail = (item: SavedItem) => {
    if (item.source_type === 'prospect') {
      const d = prospectDetails.find((p: any) => p.id === item.record_id);
      if (!d) return { title: 'Loading...', subtitle: '' };
      return {
        title: d.person?.name || 'Unknown',
        subtitle: [d.person?.company, d.person?.role].filter(Boolean).join(' · '),
      };
    }
    if (item.source_type === 'inspect') {
      const d = inspectDetails.find((e: any) => e.id === item.record_id);
      if (!d) return { title: 'Loading...', subtitle: '' };
      return {
        title: d.company?.name || 'Unknown',
        subtitle: d.summary || d.event_type,
      };
    }
    if (item.source_type === 'perspect') {
      const d = perspectDetails.find((t: any) => t.id === item.record_id);
      if (!d) return { title: 'Loading...', subtitle: '' };
      return {
        title: d.trend || 'Unknown',
        subtitle: d.summary || '',
      };
    }
    return { title: '—', subtitle: '' };
  };

  const counts = {
    all: savedItems.length,
    prospect: prospectIds.length,
    inspect: inspectIds.length,
    perspect: perspectIds.length,
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    selectedIds.size === filteredItems.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(filteredItems.map(i => i.record_id)));
  };

  const handleBulkRemove = () => {
    const ids = Array.from(selectedIds);
    bulkRemove.mutate(ids, { onSuccess: () => setSelectedIds(new Set()) });
  };

  const handleExportCsv = () => {
    const selected = filteredItems.filter(i => selectedIds.has(i.record_id));
    if (selected.length === 0) { toast.info('Select items to export'); return; }
    exportToCsv('saved-items-export', selected.map(item => {
      const detail = getDetail(item);
      return {
        type: SOURCE_LABELS[item.source_type] || item.source_type,
        title: detail.title,
        subtitle: detail.subtitle,
        saved_at: format(new Date(item.created_at), 'yyyy-MM-dd'),
      };
    }), [
      { key: 'type', label: 'Type' },
      { key: 'title', label: 'Title' },
      { key: 'subtitle', label: 'Details' },
      { key: 'saved_at', label: 'Saved At' },
    ]);
    toast.success(`Exported ${selected.length} items`);
  };

  return (
    <DashboardLayout title="Lists" subtitle="Your saved records from across the platform">
      <div className="space-y-4 animate-fade-in">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Saved', count: counts.all, icon: Bookmark },
            { label: 'Prospects', count: counts.prospect, icon: Users },
            { label: 'Inspects', count: counts.inspect, icon: Eye },
            { label: 'Perspects', count: counts.perspect, icon: Activity },
          ].map(s => (
            <div key={s.label} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <span className="text-lg font-semibold">{s.count}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setSelectedIds(new Set()); }}>
            <TabsList>
              <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="prospect">Prospects ({counts.prospect})</TabsTrigger>
              <TabsTrigger value="inspect">Inspects ({counts.inspect})</TabsTrigger>
              <TabsTrigger value="perspect">Perspects ({counts.perspect})</TabsTrigger>
            </TabsList>
          </Tabs>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={handleExportCsv}>
                <Download className="h-3 w-3" />Export
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={handleBulkRemove} disabled={bulkRemove.isPending}>
                <Trash2 className="h-3 w-3" />Remove
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground animate-fade-in">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Bookmark className="h-7 w-7 opacity-40" />
            </div>
            <p className="text-sm font-medium text-foreground">No saved items</p>
            <p className="text-xs mt-1 max-w-[280px]">
              Bookmark records from Prospects, Inspects, or Perspects using the <Bookmark className="inline h-3 w-3" /> icon to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* Select all */}
            <div className="flex items-center gap-2 px-1">
              <Checkbox
                checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
                onCheckedChange={toggleAll}
              />
              <span className="text-xs text-muted-foreground">Select all</span>
            </div>
            {filteredItems.map(item => {
              const detail = getDetail(item);
              const Icon = SOURCE_ICONS[item.source_type] || Bookmark;
              const isSelected = selectedIds.has(item.record_id);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors ${isSelected ? 'bg-muted/50 border-primary/20' : ''}`}
                >
                  <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(item.record_id)} />
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{detail.title}</p>
                    {detail.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{detail.subtitle}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {SOURCE_LABELS[item.source_type] || item.source_type}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {format(new Date(item.created_at), 'MMM dd')}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeSaved.mutate({ recordId: item.record_id, sourceType: item.source_type })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
