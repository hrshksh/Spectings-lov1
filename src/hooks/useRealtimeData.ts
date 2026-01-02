import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName = 'companies' | 'company_events' | 'leads' | 'people' | 'tasks' | 'raw_evidence';

export function useRealtimeTable<T extends Tables<TableName>>(
  tableName: TableName,
  initialFetch: boolean = true
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: fetchedData, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setData((fetchedData as T[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  useEffect(() => {
    if (initialFetch) {
      fetchData();
    }

    const channel = supabase
      .channel(`realtime-${tableName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.eventType === 'INSERT') {
            setData((prev) => [payload.new as T, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setData((prev) =>
              prev.map((item) =>
                (item as { id: string }).id === (payload.new as { id: string }).id
                  ? (payload.new as T)
                  : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setData((prev) =>
              prev.filter(
                (item) =>
                  (item as { id: string }).id !== (payload.old as { id: string }).id
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, initialFetch, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for dashboard stats that updates in realtime
export function useRealtimeStats() {
  const { data: leads, loading: leadsLoading } = useRealtimeTable<Tables<'leads'>>('leads');
  const { data: companies, loading: companiesLoading } = useRealtimeTable<Tables<'companies'>>('companies');
  const { data: companyEvents, loading: eventsLoading } = useRealtimeTable<Tables<'company_events'>>('company_events');
  const { data: people, loading: peopleLoading } = useRealtimeTable<Tables<'people'>>('people');
  const { data: tasks, loading: tasksLoading } = useRealtimeTable<Tables<'tasks'>>('tasks');
  const { data: evidence, loading: evidenceLoading } = useRealtimeTable<Tables<'raw_evidence'>>('raw_evidence');

  const loading = leadsLoading || companiesLoading || eventsLoading || peopleLoading || tasksLoading || evidenceLoading;

  // Calculate stats
  const stats = {
    newLeads: leads.filter(l => l.status === 'pending').length,
    verifiedLeads: leads.filter(l => l.status === 'verified').length,
    trackedCompanies: companies.filter(c => c.is_tracked).length,
    totalCompanies: companies.length,
    recentEvents: companyEvents.length,
    totalPeople: people.length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length,
    inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    pendingEvidence: evidence.filter(e => e.status === 'pending').length,
    publishedEvidence: evidence.filter(e => e.status === 'published').length,
  };

  return {
    stats,
    leads,
    companies,
    companyEvents,
    people,
    tasks,
    evidence,
    loading,
  };
}
