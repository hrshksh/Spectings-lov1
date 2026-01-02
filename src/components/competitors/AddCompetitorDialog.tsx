import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Loader2 } from 'lucide-react';

interface AddCompetitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const industries = [
  'Technology',
  'Software',
  'Data Analytics',
  'Cloud Services',
  'FinTech',
  'Healthcare',
  'E-commerce',
  'SaaS',
  'AI/ML',
  'Cybersecurity',
  'Other'
];

const companySizes = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5001-10000',
  '10000+'
];

export function AddCompetitorDialog({ open, onOpenChange }: AddCompetitorDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    industry: '',
    size: '',
    founded: '',
    description: ''
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('companies').insert({
        name: data.name.trim(),
        domain: data.domain.trim() || null,
        industry: data.industry || null,
        size: data.size || null,
        founded: data.founded ? parseInt(data.founded) : null,
        description: data.description.trim() || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: 'Competitor added',
        description: `${formData.name} has been added to your tracking list.`
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add competitor',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleClose = () => {
    setFormData({
      name: '',
      domain: '',
      industry: '',
      size: '',
      founded: '',
      description: ''
    });
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter the competitor name.',
        variant: 'destructive'
      });
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Add Competitor</DialogTitle>
              <DialogDescription>
                Add a new company to track their activities.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid gap-4">
            {/* Name - Required */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Acme Corporation"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={mutation.isPending}
              />
            </div>

            {/* Domain */}
            <div className="grid gap-2">
              <Label htmlFor="domain">Website Domain</Label>
              <Input
                id="domain"
                placeholder="e.g., acme.com"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                disabled={mutation.isPending}
              />
            </div>

            {/* Industry & Size Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                  disabled={mutation.isPending}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="size">Company Size</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) => setFormData({ ...formData, size: value })}
                  disabled={mutation.isPending}
                >
                  <SelectTrigger id="size">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>{size} employees</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Founded */}
            <div className="grid gap-2">
              <Label htmlFor="founded">Year Founded</Label>
              <Input
                id="founded"
                type="number"
                placeholder="e.g., 2015"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.founded}
                onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                disabled={mutation.isPending}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the company..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={mutation.isPending}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Competitor'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
