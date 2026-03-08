import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/** Fetch saved record IDs for a given source type */
export function useSavedItemIds(sourceType: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['saved-items', sourceType, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('saved_items')
        .select('record_id')
        .eq('user_id', user.id)
        .eq('source_type', sourceType);
      if (error) throw error;
      return data.map(d => d.record_id);
    },
    enabled: !!user?.id,
  });
}

/** Toggle save/unsave a record */
export function useToggleSave() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ recordId, sourceType, isSaved }: { recordId: string; sourceType: string; isSaved: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (isSaved) {
        await supabase.from('saved_items').delete().eq('user_id', user.id).eq('record_id', recordId).eq('source_type', sourceType);
      } else {
        const { error } = await supabase.from('saved_items').insert({ user_id: user.id, record_id: recordId, source_type: sourceType });
        if (error) throw error;
      }
    },
    onSuccess: (_, { sourceType }) => {
      queryClient.invalidateQueries({ queryKey: ['saved-items', sourceType] });
      queryClient.invalidateQueries({ queryKey: ['saved-items-all'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Fetch all saved items for the current user */
export function useAllSavedItems() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['saved-items-all', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

/** Bulk remove saved items */
export function useBulkRemoveSaved() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (recordIds: string[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('saved_items')
        .delete()
        .eq('user_id', user.id)
        .in('record_id', recordIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-items-all'] });
      queryClient.invalidateQueries({ queryKey: ['saved-items'] });
      toast.success('Items removed from list');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
