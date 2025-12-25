import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';
type EvidenceStatus = 'pending' | 'parsed' | 'published' | 'rejected';

export function useTasks() {
  return useQuery({
    queryKey: ['admin-tasks'],
    queryFn: async () => {
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
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
  return useQuery({
    queryKey: ['admin-evidence'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raw_evidence')
        .select('*')
        .order('ingested_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useLeads() {
  return useQuery({
    queryKey: ['admin-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          person:people(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCompanies() {
  return useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [tasksResult, evidenceResult] = await Promise.all([
        supabase.from('tasks').select('status', { count: 'exact' }),
        supabase.from('raw_evidence').select('status', { count: 'exact' }),
      ]);
      
      const tasks = tasksResult.data || [];
      const evidence = evidenceResult.data || [];
      
      return {
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
        completedToday: tasks.filter(t => t.status === 'completed').length,
        needsReview: evidence.filter(e => e.status === 'pending').length,
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
      toast({ title: 'Lead updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating lead', description: error.message, variant: 'destructive' });
    },
  });
}
