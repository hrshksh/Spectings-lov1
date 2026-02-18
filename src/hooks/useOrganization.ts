import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useOrganization() {
  const { user } = useAuth();

  const { data: membership, isLoading } = useQuery({
    queryKey: ['user-organization', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('organization_members')
        .select('organization_id, organizations(id, name, industry, slug, size, country)')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // cache for 5 min to reduce load
  });

  return {
    organizationId: membership?.organization_id ?? null,
    organization: membership?.organizations ?? null,
    isLoading,
  };
}
