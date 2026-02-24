import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const PROSPECT_SUBSECTIONS = [
  { key: 'for_sales', label: 'For Sales', path: '/prospects/for-sales' },
  { key: 'for_hiring', label: 'For Hiring', path: '/prospects/for-hiring' },
  { key: 'for_growth', label: 'For Growth', path: '/prospects/for-growth' },
] as const;

export type ProspectSubsection = typeof PROSPECT_SUBSECTIONS[number]['key'];

export function getPlanMaxSelections(plan: string): number {
  switch (plan) {
    case 'essential': return 1; // Basic
    case 'growth': return 2;   // Core
    case 'agency': return 3;   // Elite
    case 'enterprise': return 3;
    default: return 0; // free
  }
}

// Map internal plan names to display names
export const PLAN_DISPLAY_NAMES: Record<string, string> = {
  free: 'Free',
  essential: 'Basic',
  growth: 'Core',
  agency: 'Elite',
  enterprise: 'Enterprise',
};

export function useProspectSelections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['prospect-selections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('prospect_selections' as any)
        .select('subsection')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data as any[])?.map((d: any) => d.subsection as string) ?? [];
    },
    enabled: !!user?.id,
  });
}

export function useUpdateProspectSelections() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (selections: string[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      // Delete all existing
      await supabase
        .from('prospect_selections' as any)
        .delete()
        .eq('user_id', user.id);
      // Insert new
      if (selections.length > 0) {
        const rows = selections.map(s => ({ user_id: user.id, subsection: s }));
        const { error } = await supabase
          .from('prospect_selections' as any)
          .insert(rows as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospect-selections'] });
      toast.success('Prospect sections updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
