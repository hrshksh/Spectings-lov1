import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from 'sonner';

// --- Organization ---
export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orgId, name, industry }: { orgId: string; name: string; industry: string }) => {
      const { error } = await supabase
        .from('organizations')
        .update({ name, industry })
        .eq('id', orgId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-organization'] });
      toast.success('Organization details saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// --- Competitors (companies with is_tracked) ---
export function useTrackedCompetitors(orgId: string | null) {
  return useQuery({
    queryKey: ['tracked-competitors', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, is_tracked')
        .eq('organization_id', orgId)
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!orgId,
  });
}

export function useToggleCompetitorTracking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_tracked }: { id: string; is_tracked: boolean }) => {
      const { error } = await supabase.from('companies').update({ is_tracked }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tracked-competitors'] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAddCompetitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, orgId }: { name: string; orgId: string }) => {
      const { error } = await supabase
        .from('companies')
        .insert({ name, organization_id: orgId, is_tracked: true });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracked-competitors'] });
      toast.success('Competitor added');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCompetitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracked-competitors'] });
      toast.success('Competitor removed');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// --- Alert Preferences ---
const ALERT_TYPES = ['competitor_events', 'trend_spikes', 'negative_sentiment', 'new_leads'];

export function useAlertPreferences() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['alert-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return {};
      const { data, error } = await supabase
        .from('alert_preferences' as any)
        .select('alert_type, enabled')
        .eq('user_id', user.id);
      if (error) throw error;
      const map: Record<string, boolean> = {};
      ALERT_TYPES.forEach(t => (map[t] = true)); // default all on
      (data as any[])?.forEach((r: any) => (map[r.alert_type] = r.enabled));
      return map;
    },
    enabled: !!user?.id,
  });
}

export function useToggleAlert() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ alertType, enabled }: { alertType: string; enabled: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('alert_preferences' as any)
        .upsert({ user_id: user.id, alert_type: alertType, enabled } as any, { onConflict: 'user_id,alert_type' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alert-preferences'] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

// --- Profile / Billing ---
export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

// --- Team Members ---
export function useTeamMembers(orgId: string | null) {
  return useQuery({
    queryKey: ['team-members', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data: members, error: mErr } = await supabase
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', orgId);
      if (mErr) throw mErr;
      if (!members?.length) return [];

      const userIds = members.map(m => m.user_id);
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .in('id', userIds);
      if (pErr) throw pErr;

      // Get roles
      const { data: roles, error: rErr } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const roleMap: Record<string, string[]> = {};
      (roles ?? []).forEach(r => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r.role);
      });

      return (profiles ?? []).map(p => ({
        ...p,
        roles: roleMap[p.id] ?? ['customer_user'],
        primaryRole: roleMap[p.id]?.[0] ?? 'customer_user',
      }));
    },
    enabled: !!orgId,
  });
}
