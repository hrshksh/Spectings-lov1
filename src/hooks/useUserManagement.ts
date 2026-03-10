import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];
type SubscriptionPlan = Database['public']['Enums']['subscription_plan'];

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  roles: AppRole[];
  subscription_plan: SubscriptionPlan;
  is_active: boolean;
  subscription_ends_at: string | null;
}

export function useUsers() {
  const queryClient = useQueryClient();

  // Realtime subscription for profiles changes
  useEffect(() => {
    const channel = supabase
      .channel('admin-realtime-profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Map roles to users
      const usersWithRoles: UserWithRoles[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        subscription_plan: profile.subscription_plan,
        is_active: profile.is_active,
        subscription_ends_at: profile.subscription_ends_at,
        roles: (userRoles || [])
          .filter(r => r.user_id === profile.id)
          .map(r => r.role),
      }));

      return usersWithRoles;
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Role assigned successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error assigning role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Role removed successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error removing role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function usePeople() {
  return useQuery({
    queryKey: ['admin-people'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useOrganizations() {
  return useQuery({
    queryKey: ['admin-organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCompanyEvents() {
  return useQuery({
    queryKey: ['admin-company-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_events')
        .select(`
          *,
          company:companies(name)
        `)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data;
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
      phone?: string;
      company?: string;
      role?: string;
      linkedin?: string;
      tags?: string[];
      confidence?: number;
    }) => {
      const result = personSchema.safeParse(person);
      if (!result.success) throw new Error(result.error.errors[0]?.message || 'Invalid person data');
      const { error } = await supabase.from('people').insert(person);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-people'] });
      toast({ title: 'Person created successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating person',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (personId: string) => {
      const { error } = await supabase.from('people').delete().eq('id', personId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-people'] });
      toast({ title: 'Person deleted successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting person',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (org: { name: string; industry?: string }) => {
      const result = organizationSchema.safeParse(org);
      if (!result.success) throw new Error(result.error.errors[0]?.message || 'Invalid organization data');
      const { error } = await supabase.from('organizations').insert(org);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      toast({ title: 'Organization created successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating organization',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orgId: string) => {
      const { error } = await supabase.from('organizations').delete().eq('id', orgId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      toast({ title: 'Organization deleted successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting organization',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useCreateCompanyEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (event: {
      company_id: string;
      event_type: Database['public']['Enums']['company_event_type'];
      summary?: string;
      confidence?: number;
      published_at?: string;
    }) => {
      const { error } = await supabase.from('company_events').insert(event);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-company-events'] });
      queryClient.invalidateQueries({ queryKey: ['company-events'] });
      toast({ title: 'Event created successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating event',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteCompanyEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.from('company_events').delete().eq('id', eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-company-events'] });
      queryClient.invalidateQueries({ queryKey: ['company-events'] });
      toast({ title: 'Event deleted successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting event',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Leads hooks
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

export function useCreateLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lead: {
      person_id: string;
      notes?: string;
      source?: string;
      status?: Database['public']['Enums']['lead_status'];
      organization_id?: string;
      quality_score?: number;
    }) => {
      const { error } = await supabase.from('leads').insert(lead);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-for-user'] });
      toast({ title: 'Lead created successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating lead',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase.from('leads').delete().eq('id', leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-for-user'] });
      toast({ title: 'Lead deleted successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting lead',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: Database['public']['Enums']['lead_status'] }) => {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status,
          verified_at: status === 'verified' ? new Date().toISOString() : null,
        })
        .eq('id', leadId);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-for-user'] });
      toast({ title: `Lead ${status}` });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating lead status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdatePersonTags() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ personId, tags }: { personId: string; tags: string[] }) => {
      const { error } = await supabase
        .from('people')
        .update({ tags })
        .eq('id', personId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-people'] });
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-for-user'] });
      queryClient.invalidateQueries({ queryKey: ['available-tags'] });
      toast({ title: 'Tags updated successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating tags',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
