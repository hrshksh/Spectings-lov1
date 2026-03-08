import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AddCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCompanyDialog({ open, onOpenChange }: AddCompanyDialogProps) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      const trimmedName = name.trim();
      if (!trimmedName) throw new Error('Company name is required');

      // Check if company already exists (case-insensitive)
      const { data: existing } = await supabase
        .from('companies')
        .select('id, name')
        .ilike('name', trimmedName)
        .limit(1);

      if (existing && existing.length > 0) {
        // Company already exists — no need to insert
        toast.info(`"${existing[0].name}" is already being tracked`);
        return { alreadyExists: true };
      }

      const { data: orgId } = await supabase.rpc('get_user_org_id', { _user_id: (await supabase.auth.getUser()).data.user!.id });

      const { error } = await supabase.from('companies').insert({
        name: trimmedName,
        domain: domain.trim() || null,
        is_tracked: true,
        organization_id: orgId,
      });
      if (error) throw error;
      return { alreadyExists: false };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['inspects-events'] });
      queryClient.invalidateQueries({ queryKey: ['tracked-competitors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-companies-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-companies'] });
      if (!result?.alreadyExists) {
        toast.success('Company added to tracking');
      }
      handleClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleClose = () => {
    setName('');
    setDomain('');
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Company to Track</DialogTitle>
          <DialogDescription>Enter the company name and website domain to start tracking.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-domain">Website Domain</Label>
            <Input
              id="company-domain"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              placeholder="e.g. acme.com"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || !name.trim()}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Add Company
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
