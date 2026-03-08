import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, List, Bookmark, Trash2, Users, Eye, Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

type SourceType = 'prospect' | 'inspect' | 'perspect';

interface SavedItem {
  id: string;
  source_type: SourceType;
  record_id: string;
  created_at: string;
}

function useSavedItems() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['saved-items-all', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('saved_items' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any[]) as SavedItem[];
    },
    enabled: !!user?.id,
  });
}

// Fetch lead+person details for prospect saved items
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

// Fetch company_events details for inspect saved items
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

// Fetch trends details for perspect saved items
function usePerspectDetails(recordIds: string[]) {
  return useQuery({
    queryKey: ['saved-perspect-details', recordIds],
    queryFn: async () => {
      if (recordIds.length === 0) return [];
      const { data, error } = await supabase
        .from('trends' as any)
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
        .from('saved_items' as any)
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

const SOURCE_LABELS: Record<SourceType, string> = {
  prospect: 'Prospects',
  inspect: 'Inspects',
  perspect: 'Perspects',
};

const SOURCE_ICONS: Record<SourceType, React.ElementType> = {
  prospect: Users,
  inspect: Eye,
  perspect: Activity,
};

export default function Lists() {
  const { data: savedItems = [], isLoading } = useSavedItems();
  const removeSaved = useRemoveSaved();
  const [activeTab, setActiveTab] = useState<string>('all');

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

  return (
    <DashboardLayout title="Lists" subtitle="Your saved records from across the platform">
      <div className="space-y-4 animate-fade-in">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="prospect">Prospects ({counts.prospect})</TabsTrigger>
            <TabsTrigger value="inspect">Inspects ({counts.inspect})</TabsTrigger>
            <TabsTrigger value="perspect">Perspects ({counts.perspect})</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <Bookmark className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No saved items</p>
            <p className="text-xs mt-1">Save records from Prospects, Inspects, or Perspects to see them here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map(item => {
              const detail = getDetail(item);
              const Icon = SOURCE_ICONS[item.source_type];
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                >
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
                    {SOURCE_LABELS[item.source_type]}
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
