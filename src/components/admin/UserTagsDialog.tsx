import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, Loader2, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface UserTagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

// Fetch user's tags
function useUserTags(userId: string) {
  return useQuery({
    queryKey: ['user-tags-admin', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_tags')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

// Fetch all unique tags from people table for suggestions
function useAvailableTags() {
  return useQuery({
    queryKey: ['available-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people')
        .select('tags');
      
      if (error) throw error;
      
      const tags = new Set<string>();
      data.forEach(person => {
        person.tags?.forEach(tag => tags.add(tag));
      });
      return Array.from(tags).sort();
    },
  });
}

export function UserTagsDialog({ open, onOpenChange, userId, userName }: UserTagsDialogProps) {
  const [newTag, setNewTag] = useState('');
  const queryClient = useQueryClient();
  
  const { data: userTags = [], isLoading } = useUserTags(userId);
  const { data: availableTags = [] } = useAvailableTags();
  
  const addTag = useMutation({
    mutationFn: async (tag: string) => {
      const { error } = await supabase
        .from('user_tags')
        .insert({ user_id: userId, tag: tag.trim() });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tags-admin', userId] });
      setNewTag('');
      toast({ title: 'Tag added successfully' });
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast({ title: 'Tag already assigned', variant: 'destructive' });
      } else {
        toast({ title: 'Failed to add tag', description: error.message, variant: 'destructive' });
      }
    },
  });
  
  const removeTag = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from('user_tags')
        .delete()
        .eq('id', tagId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tags-admin', userId] });
      toast({ title: 'Tag removed' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to remove tag', description: error.message, variant: 'destructive' });
    },
  });

  const handleAddTag = (tag: string) => {
    if (tag.trim()) {
      addTag.mutate(tag.trim());
    }
  };

  const userTagNames = userTags.map(t => t.tag);
  const suggestedTags = availableTags.filter(tag => !userTagNames.includes(tag));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Manage Tags for {userName}
          </DialogTitle>
          <DialogDescription>
            Assign tags to control which leads this user can see.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current tags */}
          <div>
            <Label className="text-sm font-medium">Assigned Tags</Label>
            <div className="flex flex-wrap gap-1.5 mt-2 min-h-[32px]">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : userTags.length > 0 ? (
                userTags.map(tag => (
                  <Badge 
                    key={tag.id} 
                    variant="default"
                    className="cursor-pointer group"
                    onClick={() => removeTag.mutate(tag.id)}
                  >
                    {tag.tag}
                    <X className="ml-1 h-3 w-3 opacity-60 group-hover:opacity-100" />
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No tags assigned</span>
              )}
            </div>
          </div>

          {/* Add new tag */}
          <div>
            <Label className="text-sm font-medium">Add Tag</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Enter tag name..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(newTag);
                  }
                }}
              />
              <Button 
                size="sm" 
                onClick={() => handleAddTag(newTag)}
                disabled={!newTag.trim() || addTag.isPending}
              >
                {addTag.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Suggested tags */}
          {suggestedTags.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Available Tags (from leads)</Label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {suggestedTags.slice(0, 15).map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleAddTag(tag)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {suggestedTags.length > 15 && (
                  <Badge variant="secondary">+{suggestedTags.length - 15} more</Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}