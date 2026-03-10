import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { personSchema, companySchema, companyEventSchema } from '@/lib/validations';

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';
type EvidenceStatus = 'pending' | 'parsed' | 'published' | 'rejected';

// Hook to subscribe to realtime updates for a table
function useRealtimeSubscription(tableName: string, queryKeys: string[][]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`admin-realtime-${tableName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        () => {
          // Invalidate all related queries when data changes
          queryKeys.forEach(key => {
            queryClient.invalidateQueries({ queryKey: key });
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, queryClient, queryKeys]);
}

export function useTasks() {
  useRealtimeSubscription('tasks', [['admin-tasks'], ['admin-stats']]);
  
  return useQuery({
    queryKey: ['admin-tasks'],
    queryFn: async () => {
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (error) throw error;
      
      // Fetch assigned user profiles separately
      const assignedUserIds = tasksData?.filter(t => t.assigned_to).map(t => t.assigned_to) || [];
      let profilesMap: Record<string, { full_name: string | null; email: string }> = {};
      
      if (assignedUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', assignedUserIds);
        
        profiles?.forEach(p => {
          profilesMap[p.id] = { full_name: p.full_name, email: p.email };
        });
      }
      
      return tasksData?.map(task => ({
        ...task,
        assigned_user: task.assigned_to ? profilesMap[task.assigned_to] : null,
      })) || [];
    },
  });
}

export function useEvidence() {
  useRealtimeSubscription('raw_evidence', [['admin-evidence'], ['admin-stats']]);
  
  return useQuery({
    queryKey: ['admin-evidence'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raw_evidence')
        .select('*')
        .order('ingested_at', { ascending: false })
        .limit(200);
      
      if (error) throw error;
      return data;
    },
  });
}

export function useLeads() {
  useRealtimeSubscription('leads', [['admin-leads']]);
  
  return useQuery({
    queryKey: ['admin-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          person:people(*)
        `)
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCompanies() {
  useRealtimeSubscription('companies', [['admin-companies']]);
  
  return useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCompanyEvents() {
  useRealtimeSubscription('company_events', [['admin-company-events']]);
  
  return useQuery({
    queryKey: ['admin-company-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_events')
        .select(`
          *,
          company:companies(name)
        `)
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (error) throw error;
      return data;
    },
  });
}

export function usePeople() {
  useRealtimeSubscription('people', [['admin-people']]);
  
  return useQuery({
    queryKey: ['admin-people'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminStats() {
  // Stats will be refreshed when underlying tables change via their hooks
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [tasksResult, evidenceResult, leadsResult, companiesResult] = await Promise.all([
        supabase.from('tasks').select('status', { count: 'exact' }),
        supabase.from('raw_evidence').select('status', { count: 'exact' }),
        supabase.from('leads').select('status', { count: 'exact' }),
        supabase.from('companies').select('is_tracked', { count: 'exact' }),
      ]);
      
      const tasks = tasksResult.data || [];
      const evidence = evidenceResult.data || [];
      const leads = leadsResult.data || [];
      const companies = companiesResult.data || [];
      
      return {
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
        completedToday: tasks.filter(t => t.status === 'completed').length,
        needsReview: evidence.filter(e => e.status === 'pending').length,
        totalLeads: leads.length,
        verifiedLeads: leads.filter(l => l.status === 'verified').length,
        pendingLeads: leads.filter(l => l.status === 'pending').length,
        totalCompanies: companies.length,
        trackedCompanies: companies.filter(c => c.is_tracked).length,
      };
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({ title: 'Task updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating task', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateEvidenceStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ evidenceId, status }: { evidenceId: string; status: EvidenceStatus }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'published') {
        updates.published_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('raw_evidence')
        .update(updates)
        .eq('id', evidenceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-evidence'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({ title: 'Evidence updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating evidence', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ leadId, status, userId }: { leadId: string; status: 'pending' | 'verified' | 'rejected'; userId?: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'verified' && userId) {
        updates.verified_by = userId;
        updates.verified_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({ title: 'Lead updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating lead', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCreateCompanyEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (event: {
      company_id: string;
      event_type: 'pricing_change' | 'product_launch' | 'hiring' | 'campaign' | 'news' | 'review' | 'funding' | 'acquisition';
      summary?: string;
      confidence?: number;
    }) => {
      const result = companyEventSchema.safeParse(event);
      if (!result.success) throw new Error(result.error.errors[0]?.message || 'Invalid event data');
      const { error } = await supabase
        .from('company_events')
        .insert([event]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-company-events'] });
      toast({ title: 'Event created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating event', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (person: {
      name: string;
      email?: string;
      role?: string;
      company?: string;
      phone?: string;
      linkedin?: string;
      confidence?: number;
    }) => {
      const result = personSchema.safeParse(person);
      if (!result.success) throw new Error(result.error.errors[0]?.message || 'Invalid person data');
      const { error } = await supabase
        .from('people')
        .insert([person]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-people'] });
      toast({ title: 'Person created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating person', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (company: {
      name: string;
      domain?: string;
      industry?: string;
      size?: string;
      is_tracked?: boolean;
    }) => {
      const result = companySchema.safeParse(company);
      if (!result.success) throw new Error(result.error.errors[0]?.message || 'Invalid company data');
      const { error } = await supabase
        .from('companies')
        .insert([company]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      toast({ title: 'Company created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating company', description: error.message, variant: 'destructive' });
    },
  });
}
