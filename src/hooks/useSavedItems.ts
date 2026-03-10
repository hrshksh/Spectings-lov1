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

/** Toggle save/unsave a record with optimistic updates */
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
    onMutate: async ({ recordId, sourceType, isSaved }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['saved-items', sourceType, user?.id] });
      await queryClient.cancelQueries({ queryKey: ['saved-items-all', user?.id] });

      // Snapshot previous values
      const previousIds = queryClient.getQueryData<string[]>(['saved-items', sourceType, user?.id]);
      const previousAll = queryClient.getQueryData(['saved-items-all', user?.id]);

      // Optimistically update the saved IDs list
      queryClient.setQueryData<string[]>(['saved-items', sourceType, user?.id], (old = []) =>
        isSaved ? old.filter(id => id !== recordId) : [...old, recordId]
      );

      return { previousIds, previousAll };
    },
    onError: (err: Error, { sourceType }, context) => {
      // Revert on error
      if (context?.previousIds !== undefined) {
        queryClient.setQueryData(['saved-items', sourceType, user?.id], context.previousIds);
      }
      if (context?.previousAll !== undefined) {
        queryClient.setQueryData(['saved-items-all', user?.id], context.previousAll);
      }
      toast.error(err.message);
    },
    onSettled: (_, __, { sourceType }) => {
      queryClient.invalidateQueries({ queryKey: ['saved-items', sourceType] });
      queryClient.invalidateQueries({ queryKey: ['saved-items-all'] });
    },
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

/** Bulk remove saved items with optimistic updates */
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
    onMutate: async (recordIds) => {
      await queryClient.cancelQueries({ queryKey: ['saved-items-all', user?.id] });
      const previousAll = queryClient.getQueryData<any[]>(['saved-items-all', user?.id]);
      
      // Optimistically remove items
      queryClient.setQueryData<any[]>(['saved-items-all', user?.id], (old = []) =>
        old.filter(item => !recordIds.includes(item.record_id))
      );

      return { previousAll };
    },
    onError: (err: Error, _, context) => {
      if (context?.previousAll !== undefined) {
        queryClient.setQueryData(['saved-items-all', user?.id], context.previousAll);
      }
      toast.error(err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-items-all'] });
      queryClient.invalidateQueries({ queryKey: ['saved-items'] });
    },
    onSuccess: () => {
      toast.success('Items removed from list');
    },
  });
}
