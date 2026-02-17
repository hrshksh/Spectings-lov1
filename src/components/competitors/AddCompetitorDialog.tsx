import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Loader2, Search, Plus, Check } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Company = Tables<'companies'>;

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
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    industry: '',
    size: '',
    founded: '',
    description: ''
  });

  // Fetch all untracked companies for search
  const { data: untrackedCompanies = [], isLoading: searchLoading } = useQuery({
    queryKey: ['companies', 'untracked', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select('*')
        .eq('is_tracked', false)
        .order('name');
      
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,domain.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data as Company[];
    },
    enabled: open && activeTab === 'search'
  });

  // Mutation to track an existing company
  const trackMutation = useMutation({
    mutationFn: async (companyId: string) => {
      const { error } = await supabase
        .from('companies')
        .update({ is_tracked: true })
        .eq('id', companyId);
      if (error) throw error;
    },
    onSuccess: (_, companyId) => {
      const company = untrackedCompanies.find(c => c.id === companyId);
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: 'Now tracking',
        description: `${company?.name || 'Company'} has been added to your tracking list.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to track company',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation to create a new company
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // organization_id is set automatically by RLS context
      const { error } = await supabase.from('companies').insert({
        name: data.name.trim(),
        domain: data.domain.trim() || null,
        industry: data.industry || null,
        size: data.size || null,
        founded: data.founded ? parseInt(data.founded) : null,
        description: data.description.trim() || null,
        is_tracked: true,
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
    setSearchQuery('');
    setActiveTab('search');
    onOpenChange(false);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter the competitor name.',
        variant: 'destructive'
      });
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Add Competitor</DialogTitle>
              <DialogDescription>
                Search existing companies or create a new one to track.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              Search Companies
            </TabsTrigger>
            <TabsTrigger value="create">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </TabsTrigger>
          </TabsList>
          
          {/* Search Tab */}
          <TabsContent value="search" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company name or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <ScrollArea className="h-[300px] rounded-md border">
              {searchLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : untrackedCompanies.length > 0 ? (
                <div className="divide-y">
                  {untrackedCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-3 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{company.name}</p>
                          <div className="flex items-center gap-2">
                            {company.domain && (
                              <span className="text-xs text-muted-foreground">{company.domain}</span>
                            )}
                            {company.industry && (
                              <Badge variant="secondary" className="text-[10px]">{company.industry}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => trackMutation.mutate(company.id)}
                        disabled={trackMutation.isPending}
                        className="flex-shrink-0"
                      >
                        {trackMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Track
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <Building2 className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No companies found matching your search' : 'No untracked companies available'}
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2"
                    onClick={() => setActiveTab('create')}
                  >
                    Create a new company
                  </Button>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          {/* Create Tab */}
          <TabsContent value="create" className="mt-4">
            <form onSubmit={handleCreateSubmit} className="space-y-4">
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
                    disabled={createMutation.isPending}
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
                    disabled={createMutation.isPending}
                  />
                </div>

                {/* Industry & Size Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => setFormData({ ...formData, industry: value })}
                      disabled={createMutation.isPending}
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
                      disabled={createMutation.isPending}
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
                    disabled={createMutation.isPending}
                  />
                </div>

                {/* Description */}
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the company..."
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={createMutation.isPending}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add & Track'
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
