import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// All assignable sections (Lists is always accessible, not listed here)
export const ASSIGNABLE_SECTIONS = [
  { key: 'prospects', label: 'Prospects' },
  { key: 'inspects', label: 'Inspects' },
  { key: 'perspects', label: 'Perspects' },
] as const;

export const PROSPECT_SUBSECTIONS = [
  { key: 'for_sales', label: 'For Sales', path: '/prospects/for-sales' },
  { key: 'for_hiring', label: 'For Hiring', path: '/prospects/for-hiring' },
  { key: 'for_growth', label: 'For Growth', path: '/prospects/for-growth' },
] as const;

export type AssignableSection = typeof ASSIGNABLE_SECTIONS[number]['key'];
export type ProspectSubsection = typeof PROSPECT_SUBSECTIONS[number]['key'];

/** Fetch the current user's assigned sections */
export function useUserSectionAccess() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user-section-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_section_access')
        .select('section')
        .eq('user_id', user.id);
      if (error) throw error;
      return data?.map(d => d.section) ?? [];
    },
    enabled: !!user?.id,
  });
}

/** Fetch a specific user's sections (for admin) */
export function useUserSectionAccessById(userId: string | null) {
  return useQuery({
    queryKey: ['user-section-access', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_section_access')
        .select('section')
        .eq('user_id', userId);
      if (error) throw error;
      return data?.map(d => d.section) ?? [];
    },
    enabled: !!userId,
  });
}

/** Admin: update a user's section access */
export function useUpdateUserSectionAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, sections }: { userId: string; sections: string[] }) => {
      // Delete all existing
      await supabase
        .from('user_section_access')
        .delete()
        .eq('user_id', userId);
      // Insert new
      if (sections.length > 0) {
        const rows = sections.map(s => ({ user_id: userId, section: s }));
        const { error } = await supabase
          .from('user_section_access')
          .insert(rows);
        if (error) throw error;
      }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-section-access', userId] });
      queryClient.invalidateQueries({ queryKey: ['all-user-section-access'] });
      toast.success('Section access updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Admin: fetch all users' section access at once */
export function useAllUserSectionAccess() {
  return useQuery({
    queryKey: ['all-user-section-access'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_section_access')
        .select('user_id, section');
      if (error) throw error;
      const map: Record<string, string[]> = {};
      data?.forEach(d => {
        if (!map[d.user_id]) map[d.user_id] = [];
        map[d.user_id].push(d.section);
      });
      return map;
    },
  });
}

/** Check if user has access to a specific section */
export function hasSection(sections: string[], section: string): boolean {
  return sections.includes(section);
}

/** Check if user has access to a prospect subsection (needs both 'prospects' and the subsection) */
export function hasProspectSubsection(sections: string[], subsection: string): boolean {
  return sections.includes('prospects') && sections.includes(subsection);
}
